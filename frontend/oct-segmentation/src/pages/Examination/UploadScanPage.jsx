import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, User, FileImage, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

const UploadScanPage = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();

  // STATE
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Lọc bệnh nhân cho dropdown tìm kiếm
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // XỬ LÝ DRAG & DROP
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // KIỂM TRA FILE
  const validateAndSetFile = (uploadedFile) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.dcm')) {
      setError("Định dạng không hỗ trợ. Vui lòng chọn JPG, PNG hoặc DICOM.");
      setFile(null);
      setPreview(null);
      return;
    }
    setError(null);
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  // CHUYỂN BƯỚC TIẾP THEO
  const handleNext = () => {
    if (!selectedPatientId || !file) return;
    
    const patientData = patients.find(p => p.id === selectedPatientId);
    // Chuyển sang trang Phân tích, gửi kèm File và Thông tin BN
    // Lưu ý: Trong thực tế ta sẽ upload file lên server trước để lấy URL
    navigate('/exam/temp_id/analyze', { 
      state: { 
        patientData, 
        uploadedFile: file, 
        previewUrl: preview 
      } 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in space-y-8">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-medical-text">Thiết lập Ca Chụp Mới</h1>
        <p className="text-medical-subtext">Bước 1/3: Chọn bệnh nhân và tải ảnh OCT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CỘT TRÁI: CHỌN BỆNH NHÂN */}
        <div className="bg-medical-card p-6 rounded-2xl border border-medical-border shadow-sm h-fit">
          <h2 className="font-bold text-medical-text mb-4 flex items-center gap-2">
            <User className="text-medical-accent" size={20} /> 1. Chọn Bệnh Nhân
          </h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-subtext" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên hoặc mã ID..." 
              className="w-full bg-medical-bg border border-medical-border text-medical-text pl-10 pr-4 py-3 rounded-xl focus:border-medical-accent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-64 overflow-y-auto border border-medical-border rounded-xl bg-medical-bg">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3 border-b border-medical-border cursor-pointer transition-colors flex justify-between items-center ${selectedPatientId === p.id ? 'bg-medical-accent/10 border-l-4 border-l-medical-accent' : 'hover:bg-medical-hover'}`}
                >
                  <div>
                    <p className="font-bold text-sm text-medical-text">{p.name}</p>
                    <p className="text-xs text-medical-subtext">{p.id} • {p.age} tuổi</p>
                  </div>
                  {selectedPatientId === p.id && <CheckCircle2 size={16} className="text-medical-accent" />}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-medical-subtext py-4">Không tìm thấy bệnh nhân.</p>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: UPLOAD ẢNH */}
        <div className="bg-medical-card p-6 rounded-2xl border border-medical-border shadow-sm h-fit">
          <h2 className="font-bold text-medical-text mb-4 flex items-center gap-2">
            <Upload className="text-medical-accent" size={20} /> 2. Tải Ảnh OCT
          </h2>

          <div 
            className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
              dragActive ? 'border-medical-accent bg-medical-accent/5' : 'border-medical-border bg-medical-bg'
            } ${preview ? 'border-green-500/50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative w-full h-full p-2 group">
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <button 
                  onClick={() => {setFile(null); setPreview(null);}} 
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Upload size={16} className="rotate-45" /> {/* Icon X giả lập */}
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ảnh hợp lệ
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <FileImage size={48} className="mx-auto text-medical-subtext mb-4 opacity-50" />
                <p className="text-sm font-bold text-medical-text">Kéo thả ảnh vào đây</p>
                <p className="text-xs text-medical-subtext mb-4">hoặc click để chọn file</p>
                <label className="px-4 py-2 bg-medical-hover border border-medical-border text-medical-text hover:border-medical-accent rounded-lg cursor-pointer text-sm font-bold transition-all">
                  Chọn File
                  <input type="file" className="hidden" onChange={handleChange} accept="image/*,.dcm" />
                </label>
                <p className="text-[10px] text-medical-subtext mt-4">Hỗ trợ: DICOM, JPG, PNG (Max 50MB)</p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end pt-6 border-t border-medical-border">
        <button 
          onClick={handleNext}
          disabled={!selectedPatientId || !file}
          className="px-8 py-3 bg-medical-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          Tiếp tục: Phân Tích <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
};

export default UploadScanPage;