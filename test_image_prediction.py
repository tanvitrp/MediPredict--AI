import requests
import numpy as np
from PIL import Image
import io
import os

# Create a simple test image
test_image = Image.new('RGB', (224, 224), color=(100, 150, 120))
test_image_bytes = io.BytesIO()
test_image.save(test_image_bytes, format='PNG')
test_image_bytes.seek(0)

# Upload and test image prediction
try:
    response = requests.post(
        'http://127.0.0.1:5000/api/predict/image',
        files={'file': ('test_image.png', test_image_bytes, 'image/png')},
        data={'username': 'test_user'}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
except Exception as e:
    print(f"Error: {e}")
