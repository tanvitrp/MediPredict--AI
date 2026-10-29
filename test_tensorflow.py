import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import sys

try:
    print("Starting TensorFlow import...", flush=True)
    import tensorflow as tf
    print(f'TensorFlow loaded: {tf.__version__}', flush=True)
    
    # Try to load the model
    model_path = 'backend/models/skin_model.h5'
    if os.path.exists(model_path):
        print(f'Model file found at {model_path}', flush=True)
        print("Attempting to load model...", flush=True)
        try:
            model = tf.keras.models.load_model(model_path)
            print('Model loaded successfully!', flush=True)
            print(f'Model input shape: {model.input_shape}', flush=True)
        except Exception as load_error:
            print(f'Failed to load model: {load_error}', flush=True)
    else:
        print(f'Model file not found at {model_path}', flush=True)
        
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}', flush=True)
    import traceback
    traceback.print_exc()
