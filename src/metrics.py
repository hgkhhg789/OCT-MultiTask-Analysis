import torch

def compute_iou(pred_mask, true_mask, threshold=0.5, smooth=1e-6):
    """Tính Intersection over Union (IoU) cho bài toán phân đoạn"""
    # Chuyển logits thành xác suất (0-1)
    pred_mask = torch.sigmoid(pred_mask)
    # Chuyển thành 0 hoặc 1 dựa trên ngưỡng
    pred_mask = (pred_mask > threshold).float()
    
    # Tính giao và hội
    intersection = (pred_mask * true_mask).sum()
    union = pred_mask.sum() + true_mask.sum() - intersection
    
    iou = (intersection + smooth) / (union + smooth)
    return iou.item()

def compute_dice_score(pred_mask, true_mask, threshold=0.5, smooth=1e-6):
    """Tính Dice Score (F1-Score cho ảnh)"""
    pred_mask = torch.sigmoid(pred_mask)
    pred_mask = (pred_mask > threshold).float()
    
    intersection = (pred_mask * true_mask).sum()
    dice = (2. * intersection + smooth) / (pred_mask.sum() + true_mask.sum() + smooth)
    return dice.item()

def compute_accuracy(pred_cls, true_cls):
    """Tính độ chính xác (Accuracy) cho bài toán phân loại"""
    # Lấy nhãn có xác suất cao nhất (argmax)
    # pred_cls shape: [Batch, Num_Classes]
    predicted_labels = torch.argmax(pred_cls, dim=1)
    
    correct = (predicted_labels == true_cls).sum().item()
    total = true_cls.size(0)
    
    return correct / total