import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Download, Save, ChevronLeft, FileCheck, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';

const ReportPreviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Dữ liệu giả lập nếu không có state (để test giao diện)
  const patient = state?.patient || { name: 'Nguyễn Văn A', id: 'BN001', age: 65, gender: 'Nam' };
  const scanData = state?.scanData || { 
    date: new Date().toLocaleDateString(), 
    diagnosis: 'AMD - Thoái hóa điểm vàng (Giai đoạn 3)',
    severity: 'High',
    confidence: 0.98,
    lesionArea: 5.2,
    doctorNote: 'Bệnh nhân có dấu hiệu tăng sinh mạch máu. Cần tiêm Anti-VEGF mũi tiếp theo.',
    imageUrl: 'https://i.imgur.com/8Yj0XjX.png',
    maskUrl: 'https://i.imgur.com/8Yj0XjX.png'
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 50, 150);
    doc.text("RetinaNet.AI - MEDICAL REPORT", 105, 20, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);

    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient Name: ${patient.name}`, 20, 45);
    doc.text(`Patient ID: ${patient.id}`, 120, 45);
    doc.text(`Age/Gender: ${patient.age} / ${patient.gender}`, 20, 55);
    doc.text(`Scan Date: ${scanData.date}`, 120, 55);

    // Diagnosis Box
    doc.setFillColor(240, 248, 255);
    doc.rect(20, 65, 170, 30, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("AI DIAGNOSIS RESULT:", 25, 75);
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0); // Red color for diagnosis
    doc.text(scanData.diagnosis.toUpperCase(), 25, 88);

    // Metrics
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Confidence Score: ${(scanData.confidence * 100).toFixed(1)}%`, 20, 110);
    doc.text(`Severity Level: ${scanData.severity}`, 80, 110);
    doc.text(`Lesion Area: ${scanData.lesionArea} mm2`, 140, 110);

    // Note
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Doctor's Clinical Note:", 20, 130);
    doc.setFont(undefined, 'italic');
    doc.text(scanData.doctorNote, 20, 140, { maxWidth: 170 });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated automatically by RetinaNet.AI System", 105, 280, null, null, "center");

    doc.save(`${patient.id}_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-8 flex justify-center gap-8 animate-fade-in">
      
      {/* 1. LEFT: PREVIEW PAPER (Tờ giấy A4) */}
      <div className="bg-white text-black w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] relative hidden md:block">
        {/* Header */}
        <div className="border-b-2 border-blue-800 pb-4 mb-8 flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-blue-800">PHIẾU KẾT QUẢ OCT</h1>
             <p className="text-sm text-gray-500">RetinaNet.AI Diagnostic System</p>
           </div>
           <div className="text-right">
             <p className="font-mono font-bold text-lg">{patient.id}</p>
             <p className="text-sm">{scanData.date}</p>
           </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
           <div>
              <span className="text-xs text-gray-500 uppercase font-bold">Bệnh nhân</span>
              <p className="font-bold text-lg">{patient.name}</p>
           </div>
           <div>
              <span className="text-xs text-gray-500 uppercase font-bold">Tuổi / Giới tính</span>
              <p className="font-bold text-lg">{patient.age} / {patient.gender}</p>
           </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="text-center">
              <p className="text-xs font-bold mb-1 text-gray-500">ẢNH GỐC (OCT)</p>
              <div className="border border-gray-300 rounded h-48 bg-black overflow-hidden flex items-center justify-center">
                 <img src={scanData.imageUrl} alt="Original" className="max-h-full max-w-full" />
              </div>
           </div>
           <div className="text-center">
              <p className="text-xs font-bold mb-1 text-gray-500">PHÂN TÍCH AI (MASK)</p>
              <div className="border border-gray-300 rounded h-48 bg-black overflow-hidden flex items-center justify-center relative">
                 <img src={scanData.imageUrl} alt="Original" className="max-h-full max-w-full opacity-50 absolute" />
                 <img src={scanData.maskUrl} alt="Mask" className="max-h-full max-w-full relative z-10 mix-blend-screen filter hue-rotate-180" />
              </div>
           </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-8">
           <h3 className="font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-3">KẾT QUẢ PHÂN TÍCH</h3>
           <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-600">Chẩn đoán sơ bộ:</span>
                 <span className="font-bold text-red-600">{scanData.diagnosis}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-600">Mức độ nghiêm trọng:</span>
                 <span className={`font-bold px-2 py-0.5 rounded text-xs ${scanData.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{scanData.severity.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-600">Độ tin cậy AI:</span>
                 <span className="font-mono font-bold">{(scanData.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-600">Diện tích tổn thương:</span>
                 <span className="font-mono font-bold">{scanData.lesionArea} mm²</span>
              </div>
           </div>
        </div>

        {/* Doctor Note */}
        <div className="mb-8 bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
           <h3 className="font-bold text-yellow-800 mb-2 text-sm">GHI CHÚ CỦA BÁC SĨ:</h3>
           <p className="text-gray-800 italic text-sm min-h-[60px]">{scanData.doctorNote}</p>
        </div>

        {/* Signature */}
        <div className="absolute bottom-12 right-12 text-center">
           <p className="text-xs text-gray-500 mb-8">Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
           <p className="font-bold text-gray-800">Bác sĩ chuyên khoa</p>
           <p className="text-gray-400 text-xs mt-12">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      {/* 2. RIGHT: ACTION SIDEBAR */}
      <div className="w-80 flex flex-col gap-4 h-fit sticky top-8">
        <div className="bg-medical-card border border-medical-border p-6 rounded-2xl shadow-lg">
           <h2 className="text-xl font-bold text-medical-text mb-4">Thao tác</h2>
           <p className="text-medical-subtext text-sm mb-6">Kiểm tra lại thông tin trước khi xuất bản.</p>
           
           <div className="space-y-3">
              <button onClick={handleDownloadPDF} className="w-full py-3 bg-medical-accent hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
                 <Download size={18} /> Tải PDF
              </button>
              <button onClick={() => window.print()} className="w-full py-3 bg-medical-hover border border-medical-border text-medical-text font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                 <Printer size={18} /> In ngay
              </button>
              <button className="w-full py-3 bg-medical-hover border border-medical-border text-medical-text font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                 <Share2 size={18} /> Gửi Email
              </button>
           </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
           <FileCheck className="text-green-500" size={24} />
           <div>
              <p className="text-sm font-bold text-green-600">Dữ liệu đã lưu</p>
              <p className="text-xs text-green-600/70">Hồ sơ đã được cập nhật vào hệ thống.</p>
           </div>
        </div>

        <button onClick={() => navigate('/patients')} className="mt-4 flex items-center justify-center gap-2 text-medical-subtext hover:text-medical-text transition-colors">
           <ChevronLeft size={16} /> Quay về danh sách
        </button>
      </div>

    </div>
  );
};

export default ReportPreviewPage;