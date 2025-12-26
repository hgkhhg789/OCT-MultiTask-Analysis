import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cpu, ChevronRight, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import SmartViewer from "../../components/SmartViewer"; // Import Viewer xịn
import { analyzeOCTImage } from '../../api'; // Mock API

const AnalysisViewerPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Dữ liệu nhận từ trang Upload
  const uploadedFile = state?.uploadedFile;
  const previewUrl = state?.previewUrl;
  const patientData = state?.patientData;

  // States
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  
  // Layers Mask (Mặc định bật hết)
  const [layers, setLayers] = useState([
    { id: 'fluid', name: 'Dịch (Fluid)', active: true },
    { id: 'rpe', name: 'Lớp RPE', active: true },
    { id: 'lesion', name: 'Vùng tổn thương', active: true },
  ]);

  const [doctorNote, setDoctorNote] = useState('');

  // 1. Tự động chạy AI khi vào trang
  useEffect(() => {
    if (!uploadedFile) {
      navigate('/exam/new'); // Nếu không có file thì quay lại upload
      return;
    }

    const runAI = async () => {
      try {
        setLoading(true);
        // Giả lập delay
        const response = await analyzeOCTImage(uploadedFile);
        setAiResult(response.data);
      } catch (error) {
        alert("Lỗi phân tích AI: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    runAI();
  }, [uploadedFile, navigate]);

  // 2. Chuyển sang trang Báo cáo
  const handleGoToReport = () => {
    if (!aiResult) return;

    // Đóng gói dữ liệu để gửi sang trang Report
    const scanDataPackage = {
      date: new Date().toLocaleDateString(),
      diagnosis: aiResult.diagnosis,
      severity: aiResult.severity,
      confidence: aiResult.confidence,
      lesionArea: aiResult.lesion_area_px, // Hoặc đổi sang mm2
      doctorNote: doctorNote,
      imageUrl: previewUrl,
      maskUrl: aiResult.mask_url, // Trong thực tế là URL ảnh mask đã chỉnh sửa
      layersConfig: layers
    };

    navigate(`/exam/temp_id/report`, { 
      state: { 
        patient: patientData, 
        scanData: scanDataPackage 
      } 
    });
  };

  if (!patientData || !uploadedFile) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      
      {/* TOOLBAR TOP */}
      <div className="h-16 bg-medical-card border-b border-medical-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-medical-hover rounded-full text-medical-subtext">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-medical-text flex items-center gap-2">
              <Cpu className="text-medical-accent" size={20} /> Phân Tích Hình Ảnh
            </h1>
            <p className="text-xs text-medical-subtext">Bệnh nhân: <span className="font-bold">{patientData.name}</span> ({patientData.id})</p>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center gap-4">
          {loading ? (
             <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg text-sm font-bold">
                <span className="animate-spin">⏳</span> Đang xử lý AI...
             </div>
          ) : (
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${aiResult?.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                {aiResult?.severity === 'High' ? <AlertCircle size={16}/> : <Save size={16}/>}
                Kết quả: {aiResult?.diagnosis} ({(aiResult?.confidence * 100).toFixed(0)}%)
             </div>
          )}

          <button 
            onClick={handleGoToReport}
            disabled={loading}
            className="px-6 py-2 bg-medical-accent hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            Xuất Kết Quả <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: 2 COLUMNS */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* LEFT: VIEWER (Chiếm phần lớn) */}
        <div className="flex-1 bg-black relative p-4">
          {!loading && aiResult ? (
            <SmartViewer 
              originalSrc={previewUrl}
              maskSrc={aiResult.mask_url}
              layers={layers}
              onLayerToggle={(id) => setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l))}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <div className="w-16 h-16 border-4 border-medical-accent border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>AI đang quét tổn thương...</p>
            </div>
          )}
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div className="w-80 bg-medical-card border-l border-medical-border flex flex-col overflow-y-auto">
          
          <div className="p-4 border-b border-medical-border">
            <h3 className="font-bold text-medical-text mb-1">Thông số đo đạc</h3>
            <p className="text-xs text-medical-subtext">Được tính toán tự động bởi U-Net</p>
          </div>

          <div className="p-4 space-y-4 border-b border-medical-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-medical-subtext">Diện tích tổn thương</span>
              <span className="font-mono font-bold text-medical-text text-lg">{aiResult ? aiResult.lesion_area_px : '--'} <span className="text-xs">px</span></span>
            </div>
            {/* Thanh tiến trình mức độ */}
            <div>
               <div className="flex justify-between text-xs mb-1">
                 <span>Mức độ nghiêm trọng</span>
                 <span className={aiResult?.severity === 'High' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{aiResult?.severity || '--'}</span>
               </div>
               <div className="w-full h-2 bg-medical-hover rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full ${aiResult?.severity === 'High' ? 'bg-red-500' : 'bg-green-500'}`} 
                   style={{ width: aiResult ? (aiResult.confidence * 100) + '%' : '0%' }}
                 ></div>
               </div>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <label className="text-sm font-bold text-medical-text mb-2">Ghi chú lâm sàng</label>
            <textarea 
              className="flex-1 w-full bg-medical-bg border border-medical-border rounded-xl p-3 text-sm focus:border-medical-accent outline-none resize-none"
              placeholder="Nhập ghi chú bác sĩ tại đây..."
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
            ></textarea>
            <p className="text-xs text-medical-subtext mt-2 italic">Ghi chú này sẽ xuất hiện trong báo cáo PDF.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisViewerPage;