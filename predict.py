import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Load trained model
model = load_model("skin_disease_model.h5")

# Disease labels
class_names = ['AK', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'SCC', 'VASC']

# Load image
img_path = "test.jpg"   # Put your test image here

img = image.load_img(img_path, target_size=(224,224))

img_array = image.img_to_array(img)

img_array = np.expand_dims(img_array, axis=0)

img_array = img_array / 255.0

# Predict
prediction = model.predict(img_array)

predicted_class = class_names[np.argmax(prediction)]

print("Predicted Disease:", predicted_class)