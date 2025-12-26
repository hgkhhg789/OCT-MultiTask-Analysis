// src/api.js
import axios from 'axios';

// CẤU HÌNH: Đổi thành URL thật của bạn khi backend đã xong
const BASE_URL = 'http://localhost:5000/api'; 

export const analyzeOCTImage = async (file) => {
  // --- MOCK MODE (GIẢ LẬP) ---
  // Xóa đoạn này khi nối API thật
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          // Task 1: Segmentation (Giả sử trả về URL ảnh mask)
          mask_url: URL.createObjectURL(file), // Tạm thời dùng chính ảnh gốc làm mask demo
          // Task 2: Classification / Prediction
          diagnosis: "Choroidal Neovascularization (CNV)",
          confidence: 0.94,
          lesion_area_px: 12540,
          severity: "High",
          processing_time: "0.45s"
        }
      });
    }, 2000); // Giả vờ đợi 2 giây
  });

  // --- REAL MODE (DÙNG KHI CÓ BACKEND) ---
  /*
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post(`${BASE_URL}/predict`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
  */
};