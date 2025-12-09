import torch
from torch.utils.data import DataLoader
import numpy as np
from tqdm import tqdm
import os
import config
from dataset import OCTDataset
from model import MultiTaskUNet
from metrics import compute_dice_score, compute_accuracy

def evaluate():
    device = torch.device(config.DEVICE if torch.cuda.is_available() else "cpu")
    print(f"--> Đang kiểm tra trên thiết bị: {device}")

    # 1. Load lại Model tốt nhất (hoặc last.pth)
    model = MultiTaskUNet(encoder_name="efficientnet-b0", n_classes_seg=1, n_classes_cls=3).to(device)
    
    # Ưu tiên load best_model, nếu không có thì load last.pth
    weights_path = os.path.join(config.WEIGHTS_DIR, "last.pth")
    if os.path.exists(weights_path):
        print(f"--> Đang load trọng số từ: {weights_path}")
        model.load_state_dict(torch.load(weights_path))
    else:
        print("LỖI: Chưa có file weights nào!")
        return

    model.eval()

    # 2. Load Dữ liệu Test
    test_dataset = OCTDataset(subset='test') # Hoặc 'val'
    test_loader = DataLoader(test_dataset, batch_size=1, shuffle=False)
    
    print(f"--> Tổng số ảnh kiểm tra: {len(test_dataset)}")

    # Biến lưu điểm
    dice_scores_chiu = [] # Chỉ tính Dice cho ảnh Chiu
    acc_scores_srinivasan = [] # Chỉ tính Acc cho ảnh Srinivasan
    
    with torch.no_grad():
        for images, masks, labels in tqdm(test_loader, desc="Đang chấm thi"):
            images = images.to(device)
            masks = masks.to(device)
            labels = labels.to(device)

            # Forward
            seg_pred, cls_pred = model(images)

            # --- PHÂN LOẠI ĐỂ CHẤM ĐIỂM ---
            label_val = labels.item()
            
            if label_val == -1: 
                # ==> Đây là ảnh CHIU (Bài thi Segmentation)
                dice = compute_dice_score(seg_pred, masks)
                dice_scores_chiu.append(dice)
            else:
                # ==> Đây là ảnh SRINIVASAN (Bài thi Classification)
                acc = compute_accuracy(cls_pred, labels)
                acc_scores_srinivasan.append(acc)

    # 3. Báo cáo kết quả tách biệt
    print("\n" + "="*40)
    print("   BẢNG ĐIỂM CHI TIẾT (REPORT)")
    print("="*40)
    
    if len(dice_scores_chiu) > 0:
        avg_dice = np.mean(dice_scores_chiu)
        print(f"✅ SEGMENTATION (Tập Chiu - {len(dice_scores_chiu)} ảnh):")
        print(f"   Mean Dice Score: {avg_dice:.4f} ")
    else:
        print("⚠️ Không tìm thấy ảnh Chiu trong tập Test.")

    if len(acc_scores_srinivasan) > 0:
        avg_acc = np.mean(acc_scores_srinivasan)
        print(f"✅ CLASSIFICATION (Tập Srinivasan - {len(acc_scores_srinivasan)} ảnh):")
        print(f"   Accuracy: {avg_acc:.4f} ({avg_acc*100:.2f}%)")
    else:
        print("⚠️ Không tìm thấy ảnh Srinivasan trong tập Test.")
    print("="*40)

if __name__ == "__main__":
    evaluate()