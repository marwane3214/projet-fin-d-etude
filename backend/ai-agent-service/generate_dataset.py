import os
import cv2
import numpy as np

images_dir = r"id_dataset\images\train"
labels_dir = r"id_dataset\labels\train"

os.makedirs(images_dir, exist_ok=True)
os.makedirs(labels_dir, exist_ok=True)

# Helper function to generate data
def generate_samples(template_path, prefix, num_samples):
    if not os.path.exists(template_path):
        print(f"Template {template_path} not found.")
        return
        
    img = cv2.imread(template_path)
    h, w, _ = img.shape

    # Define approximate bounding boxes (normalized x_center, y_center, width, height)
    # class 0: id_card, class 1: cin_field, class 2: name_field, class 3: date_field
    labels = []
    labels.append("0 0.5 0.5 1.0 1.0") # Entire ID card
    labels.append(f"1 0.8 0.2 0.2 0.05") # Roughly where CIN is
    labels.append(f"2 0.4 0.4 0.4 0.1")  # Roughly Name
    labels.append(f"3 0.4 0.6 0.2 0.05") # Roughly DOB

    label_content = "\n".join(labels)

    for i in range(num_samples):
        # Slightly alter the image to make them mathematically distinct for YOLO
        # Random brightness
        value = np.random.randint(-30, 30)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        hsv = np.array(hsv, dtype=np.float64)
        hsv[:, :, 2] = hsv[:, :, 2] + value
        hsv[:, :, 2][hsv[:, :, 2] > 255] = 255
        hsv[:, :, 2][hsv[:, :, 2] < 0] = 0
        hsv = np.array(hsv, dtype=np.uint8)
        altered_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        
        # Save image
        img_name = f"{prefix}_{i}.jpg"
        cv2.imwrite(os.path.join(images_dir, img_name), altered_img)
        
        # Save exact same label
        label_name = f"{prefix}_{i}.txt"
        with open(os.path.join(labels_dir, label_name), "w") as f:
            f.write(label_content)

print("Synthesizing 10 old variants...")
generate_samples(r"id_dataset\template_old.jpg", "old_id", 10)

print("Synthesizing 10 new variants...")
generate_samples(r"id_dataset\template_new.jpg", "new_id", 10)

print("Dataset generated successfully!")
