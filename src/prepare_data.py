import os
import scipy.io
import numpy as np
from PIL import Image
from tqdm import tqdm
import matplotlib.pyplot as plt
import config

# Cấu hình chia tập dữ liệu
SPLIT_CONFIG = {
    'train': [
        'Subject_01', 'Subject_02', 'Subject_03', 'Subject_04', 
        'Subject_05', 'Subject_06', 'Subject_07', 'Subject_08'
    ],
    'val': ['Subject_09'],
    'test': ['Subject_10']
}

def create_mask_from_layers(layer_data, img_shape):
    """
    Hàm tạo mask từ dữ liệu manualLayers1.
    Shape của layer_data thường là: [Num_Layers, Width] (VD: [8, 768])
    Ta sẽ lấy Layer đầu (0) và Layer cuối (-1) để tô vùng ở giữa.
    """
    mask = np.zeros(img_shape, dtype=np.uint8)
    height, width = img_shape
    
    try:
        # Kiểm tra shape. Nếu shape là (Width, Num_Layers) thì transpose lại
        if layer_data.shape[0] > layer_data.shape[1]: 
             layer_data = layer_data.T
             
        num_layers = layer_data.shape[0]
        
        # Chỉ xử lý nếu có ít nhất 2 đường ranh giới
        if num_layers >= 2:
            # Lấy đường trên cùng (ILM) và đường dưới cùng (RPE/BM)
            top_layer = layer_data[0, :]
            bottom_layer = layer_data[-1, :] 
            
            # Đôi khi dữ liệu bị NaN (Not a Number), thay bằng 0
            top_layer = np.nan_to_num(top_layer).astype(int)
            bottom_layer = np.nan_to_num(bottom_layer).astype(int)
            
            for col in range(width):
                # Vì data gốc có thể width khác width ảnh resize, ta cần scale index
                # Nhưng ở đây ta giả định cắt crop sau, nên tạm thời map 1-1 nếu width khớp
                # Nếu width data khác width ảnh, ta phải min lại
                if col >= layer_data.shape[1]: break
                
                y_top = top_layer[col]
                y_bottom = bottom_layer[col]
                
                # Clip giá trị
                y_top = max(0, min(y_top, height))
                y_bottom = max(0, min(y_bottom, height))
                
                if y_bottom > y_top:
                    mask[y_top:y_bottom, col] = 255
    except Exception as e:
        # print(f"Lỗi tạo mask chi tiết: {e}")
        pass
    return mask

def save_slice(img, mask, save_img_dir, save_mask_dir, filename, slice_idx):
    # Resize về 256x256
    img_pil = Image.fromarray(img).resize(config.IMG_SIZE)
    mask_pil = Image.fromarray(mask).resize(config.IMG_SIZE, resample=Image.NEAREST)
    
    out_name = f"{filename.replace('.mat', '')}_slice_{slice_idx:03d}.png"
    img_pil.save(os.path.join(save_img_dir, out_name))
    mask_pil.save(os.path.join(save_mask_dir, out_name))

def process_dataset():
    source_dir = os.path.join(config.RAW_DATA_DIR, '2015_BOE_Chiu')
    
    # Duyệt qua từng tập (Train/Val/Test)
    for subset_name, subject_list in SPLIT_CONFIG.items():
        print(f"\n--> Đang xử lý tập {subset_name.upper()}...")
        
        save_img_dir = os.path.join(config.PROCESSED_DATA_DIR, 'images', subset_name)
        save_mask_dir = os.path.join(config.PROCESSED_DATA_DIR, 'masks', subset_name)
        os.makedirs(save_img_dir, exist_ok=True)
        os.makedirs(save_mask_dir, exist_ok=True)
        
        count_saved = 0
        
        for subject_name in tqdm(subject_list):
            filename = f"{subject_name}.mat"
            mat_path = os.path.join(source_dir, filename)
            
            if not os.path.exists(mat_path): continue
                
            try:
                mat = scipy.io.loadmat(mat_path)
                images = mat['images']  # [H, W, Depth]
                
                # --- SỬA LỖI KEY Ở ĐÂY ---
                # Ưu tiên lấy manualLayers1
                if 'manualLayers1' in mat:
                    layers = mat['manualLayers1'] # [Layers, W, Depth]
                elif 'layerMaps' in mat:
                    layers = mat['layerMaps']
                else:
                    print(f"Bỏ qua {filename}: Không tìm thấy layer key")
                    continue
                
                num_slices = images.shape[2]
                
                for i in range(num_slices):
                    img_raw = images[:, :, i]
                    layer_raw = layers[:, :, i] # Lấy lớp tương ứng với lát cắt
                    
                    # 1. Chuẩn hóa
                    if np.max(img_raw) == np.min(img_raw): continue
                    img_norm = (img_raw - np.min(img_raw)) / (np.max(img_raw) - np.min(img_raw)) * 255.0
                    img_uint8 = img_norm.astype(np.uint8)
                    
                    # 2. Tạo Mask
                    mask_uint8 = create_mask_from_layers(layer_raw, img_raw.shape)
                    
                    # 3. Chỉ lưu nếu mask hợp lệ (có vùng trắng > 500 pixel)
                    if np.sum(mask_uint8 > 0) > 500:
                         save_slice(img_uint8, mask_uint8, save_img_dir, save_mask_dir, filename, i)
                         count_saved += 1
                         
            except Exception as e:
                print(f"Lỗi file {filename}: {e}")
                
        print(f"   Đã lưu {count_saved} ảnh.")

# --- HÀM VISUALIZE ĐỂ CHECK KẾT QUẢ ---
def visualize_check():
    train_dir = os.path.join(config.PROCESSED_DATA_DIR, 'images', 'train')
    if not os.path.exists(train_dir) or not os.listdir(train_dir):
        print("Chưa có dữ liệu output.")
        return

    sample_name = os.listdir(train_dir)[10] # Lấy cái thứ 10 cho ngẫu nhiên
    img_path = os.path.join(config.PROCESSED_DATA_DIR, 'images', 'train', sample_name)
    mask_path = os.path.join(config.PROCESSED_DATA_DIR, 'masks', 'train', sample_name)
    
    img = Image.open(img_path)
    mask = Image.open(mask_path)
    
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1); plt.imshow(img, cmap='gray'); plt.title(f"Input: {sample_name}")
    plt.subplot(1, 2, 2); plt.imshow(mask, cmap='gray'); plt.title("Generated Mask")
    plt.show()

if __name__ == "__main__":
    process_dataset()
    visualize_check()