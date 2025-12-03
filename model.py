import torch
import torch.nn as nn
import torchvision.models as models

class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )
    def forward(self, x): return self.double_conv(x)

class MultiTaskUNet(nn.Module):
    def __init__(self, n_channels=1, n_classes_seg=1, n_classes_cls=3):
        super(MultiTaskUNet, self).__init__()
        # Backbone ResNet34
        self.backbone = models.resnet34(weights=models.ResNet34_Weights.DEFAULT)
        # Sửa lớp đầu để nhận 1 kênh (Gray) thay vì 3 (RGB)
        self.backbone.conv1 = nn.Conv2d(n_channels, 64, kernel_size=7, stride=2, padding=3, bias=False)
        
        self.enc1 = nn.Sequential(self.backbone.conv1, self.backbone.bn1, self.backbone.relu)
        self.enc2 = nn.Sequential(self.backbone.maxpool, self.backbone.layer1)
        self.enc3 = self.backbone.layer2
        self.enc4 = self.backbone.layer3
        self.enc5 = self.backbone.layer4
        
        # Decoder
        self.up1 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.conv1 = DoubleConv(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv2 = DoubleConv(256, 128)
        self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv3 = DoubleConv(128, 64)
        self.up4 = nn.ConvTranspose2d(64, 64, kernel_size=2, stride=2)
        self.conv4 = DoubleConv(128, 64)
        
        self.seg_head = nn.Conv2d(64, n_classes_seg, kernel_size=1)
        
        # Classification Head
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.cls_head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512, 256), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(256, n_classes_cls)
        )

    def forward(self, x):
        # Encoder
        x1 = self.enc1(x)
        x2 = self.enc2(x1)
        x3 = self.enc3(x2)
        x4 = self.enc4(x3)
        x5 = self.enc5(x4)
        
        # Classification Output
        cls_out = self.cls_head(self.avgpool(x5))
        
        # Decoder Segmentation
        d1 = self.up1(x5)
        d1 = torch.cat([x4, d1], dim=1)
        d1 = self.conv1(d1)
        
        d2 = self.up2(d1)
        d2 = torch.cat([x3, d2], dim=1)
        d2 = self.conv2(d2)
        
        d3 = self.up3(d2)
        d3 = torch.cat([x2, d3], dim=1)
        d3 = self.conv3(d3)
        
        d4 = self.up4(d3)
        if x1.shape != d4.shape:
             x1 = nn.functional.interpolate(x1, size=d4.shape[2:], mode='bilinear')
        d4 = torch.cat([x1, d4], dim=1)
        d4 = self.conv4(d4)
        
        seg_out = self.seg_head(d4)
        seg_out = nn.functional.interpolate(seg_out, size=x.shape[2:], mode='bilinear', align_corners=False)
        
        return seg_out, cls_out