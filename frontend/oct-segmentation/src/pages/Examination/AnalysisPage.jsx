// src/pages/AnalysisPage.jsx
import React, { useState } from 'react';
import { Eye, Upload, Activity, FileText, Cpu, Save, UserCheck, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { usePatients } from '../context/PatientContext'; // Import Context
import OCTViewer from '../components/OCTViewer'; 
import { analyzeOCTImage } from '../api';
import jsPDF from 'jspdf';

function AnalysisPage() {
  const { state } = useLocation(); // Nhận dữ liệu BN từ PatientManager
  const { addMedicalRecord } = usePatients(); // Hàm lưu vào Context
  const navigate = useNavigate();

  // Kiểm tra xem có đang khám cho ai không?
  const currentPatient = state?.patientData || null;

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Trạng thái đã lưu

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setIsSaved(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const response = await analyzeOCTImage(selectedFile);
      setResult(response.data);
      
      // --- AUTO SAVE LOGIC ---
      // Nếu đang khám cho bệnh nhân, tự động lưu ngay khi có kết quả
      if (currentPatient) {
        const newRecord = {
          id: `vis_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          diagnosis: response.data.diagnosis,
          severity: response.data.severity,
          note: `Phân tích AI. Độ tin cậy: ${(response.data.confidence * 100).toFixed(1)}%`,
          imageUrl: URL.createObjectURL(selectedFile), // Lưu ý: thực tế cần upload lên server
          maskUrl: response.data.mask_url
        };
        addMedicalRecord(currentPatient.id, newRecord);
        setIsSaved(true);
      }
      
    } catch (error) {
      alert("Lỗi xử lý ảnh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text(`Medical Report: ${currentPatient ? currentPatient.name : 'Guest'}`, 20, 20);
    doc.text(`Diagnosis: ${result.diagnosis}`, 20, 40);
    doc.save("report.pdf");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      
      {/* CỘT TRÁI: CÔNG CỤ */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* BANNER THÔNG TIN BỆNH NHÂN */}
        {currentPatient ? (
          <div className="bg-medical-accent/10 border border-medical-accent p-4 rounded-xl flex items-center justify-between shadow-lg shadow-medical-accent/10">
            <div>
              <p className="text-xs text-medical-subtext uppercase font-bold tracking-wider">Đang khám cho:</p>
              <p className="text-xl font-bold text-medical-accent">{currentPatient.name}</p>
              <p className="text-xs text-medical-subtext font-mono">ID: {currentPatient.id}</p>
            </div>
            <div className="bg-medical-accent/20 p-2 rounded-full">
               <UserCheck size={28} className="text-medical-accent" />
            </div>
          </div>
        ) : (
          <div className="bg-medical-hover border border-medical-border p-4 rounded-xl flex items-center gap-3 opacity-70">
             <UserCheck size={24} className="text-medical-subtext" />
             <p className="text-sm font-medium text-medical-subtext">Chế độ khách (Không lưu hồ sơ)</p>
          </div>
        )}

        {/* INPUT SOURCE */}
        <div className="bg-medical-card rounded-2xl p-1 border border-medical-border shadow-xl transition-colors">
          <div className="p-6 rounded-xl bg-gradient-to-b from-medical-hover to-transparent">
            <h2 className="text-sm font-semibold text-medical-subtext uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload size={16} /> Input Source
            </h2>
            
            <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-medical-border rounded-xl cursor-pointer hover:border-medical-accent hover:bg-medical-hover transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-medical-subtext group-hover:text-medical-accent transition-colors">
                <Upload className="w-10 h-10 mb-3" />
                <p className="text-sm font-medium">Click to upload OCT Scan</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>

            {selectedFile && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full py-4 bg-medical-accent hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Activity className="animate-spin" /> : <Cpu />}
                {loading ? 'ĐANG PHÂN TÍCH...' : 'CHẠY CHẨN ĐOÁN'}
              </button>
            )}
          </div>
        </div>

        {/* KẾT QUẢ AI */}
        {result && (
          <div className="bg-medical-card rounded-2xl border border-medical-border shadow-xl overflow-hidden animate-fade-in-up transition-colors">
            <div className="p-4 border-b border-medical-border bg-medical-hover flex items-center justify-between">
              <h3 className="font-bold text-medical-text flex items-center gap-2"><FileText size={18} /> Analysis Report</h3>
              {isSaved && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                  <Save size={12} /> Đã lưu
                </span>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-xl border ${result.severity === 'High' ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${result.severity === 'High' ? 'text-red-500' : 'text-green-600'}`}>Detected Condition</p>
                    <h4 className="text-xl font-bold text-medical-text mt-1">{result.diagnosis}</h4>
                  </div>
                  {result.severity === 'High' ? <AlertCircle className="text-red-500" /> : <CheckCircle2 className="text-green-500" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-medical-hover p-3 rounded-lg border border-medical-border">
                  <p className="text-xs text-medical-subtext mb-1">Confidence</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-mono text-medical-accent">{(result.confidence * 100).toFixed(1)}</span>
                    <span className="text-sm text-medical-subtext mb-1">%</span>
                  </div>
                </div>
                <div className="bg-medical-hover p-3 rounded-lg border border-medical-border">
                  <p className="text-xs text-medical-subtext mb-1">Lesion Area</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-mono text-medical-text">{result.lesion_area_px}</span>
                    <span className="text-xs text-medical-subtext mb-1">px²</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={handleExportPDF} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
                  <FileDown size={18} /> Xuất PDF
                </button>
                
                {/* Nút quay lại trang BN */}
                {currentPatient && (
                   <button 
                     onClick={() => navigate('/patients')}
                     className="w-full py-3 border border-medical-accent text-medical-accent font-bold rounded-xl hover:bg-medical-accent hover:text-white transition-all"
                   >
                     Xem Hồ Sơ Bệnh Án
                   </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: VIEWER */}
      <div className="lg:col-span-2">
        <div className="bg-medical-card rounded-2xl p-1 border border-medical-border shadow-2xl h-full flex flex-col transition-colors">
          <div className="bg-medical-hover p-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-sm font-semibold text-medical-text flex items-center gap-2">
              <Eye className="text-medical-accent" size={18} /> 
              Live Visualization
            </h2>
            {selectedFile && <span className="text-xs font-mono text-medical-subtext">{selectedFile.name}</span>}
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <OCTViewer 
              originalSrc={previewUrl} 
              maskSrc={result?.mask_url} 
              isScanning={loading}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default AnalysisPage;