import os
import torch
import numpy as np
from torch.utils.data import Dataset
from PIL import Image
import config

class OCTDataset(Dataset):
    def __init__(self, subset='train', transform=None):
        self.img_dir = os.path.join(config.PROCESSED_DATA_DIR, 'images', subset)
        self.mask_dir = os.path.join(config.PROCESSED_DATA_DIR, 'masks', subset)
        self.transform = transform
        
        # Mapping nhãn từ tên file
        self.class_map = {'AMD': 0, 'DME': 1, 'NORMAL': 2}
        
        if os.path.exists(self.img_dir):
            self.images = sorted([f for f in os.listdir(self.img_dir) if f.endswith('.png')])
        else:
            self.images = []

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_name = self.images[idx]
        img_path = os.path.join(self.img_dir, img_name)
        mask_path = os.path.join(self.mask_dir, img_name)

        # 1. Đọc ảnh
        image = Image.open(img_path).convert("L")
        mask = Image.open(mask_path).convert("L")
        
        image = np.array(image) / 255.0
        mask = np.array(mask) / 255.0
        mask = (mask > 0.5).astype(np.float32)

        image = torch.from_numpy(image).float().unsqueeze(0)
        mask = torch.from_numpy(mask).float().unsqueeze(0)
        
        # 2. XỬ LÝ NHÃN (LABEL PARSING)
        # Mặc định là -1 (Ignore) cho bộ Chiu
        label = -1 
        
        if "Srinivasan" in img_name:
            # File tên dạng: Srinivasan_AMD_AMD1_01.png
            for class_name, class_idx in self.class_map.items():
                if f"_{class_name}_" in img_name:
                    label = class_idx
                    break
            
            # Nếu là ảnh Srinivasan, Mask là giả (đen xì) -> Đánh dấu để Loss Function biết mà bỏ qua
            # Ta dùng một cờ (flag) hoặc quy ước đặc biệt. 
            # Ở đây ta tạm chấp nhận mask đen.
        
        return image, mask, label