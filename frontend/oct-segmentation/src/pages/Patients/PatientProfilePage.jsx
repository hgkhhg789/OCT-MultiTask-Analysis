import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Activity, GitMerge, FileText, 
  TrendingUp, SplitSquareHorizontal, ImageIcon, AlertCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePatients } from '../../context/PatientContext';

const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients } = usePatients();
  
  // Lấy dữ liệu BN từ ID trên URL
  const patient = patients.find(p => p.id === id);

  // STATES
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'images'
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]); // Mảng chứa 2 ID lần khám để so sánh

  if (!patient) return <div className="p-8 text-center">Không tìm thấy bệnh nhân</div>;

  // Chuẩn bị dữ liệu biểu đồ (Đảo ngược để vẽ từ quá khứ -> hiện tại)
  const chartData = [...patient.history].reverse().map(h => ({
    date: h.date,
    size: h.lesionSize || 0, // Kích thước tổn thương (mm2)
    severity: h.severity
  }));

  // Xử lý chọn ảnh để so sánh
  const handleToggleCompare = (visit) => {
    if (!compareMode) return;
    
    setCompareSelection(prev => {
      // Nếu đã chọn rồi thì bỏ chọn
      if (prev.find(v => v.id === visit.id)) {
        return prev.filter(v => v.id !== visit.id);
      }
      // Nếu chưa chọn và chưa đủ 2 slot thì thêm vào
      if (prev.length < 2) {
        return [...prev, visit];
      }
      // Nếu đã đủ 2 thì thay thế cái cũ nhất (UX nâng cao)
      return [prev[1], visit];
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-medical-bg animate-fade-in">
      
      {/* 1. PROFILE HEADER (STICKY) */}
      <div className="bg-medical-card border-b border-medical-border p-6 shadow-sm shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/patients')} className="p-2 hover:bg-medical-hover rounded-full text-medical-subtext">
              <ArrowLeft size={24} />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
                {patient.name}
                {patient.riskLevel === 'High' && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded animate-pulse">HIGH RISK</span>
                )}
              </h1>
              <div className="flex items-center gap-4 text-sm text-medical-subtext mt-1">
                <span className="font-mono bg-medical-hover px-2 py-0.5 rounded border border-medical-border">{patient.id}</span>
                <span>{patient.gender} • {patient.age} Tuổi</span>
                <span className="flex items-center gap-1"><Calendar size={14}/> Lần cuối: {patient.lastVisit}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             <button className="px-4 py-2 bg-medical-hover border border-medical-border text-medical-text font-bold rounded-xl flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                <GitMerge size={18} /> Gộp Hồ Sơ
             </button>
             <button 
                onClick={() => navigate('/exam/new')}
                className="px-4 py-2 bg-medical-accent text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
             >
                <Activity size={18} /> Khám Mới
             </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (SCROLLABLE) */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* LEFT COLUMN: TIMELINE (Lịch sử khám) */}
        <div className="w-80 bg-medical-hover border-r border-medical-border overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-medical-border flex justify-between items-center bg-medical-card sticky top-0 z-10">
            <h3 className="font-bold text-medical-text">Lịch Sử Khám</h3>
            <button 
               onClick={() => { setCompareMode(!compareMode); setCompareSelection([]); }}
               className={`text-xs font-bold px-2 py-1 rounded border transition-all ${compareMode ? 'bg-blue-600 text-white border-blue-600' : 'text-medical-subtext border-medical-border hover:border-medical-accent'}`}
            >
               {compareMode ? 'Xong' : 'So sánh'}
            </button>
          </div>

          <div className="p-3 space-y-3">
            {patient.history.map((visit) => {
              const isSelected = compareSelection.find(v => v.id === visit.id);
              return (
                <div 
                  key={visit.id}
                  onClick={() => handleToggleCompare(visit)}
                  className={`relative p-3 rounded-xl border cursor-pointer transition-all group ${
                    isSelected 
                      ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' 
                      : 'bg-medical-card border-medical-border hover:border-medical-accent'
                  }`}
                >
                  {/* Selection Checkbox for Compare Mode */}
                  {compareMode && (
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-medical-subtext">{visit.date}</span>
                     {visit.severity === 'High' && <AlertCircle size={14} className="text-red-500" />}
                  </div>
                  
                  {/* Thumbnail Ảnh */}
                  <div className="h-24 w-full bg-black rounded-lg overflow-hidden relative border border-gray-700 mb-2">
                     <img src={visit.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="thumb" />
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white font-bold truncate">{visit.diagnosis}</p>
                     </div>
                  </div>

                  {/* Actions nhỏ */}
                  {!compareMode && (
                     <div className="flex gap-2 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/exam/${visit.id}/report`, { state: { patient, scanData: visit }}) }} className="flex-1 py-1.5 text-xs font-bold bg-medical-hover hover:bg-blue-100 text-medical-accent rounded border border-medical-border">
                           Xem Báo Cáo
                        </button>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DASHBOARD & COMPARISON */}
        <div className="flex-1 bg-medical-card overflow-y-auto p-6">
          
          {/* COMPARISON VIEW (Khi chọn 2 ảnh) */}
          {compareMode ? (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex items-center gap-2">
                 <SplitSquareHorizontal className="text-blue-500" />
                 <h2 className="text-lg font-bold">Chế độ So Sánh Tổn Thương</h2>
              </div>
              
              {compareSelection.length === 2 ? (
                 <div className="flex-1 grid grid-cols-2 gap-4">
                    {compareSelection.map((visit, idx) => (
                       <div key={idx} className="flex flex-col h-full border border-medical-border rounded-2xl overflow-hidden">
                          <div className="bg-medical-hover p-3 border-b border-medical-border flex justify-between">
                             <span className="font-bold text-medical-text">{visit.date}</span>
                             <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{visit.diagnosis}</span>
                          </div>
                          <div className="flex-1 bg-black relative flex items-center justify-center">
                             <img src={visit.imageUrl} className="max-w-full max-h-full object-contain" alt="compare" />
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="flex-1 border-2 border-dashed border-medical-border rounded-2xl flex flex-col items-center justify-center text-medical-subtext">
                    <ImageIcon size={48} className="mb-4 opacity-30" />
                    <p>Vui lòng chọn 2 lần khám từ cột bên trái để so sánh.</p>
                 </div>
              )}
            </div>
          ) : (
            /* OVERVIEW TAB (Mặc định) */
            <div className="space-y-6">
               
               {/* 1. CHART SECTION (KILLER FEATURE) */}
               <div className="bg-medical-bg p-6 rounded-2xl border border-medical-border">
                  <h3 className="text-lg font-bold text-medical-text mb-4 flex items-center gap-2">
                     <TrendingUp className="text-medical-accent" /> Diễn biến tổn thương (Progression)
                  </h3>
                  <div className="h-72 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                                 <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                           <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                           <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} unit="mm²" />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                              itemStyle={{ color: '#38bdf8' }}
                              formatter={(value) => [`${value} mm²`, 'Diện tích']}
                           />
                           <Area type="monotone" dataKey="size" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorSize)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* 2. CLINICAL INFO */}
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-medical-hover rounded-2xl border border-medical-border">
                     <h3 className="font-bold text-medical-text mb-4 flex items-center gap-2"><FileText size={18}/> Bệnh sử & Yếu tố nguy cơ</h3>
                     <ul className="list-disc list-inside space-y-2 text-medical-subtext">
                        {patient.medicalHistory?.map(h => <li key={h}>{h}</li>)}
                        {(!patient.medicalHistory || patient.medicalHistory.length === 0) && <li>Chưa ghi nhận bệnh nền.</li>}
                     </ul>
                  </div>
                  <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                     <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2"><Activity size={18}/> Khuyến nghị AI</h3>
                     <p className="text-medical-text text-sm leading-relaxed">
                        Bệnh nhân có xu hướng tăng diện tích tổn thương trong 3 tháng qua. 
                        Đề nghị theo dõi sát sao chỉ số SRF (Dịch dưới võng mạc).
                        Lịch tái khám đề xuất: <span className="font-bold">2 tuần/lần</span>.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientProfilePage;