import os
import time
import subprocess

dataset_dir = r"e:\Disease Prediction\backend\datasets"
model_script = r"e:\Disease Prediction\backend\models\train_image_model.py"
app_script = r"e:\Disease Prediction\backend\app.py"

print("Starting to download the full dataset from Google Drive (this might take 15-20 minutes)...")
subprocess.run(["python", "-c", "import gdown; gdown.download_folder(id='1HjK_eyaXtfeUV7tpKO8nTDL80zK9_Mkr', quiet=True, use_cookies=False)"], cwd=dataset_dir)

print("\nDownload complete. Starting to train the MobileNetV2 image model on the full dataset...")
subprocess.run(["python", model_script])

print("\nTraining complete. Triggering Flask server reload...")
with open(app_script, "a") as f:
    f.write("\n# Trigger reload\n")

print("Pipeline finished successfully.")
