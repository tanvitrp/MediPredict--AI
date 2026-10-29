import json
import os
import shutil

import numpy as np
import tensorflow as tf
from sklearn.metrics import matthews_corrcoef
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "skin_images")
ROOT_MODEL_PATH = os.path.join(BASE_DIR, "skin_disease_model.h5")
APP_MODEL_PATHS = [
    os.path.join(BASE_DIR, "project", "backend", "models", "skin_model.h5"),
    os.path.join(BASE_DIR, "backend", "models", "skin_model.h5"),
]
CLASS_INDEX_PATHS = [
    os.path.join(BASE_DIR, "project", "backend", "models", "skin_class_indices.json"),
    os.path.join(BASE_DIR, "backend", "models", "skin_class_indices.json"),
]

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
HEAD_EPOCHS = 12
FINE_TUNE_EPOCHS = 18
SEED = 42


def build_model(num_classes):
    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(*IMAGE_SIZE, 3),
    )
    base_model.trainable = False

    x = GlobalAveragePooling2D()(base_model.output)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.45)(x)
    output = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=output)
    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model, base_model


def make_generators():
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=0.2,
        rotation_range=25,
        width_shift_range=0.12,
        height_shift_range=0.12,
        zoom_range=0.2,
        shear_range=0.08,
        horizontal_flip=True,
        brightness_range=(0.82, 1.18),
        fill_mode="nearest",
    )
    validation_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=0.2,
    )

    train_data = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        seed=SEED,
    )
    validation_data = validation_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=SEED,
    )
    return train_data, validation_data


def make_class_weights(train_data):
    class_ids = np.unique(train_data.classes)
    weights = compute_class_weight(
        class_weight="balanced",
        classes=class_ids,
        y=train_data.classes,
    )
    return {int(class_id): float(weight) for class_id, weight in zip(class_ids, weights)}


def compute_validation_mcc(model, validation_data):
    try:
        print("Calculating Matthews Correlation Coefficient (MCC) on validation data...")
        val_preds_probs = model.predict(validation_data)
        val_preds = np.argmax(val_preds_probs, axis=1)
        val_labels = validation_data.classes
        return matthews_corrcoef(val_labels, val_preds)
    except Exception as e:
        print(f"Failed to calculate MCC: {e}")
        return None


def save_class_indices(class_indices):
    for path in CLASS_INDEX_PATHS:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(class_indices, f, indent=2, sort_keys=True)


def copy_model_to_apps():
    for path in APP_MODEL_PATHS:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        shutil.copy2(ROOT_MODEL_PATH, path)
        print(f"Copied trained model to {path}")


def train():
    if not os.path.isdir(DATASET_PATH):
        raise FileNotFoundError(f"Dataset folder not found: {DATASET_PATH}")

    train_data, validation_data = make_generators()
    class_weights = make_class_weights(train_data)
    save_class_indices(train_data.class_indices)

    print("Class order:", train_data.class_indices)
    print("Class weights:", class_weights)

    model, base_model = build_model(train_data.num_classes)
    callbacks = [
        ModelCheckpoint(
            ROOT_MODEL_PATH,
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=6,
            restore_best_weights=True,
            verbose=1,
        ),
    ]

    print("Training classifier head...")
    model.fit(
        train_data,
        validation_data=validation_data,
        epochs=HEAD_EPOCHS,
        callbacks=callbacks,
        class_weight=class_weights,
    )

    print("Fine tuning top MobileNetV2 layers...")
    base_model.trainable = True
    for layer in base_model.layers[:-35]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(
        train_data,
        validation_data=validation_data,
        epochs=HEAD_EPOCHS + FINE_TUNE_EPOCHS,
        initial_epoch=HEAD_EPOCHS,
        callbacks=callbacks,
        class_weight=class_weights,
    )

    model.save(ROOT_MODEL_PATH)

    mcc = compute_validation_mcc(model, validation_data)
    if mcc is not None:
        print(f"Validation Matthews Correlation Coefficient (MCC): {mcc:.4f}")

    copy_model_to_apps()
    print(f"Training complete. Final model saved to {ROOT_MODEL_PATH}")


if __name__ == "__main__":
    train()
