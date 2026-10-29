import os

folder = r"E:\archive (1)\ISIC_2019_Training_Input"

count = 0

for root, dirs, files in os.walk(folder):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            count += 1

print("Total Images:", count)