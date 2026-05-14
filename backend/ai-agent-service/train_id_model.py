from ultralytics import YOLO
import os

def check_dataset_ready():
    train_dir = os.path.join('id_dataset', 'images', 'train')
    if not os.path.exists(train_dir) or len(os.listdir(train_dir)) == 0:
        print("Waiting for you to place the 20 images inside 'id_dataset/images/train'...")
        return False
    
    label_dir = os.path.join('id_dataset', 'labels', 'train')
    if not os.path.exists(label_dir) or len(os.listdir(label_dir)) == 0:
        print("Images found, but no label text files found in 'id_dataset/labels/train'. You must label the images first.")
        return False
    return True

def train():
    if not check_dataset_ready():
        return
        
    print("Downloading pretrained YOLOv8 model and starting training...")
    # Load a pretrained YOLO model (n = nano, small and incredibly fast)
    model = YOLO("yolov8n.pt") 

    # Train the model with heavy data augmentation
    # With only 20 images, the augmentations (mosaic, perspective, scale, degrees) are critical 
    # to artificially generate hundreds of possible angles and lighting conditions.
    results = model.train(
        data="dataset.yaml",
        epochs=100,         # Run for 100 passes
        imgsz=640,          # Standard image size for YOLO
        batch=4,            # Tiny batch size since dataset is small
        degrees=15.0,       # Rotate between -15 and 15 degrees
        translate=0.1,      # Shift image 
        scale=0.5,          # Scale up or down
        shear=2.0,          # Skew the ID card slightly (like taking a photo from a bad angle)
        perspective=0.001,  # Add dynamic perspective changes
        mosaic=1.0,         # Very effective for small datasets
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4
    )
    print("\nTraining completely finished!")
    print("The weights you will use for extraction are saved in: runs/detect/train/weights/best.pt")

if __name__ == "__main__":
    train()
