import pandas as pd
import os
import shutil

# CSV path
csv_path = r"E:\Disease Prediction\project\backend\datasets\archive (1)\ISIC_2019_Training_GroundTruth.csv"

# Image folder
image_folder = r"E:\archive (1)\ISIC_2019_Training_Input\ISIC_2019_Training_Input"

# Output folder
output_folder = r"E:\Disease Prediction\skin_images"

# Read CSV
df = pd.read_csv(csv_path)

copied = 0

# Organize images
for index, row in df.iterrows():

    image_id = row['image']

    # Try all extensions
    possible_extensions = [".jpg", ".jpeg", ".png"]

    for ext in possible_extensions:

        image_name = image_id + ext

        source = os.path.join(image_folder, image_name)

        if os.path.exists(source):

            label = row.iloc[1:].idxmax()

            label_folder = os.path.join(output_folder, label)

            os.makedirs(label_folder, exist_ok=True)

            destination = os.path.join(label_folder, image_name)

            shutil.copy(source, destination)

            copied += 1

            break

print("Total Images Copied:", copied)
print("Dataset Organized Successfully!")