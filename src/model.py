import torch
import torch.nn as nn
import segmentation_models_pytorch as smp

class MultiTaskUNet(nn.Module):
    def __init__(self, encoder_name="efficientnet-b3", encoder_weights="imagenet", n_classes_seg=1, n_classes_cls=3):
        """
        Args:
            encoder_name: Tên backbone (efficientnet-b0, b1, b3...)
            n_classes_seg: Số lớp phân đoạn (1 lớp cho vùng tổn thương)
            n_classes_cls: Số lớp phân loại bệnh (VD: Normal, AMD, DME)
        """
        super(MultiTaskUNet, self).__init__()
        
        # 1. SHARED ENCODER & SEGMENTATION DECODER
        # Chúng ta dùng thư viện SMP để tạo khung U-Net chuẩn
        # aux_params=None vì ta sẽ tự viết đầu Classification để kiểm soát tốt hơn
        self.unet = smp.Unet(
            encoder_name=encoder_name, 
            encoder_weights=encoder_weights, 
            in_channels=1,                  # Ảnh OCT đầu vào là 1 kênh (Grayscale)
            classes=n_classes_seg,          # Output segmentation
            activation=None                 # Raw logits (chưa qua Sigmoid)
        )
        
        # 2. CLASSIFICATION HEAD
        # Lấy kích thước channel tại tầng sâu nhất (bottleneck) của Encoder
        # EfficientNet-B3 thường có output channels ở bottleneck là 1536
        # EfficientNet-B0 là 1280. Ta lấy động từ encoder để tránh lỗi.
        self.encoder_out_channels = self.unet.encoder.out_channels[-1]
        
        self.classification_head = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),   # Gom feature map thành 1 vector
            nn.Flatten(),
            nn.Dropout(p=0.5),              # Tránh Overfitting
            nn.Linear(self.encoder_out_channels, 256),
            nn.ReLU(),
            nn.Linear(256, n_classes_cls)   # Output ra số lớp bệnh (logits)
        )

    def forward(self, x):
        # --- Giai đoạn 1: Đi qua Encoder (Shared) ---
        # Hàm encoder của smp trả về một list các feature maps từ nông đến sâu
        features = self.unet.encoder(x)
        
        # --- Giai đoạn 2: Task Segmentation ---
        # Đưa các feature maps vào Decoder để tái tạo ảnh mask
        decoder_output = self.unet.decoder(features)
        seg_mask = self.unet.segmentation_head(decoder_output)
        
        # --- Giai đoạn 3: Task Classification ---
        # Lấy feature map sâu nhất (cái cuối cùng trong list features)
        bottleneck = features[-1]
        cls_logits = self.classification_head(bottleneck)
        
        return seg_mask, cls_logits

# --- CODE TEST NHANH (Chạy để kiểm tra lỗi cú pháp) ---
if __name__ == "__main__":
    # Giả lập một batch ảnh đầu vào: Batch_size=2, Channel=1, Size=256x256
    dummy_input = torch.randn(2, 1, 256, 256)
    
    # Khởi tạo model (Thử EfficientNet-B0 cho nhẹ trước)
    model = MultiTaskUNet(encoder_name="efficientnet-b0", n_classes_seg=1, n_classes_cls=3)
    
    # Chạy thử
    seg_out, cls_out = model(dummy_input)
    
    print("--- KIỂM TRA MODEL ---")
    print(f"Input shape: {dummy_input.shape}")
    print(f"Segmentation Output shape: {seg_out.shape} (Mong đợi: [2, 1, 256, 256])")
    print(f"Classification Output shape: {cls_out.shape} (Mong đợi: [2, 3])")
    
    if seg_out.shape == (2, 1, 256, 256) and cls_out.shape == (2, 3):
        print("✅ Model hoạt động chính xác!")
    else:
        print("❌ Có lỗi về kích thước đầu ra.")