import os
import shutil
import numpy as np
from PIL import Image
from tqdm import tqdm
import config

# Cấu hình đường dẫn gốc
SRINIVASAN_ROOT = os.path.join(config.RAW_DATA_DIR, '2014_BOE_Srinivasan', 'Publication_Dataset')

# Cấu hình chia tập (Mỗi lớp có 15 bệnh nhân: 1-15)
# Train: 1-11, Val: 12-13, Test: 14-15
SPLIT_IDS = {
    'train': range(1, 12),
    'val': range(12, 14),
    'test': range(14, 16)
}

CLASSES = ['AMD', 'DME', 'NORMAL']

def process_srinivasan():
    print(f"--> Đang đọc dữ liệu từ: {SRINIVASAN_ROOT}")
    
    if not os.path.exists(SRINIVASAN_ROOT):
        print("LỖI: Không tìm thấy thư mục gốc. Em hãy kiểm tra lại đường dẫn!")
        return

    total_count = 0
    
    # Duyệt qua từng tập (Train/Val/Test)
    for subset_name, id_range in SPLIT_IDS.items():
        print(f"\n--> Đang xử lý tập {subset_name.upper()}...")
        
        save_img_dir = os.path.join(config.PROCESSED_DATA_DIR, 'images', subset_name)
        save_mask_dir = os.path.join(config.PROCESSED_DATA_DIR, 'masks', subset_name)
        os.makedirs(save_img_dir, exist_ok=True)
        os.makedirs(save_mask_dir, exist_ok=True)
        
        # Duyệt qua từng lớp bệnh (AMD, DME, NORMAL)
        for class_name in CLASSES:
            # Duyệt qua các ID bệnh nhân (VD: AMD1, AMD2...)
            for patient_id in id_range:
                folder_name = f"{class_name}{patient_id}"
                
                # Đường dẫn sâu thăm thẳm của bộ dữ liệu này
                img_folder = os.path.join(SRINIVASAN_ROOT, folder_name, 'TIFFs', '8bitTIFFs')
                
                if not os.path.exists(img_folder):
                    # Thử trường hợp folder tên 'Normal' viết thường/hoa khác nhau
                    continue 
                
                # Lấy tất cả ảnh .tif
                files = sorted([f for f in os.listdir(img_folder) if f.endswith('.tif')])
                
                for filename in files:
                    src_path = os.path.join(img_folder, filename)
                    
                    # 1. Đọc và Resize ảnh
                    try:
                        img = Image.open(src_path).convert('L') # Chuyển xám
                        img = img.resize(config.IMG_SIZE)
                        
                        # 2. Tạo Mask Rỗng (Dummy Mask - Đen xì)
                        # Vì dataset này không có mask, ta tạo ảnh đen để model không bị lỗi code
                        mask = Image.new('L', config.IMG_SIZE, 0)
                        
                        # 3. Đặt tên file chứa NHÃN (Quan trọng cho bước sau)
                        # Format: Srinivasan_{CLASS}_{FOLDER}_{FILENAME}.png
                        # Ví dụ: Srinivasan_AMD_AMD1_01.png
                        new_filename = f"Srinivasan_{class_name}_{folder_name}_{filename.replace('.tif', '.png')}"
                        
                        # 4. Lưu
                        img.save(os.path.join(save_img_dir, new_filename))
                        mask.save(os.path.join(save_mask_dir, new_filename))
                        
                        total_count += 1
                    except Exception as e:
                        print(f"Lỗi file {src_path}: {e}")

    print(f"\n--> HOÀN TẤT! Đã thêm {total_count} ảnh Srinivasan vào kho dữ liệu.")

if __name__ == "__main__":
    process_srinivasan()