import os
import cv2
import glob
from tqdm import tqdm

# --- CẤU HÌNH ---
# Đường dẫn đến folder chứa các thư mục AMD1, DME1...
INPUT_ROOT = r"D:\project\2014_BOE_Srinivasan\Publication_Dataset"

# Đổi tên folder đích theo ý em
OUTPUT_ROOT = r"D:\project\processed_srinivasan"
IMG_SIZE = 256

def process_duke_v3():
    # 1. Tạo các thư mục đích
    for cls in ['AMD', 'DME', 'NORMAL']:
        os.makedirs(os.path.join(OUTPUT_ROOT, cls), exist_ok=True)
    
    print(f"Đang quét dữ liệu từ: {INPUT_ROOT}...")
    
    # Lấy danh sách folder bệnh nhân (AMD1, DME1, ...)
    subfolders = [f.path for f in os.scandir(INPUT_ROOT) if f.is_dir()]
    
    total_count = 0
    
    for folder_path in tqdm(subfolders, desc="Xử lý từng bệnh nhân"):
        folder_name = os.path.basename(folder_path).upper() # Vd: AMD1
        
        # 2. Xác định nhãn bệnh
        if "AMD" in folder_name:
            target_class = "AMD"
        elif "DME" in folder_name:
            target_class = "DME"
        elif "NORMAL" in folder_name:
            target_class = "NORMAL"
        else:
            continue
            
        # 3. KỸ THUẬT QUÉT ĐỆ QUY (RECURSIVE) - QUAN TRỌNG
        # Dấu "**" nghĩa là: Tìm trong folder này VÀ tất cả các folder con bên trong nó
        image_paths = []
        extensions = ['*.tif', '*.tiff', '*.png', '*.jpg']
        
        for ext in extensions:
            # Tạo đường dẫn tìm kiếm: .../AMD1/**/*.tif
            search_pattern = os.path.join(folder_path, "**", ext)
            # recursive=True để kích hoạt chế độ đào sâu
            found_files = glob.glob(search_pattern, recursive=True)
            image_paths.extend(found_files)
            
        # 4. Xử lý ảnh tìm được
        for img_file in image_paths:
            # Bỏ qua các file ảnh MacOS rác (nếu có dấu ._)
            if os.path.basename(img_file).startswith("._"):
                continue

            # Đọc ảnh
            img = cv2.imread(img_file, cv2.IMREAD_GRAYSCALE)
            if img is None: continue
            
            # Resize
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            
            # Đặt tên file: TênBệnhNhan_TênGốc.png
            orig_name = os.path.basename(img_file).split('.')[0]
            save_name = f"{folder_name}_{orig_name}.png"
            
            # Lưu
            save_path = os.path.join(OUTPUT_ROOT, target_class, save_name)
            cv2.imwrite(save_path, img)
            
            total_count += 1

    print(f"\n✅ XỬ LÝ THÀNH CÔNG!")
    print(f"Tổng cộng {total_count} ảnh đã lưu tại: {OUTPUT_ROOT}")

if __name__ == "__main__":
    process_duke_v3()