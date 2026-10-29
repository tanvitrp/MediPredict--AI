import pandas as pd
import os

csv_path = r"E:\Disease Prediction\project\backend\datasets\archive (1)\ISIC_2019_Training_GroundTruth.csv"

image_folder = r"E:\Disease Prediction\project\backend\datasets\archive (1)\ISIC_2019_Training_Input"

df = pd.read_csv(csv_path)

# Print first CSV image name
print("CSV Image Name:")
print(df.iloc[0]['image'])

# Print first actual image file
print("\nActual File Name:")
files = os.listdir(image_folder)
print(files[0])