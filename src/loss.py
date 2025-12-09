import torch
import torch.nn as nn

class MultiTaskLoss(nn.Module):
    def __init__(self, weight_seg=0.5, weight_cls=0.5):
        super(MultiTaskLoss, self).__init__()
        self.weight_seg = weight_seg
        self.weight_cls = weight_cls
        self.bce = nn.BCEWithLogitsLoss(reduction='none') # reduction='none' để tính lẻ từng ảnh
        self.cls_criterion = nn.CrossEntropyLoss(ignore_index=-1) # Bỏ qua nhãn -1 (Chiu)

    def dice_loss(self, preds, targets):
        preds = torch.sigmoid(preds)
        intersection = (preds * targets).sum(dim=(1, 2, 3))
        union = preds.sum(dim=(1, 2, 3)) + targets.sum(dim=(1, 2, 3))
        dice = (2. * intersection + 1e-6) / (union + 1e-6)
        return 1 - dice.mean()

    def forward(self, seg_pred, seg_target, cls_pred, cls_target):
        # 1. Classification Loss (Tự động bỏ qua ảnh Chiu có label -1)
        loss_cls = self.cls_criterion(cls_pred, cls_target)
        
        # 2. Segmentation Loss (Chỉ tính cho ảnh Chiu - Label == -1)
        # Tìm những ảnh nào là Chiu (Label == -1)
        is_chiu = (cls_target == -1).float() 
        
        # Nếu trong batch không có ảnh Chiu nào thì loss seg = 0
        if is_chiu.sum() == 0:
            loss_seg = torch.tensor(0.0, device=seg_pred.device, requires_grad=True)
        else:
            # Tính BCE cho từng ảnh
            bce_per_image = self.bce(seg_pred, seg_target).mean(dim=(1, 2, 3))
            # Chỉ lấy loss của ảnh Chiu
            loss_seg = (bce_per_image * is_chiu).sum() / (is_chiu.sum() + 1e-6)
            
            # (Dice loss viết đơn giản thì khó mask, tạm thời dùng BCE chủ đạo cho Seg đoạn này)
        
        total_loss = self.weight_seg * loss_seg + self.weight_cls * loss_cls
        return total_loss, loss_seg, loss_cls