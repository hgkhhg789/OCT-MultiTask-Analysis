import os
import cv2
import torch
import glob
import numpy as np
from torch.utils.data import Dataset

class UnifiedOCTDataset(Dataset):
    def __init__(self, chiu_dir, srinivasan_dir, img_size=256, subset='train'):
        """
        chiu_dir: Đường dẫn bộ Chiu (Có Mask, Label mặc định là DME)
        duke_dir: Đường dẫn bộ Srinivasan (Không Mask, Có Label đa dạng)
        """
        self.img_size = img_size
        self.samples = [] # Danh sách chứa tất cả dữ liệu
        
        # Định nghĩa nhãn: AMD=0, DME=1, NORMAL=2
        self.class_map = {'AMD': 0, 'DME': 1, 'NORMAL': 2}
        
        # --- 1. LOAD DỮ LIỆU CHIU (SEGMENTATION FOCUS) ---
        if os.path.exists(chiu_dir):
            chiu_img_dir = os.path.join(chiu_dir, 'images')
            chiu_mask_dir = os.path.join(chiu_dir, 'masks')
            chiu_files = sorted(os.listdir(chiu_img_dir))
            
            for f in chiu_files:
                self.samples.append({
                    'img_path': os.path.join(chiu_img_dir, f),
                    'mask_path': os.path.join(chiu_mask_dir, f),
                    'label': 1,       # Chiu 2015 toàn là DME (Class 1)
                    'source': 'chiu'  # Đánh dấu nguồn
                })
            print(f"--> Đã nạp {len(chiu_files)} ảnh từ bộ Chiu (Có Mask).")
            
        # --- 2. LOAD DỮ LIỆU DUKE (CLASSIFICATION FOCUS) ---
        if os.path.exists(srinivasan_dir):
            count_duke = 0
            for cls_name, label_idx in self.class_map.items():
                cls_folder = os.path.join(srinivasan_dir, cls_name)
                if not os.path.exists(cls_folder): continue
                
                # Lấy ảnh png
                files = glob.glob(os.path.join(cls_folder, "*.png"))
                for f_path in files:
                    self.samples.append({
                        'img_path': f_path,
                        'mask_path': None, # Duke không có mask
                        'label': label_idx,
                        'source': 'duke'
                    })
                    count_duke += 1
            print(f"--> Đã nạp {count_duke} ảnh từ bộ Srinivasan (Duke).")

    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        item = self.samples[idx]
        
        # 1. Đọc ảnh Input
        img = cv2.imread(item['img_path'], cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (self.img_size, self.img_size))
        img = img / 255.0
        img_tensor = torch.tensor(img, dtype=torch.float32).unsqueeze(0)
        
        # 2. Xử lý Mask
        if item['mask_path'] is not None:
            # Nếu là Chiu: Đọc mask thật
            mask = cv2.imread(item['mask_path'], cv2.IMREAD_GRAYSCALE)
            mask = cv2.resize(mask, (self.img_size, self.img_size), interpolation=cv2.INTER_NEAREST)
            mask = (mask > 0).astype(np.float32)
            has_mask = 1.0 # Cờ báo: Có mask, hãy tính loss seg
        else:
            # Nếu là Duke: Tạo mask đen xì (giả)
            mask = np.zeros((self.img_size, self.img_size), dtype=np.float32)
            has_mask = 0.0 # Cờ báo: Không có mask, đừng tính loss seg
            
        mask_tensor = torch.tensor(mask, dtype=torch.float32).unsqueeze(0)
        
        # 3. Xử lý Label (Phân loại)
        label_tensor = torch.tensor(item['label'], dtype=torch.long)
        has_mask_tensor = torch.tensor(has_mask, dtype=torch.float32)
        
        # Trả về 4 món: Ảnh, Mask, Nhãn bệnh, Cờ báo có mask hay không
        return img_tensor, mask_tensor, label_tensor, has_mask_tensor