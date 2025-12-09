import os

# Đường dẫn gốc project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Cấu hình đường dẫn dữ liệu
DATA_DIR = os.path.join(BASE_DIR, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
WEIGHTS_DIR = os.path.join(BASE_DIR, 'weights')

# Tạo thư mục nếu chưa có
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(WEIGHTS_DIR, exist_ok=True)

# Hyperparameters chung
IMG_SIZE = (256, 256)
BATCH_SIZE = 8  # Chỉnh xuống 4 nếu VRAM yếu
LEARNING_RATE = 1e-4
NUM_EPOCHS = 50
DEVICE = "cuda" # Tự động chuyển cpu nếu không có cuda thì xử lý trong train.py sau