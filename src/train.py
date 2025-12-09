import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from tqdm import tqdm
import os
import numpy as np

# Import các module
import config
from dataset import OCTDataset
from model import MultiTaskUNet
from loss import MultiTaskLoss
from metrics import compute_dice_score, compute_accuracy

def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    epoch_loss = 0
    
    # Tạo 2 list riêng để lưu điểm của từng bộ
    epoch_dice_chiu = []      
    epoch_acc_srinivasan = [] 
    
    # Thanh progress bar
    loop = tqdm(loader, desc="Training")
    
    for images, masks, labels in loop:
        images = images.to(device)
        masks = masks.to(device)
        labels = labels.to(device)
        
        # 1. Forward
        seg_pred, cls_pred = model(images)
        
        # 2. Loss
        loss, l_seg, l_cls = criterion(seg_pred, masks, cls_pred, labels)
        
        # 3. Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # 4. TÍNH ĐIỂM THÔNG MINH (SMART METRICS)
        
        # --- Chỉ tính Dice cho ảnh Chiu (Label = -1) ---
        chiu_indices = (labels == -1)
        if chiu_indices.sum() > 0:
            # Lọc lấy ảnh Chiu ra để tính
            dice_val = compute_dice_score(seg_pred[chiu_indices], masks[chiu_indices])
            epoch_dice_chiu.append(dice_val)
            
        # --- Chỉ tính Acc cho ảnh Srinivasan (Label != -1) ---
        sri_indices = (labels != -1)
        if sri_indices.sum() > 0:
            # Lọc lấy ảnh Srinivasan ra để tính
            acc_val = compute_accuracy(cls_pred[sri_indices], labels[sri_indices])
            epoch_acc_srinivasan.append(acc_val)
        
        epoch_loss += loss.item()
        
        # Tính trung bình tạm thời để hiển thị
        curr_dice = np.mean(epoch_dice_chiu) if len(epoch_dice_chiu) > 0 else 0.0
        curr_acc = np.mean(epoch_acc_srinivasan) if len(epoch_acc_srinivasan) > 0 else 0.0
        
        # Cập nhật thanh hiển thị: Tách rõ Seg_Dice và Cls_Acc
        loop.set_postfix(
            loss=f"{loss.item():.4f}", 
            Seg_Dice=f"{curr_dice:.4f}", 
            Cls_Acc=f"{curr_acc:.4f}"
        )
        
    # Trả về trung bình của cả epoch
    avg_loss = epoch_loss / len(loader)
    avg_dice = np.mean(epoch_dice_chiu) if len(epoch_dice_chiu) > 0 else 0.0
    avg_acc = np.mean(epoch_acc_srinivasan) if len(epoch_acc_srinivasan) > 0 else 0.0
    
    return avg_loss, avg_dice, avg_acc

def main():
    device = torch.device(config.DEVICE if torch.cuda.is_available() else "cpu")
    print(f"--> Device: {device}")

    # Load dữ liệu
    train_dataset = OCTDataset(subset='train')
    val_dataset = OCTDataset(subset='val')

    train_loader = DataLoader(train_dataset, batch_size=config.BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False)

    print(f"--> Số lượng ảnh Train: {len(train_dataset)}")
    print(f"--> Số lượng ảnh Val: {len(val_dataset)}")

    model = MultiTaskUNet(encoder_name="efficientnet-b0").to(device)
    criterion = MultiTaskLoss().to(device)
    optimizer = optim.AdamW(model.parameters(), lr=config.LEARNING_RATE)

    print("--> Bắt đầu huấn luyện Multi-Task (Chế độ hiển thị tách biệt)...")
    for epoch in range(config.NUM_EPOCHS):
        print(f"\nEpoch {epoch+1}/{config.NUM_EPOCHS}")
        
        loss, dice, acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        
        # In kết quả tổng kết Epoch
        print(f"KẾT QUẢ: Loss={loss:.4f} | Seg Dice={dice:.4f} (Chiu) | Cls Acc={acc:.4f} (Srinivasan)")
        
        # Lưu checkpoint
        torch.save(model.state_dict(), os.path.join(config.WEIGHTS_DIR, "last.pth"))

if __name__ == "__main__":
    main()