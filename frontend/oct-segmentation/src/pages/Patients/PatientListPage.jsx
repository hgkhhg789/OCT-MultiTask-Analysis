// src/pages/Patients/PatientListPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, AlertTriangle, UserCheck, Eye, MoreHorizontal, FileText, X, Save, UserPlus } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

const PatientListPage = () => {
  const navigate = useNavigate();
  const { patients, addPatient } = usePatients();
  
  // STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All'); 

  // STATES CHO MODAL THÊM BỆNH NHÂN
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Nam',
    phone: ''
  });

  // LOGIC LỌC
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const currentSeverity = p.history.length > 0 ? p.history[0].severity : 'None';
    const matchesFilter = filterSeverity === 'All' || currentSeverity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  // LOGIC THÊM BỆNH NHÂN MỚI
  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age) return alert("Vui lòng nhập tên và tuổi!");

    const newRecord = {
      id: `BN${Math.floor(1000 + Math.random() * 9000)}`, // Sinh ID ngẫu nhiên: BNxxxx
      name: newPatient.name,
      age: newPatient.age,
      gender: newPatient.gender,
      phone: newPatient.phone || 'Chưa cập nhật',
      lastVisit: 'Chưa khám',
      medicalHistory: [],
      riskLevel: 'None', // Mặc định là bình thường
      history: [] // Chưa có lịch sử khám
    };

    addPatient(newRecord); // Gọi hàm từ Context
    setShowModal(false); // Đóng modal
    setNewPatient({ name: '', age: '', gender: 'Nam', phone: '' }); // Reset form
  };

  // Thống kê nhanh
  const totalPatients = patients.length;
  const highRiskCount = patients.filter(p => p.history[0]?.severity === 'High').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-medical-text">Danh Sách Bệnh Nhân</h1>
          <p className="text-medical-subtext mt-1">Quản lý hồ sơ và theo dõi trạng thái bệnh lý.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-500/10 text-blue-600 px-4 py-2 rounded-xl border border-blue-500/20 text-sm font-bold">
            Tổng: {totalPatients} hồ sơ
          </div>
          <div className="bg-red-500/10 text-red-600 px-4 py-2 rounded-xl border border-red-500/20 text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={16} /> Nguy cơ cao: {highRiskCount}
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-medical-card p-4 rounded-2xl border border-medical-border shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-subtext" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Tên, Mã Y Tế (PID)..." 
            className="w-full bg-medical-bg border border-medical-border text-medical-text pl-10 pr-4 py-2.5 rounded-xl focus:border-medical-accent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-medical-bg border border-medical-border rounded-xl">
            <Filter size={16} className="text-medical-subtext" />
            <select 
              className="bg-transparent text-sm font-bold text-medical-text outline-none cursor-pointer w-full"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="All" className="bg-medical-card text-medical-text">Tất cả trạng thái</option>
              <option value="High" className="bg-medical-card text-medical-text">Nguy hiểm (High)</option>
              <option value="Medium" className="bg-medical-card text-medical-text">Cảnh báo (Medium)</option>
              <option value="None" className="bg-medical-card text-medical-text">Bình thường</option>
            </select>
          </div>

          {/* NÚT MỞ MODAL THÊM MỚI */}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-medical-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-all"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* 3. DATATABLE */}
      <div className="bg-medical-card rounded-2xl border border-medical-border shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-medical-hover text-xs uppercase font-bold text-medical-subtext border-b border-medical-border">
            <tr>
              <th className="px-6 py-4">Bệnh nhân</th>
              <th className="px-6 py-4">Lần khám cuối</th>
              <th className="px-6 py-4">Chẩn đoán mới nhất</th>
              <th className="px-6 py-4">Mức độ</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-medical-border text-medical-text text-sm">
            {filteredPatients.map((patient) => {
              const lastRecord = patient.history[0];
              return (
                <tr 
                  key={patient.id} 
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="hover:bg-medical-hover transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-medical-hover border border-medical-border flex items-center justify-center font-bold text-medical-accent">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-base">{patient.name}</p>
                        <p className="text-xs text-medical-subtext">ID: {patient.id} • {patient.age}T / {patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-medical-subtext">{patient.lastVisit}</td>
                  <td className="px-6 py-4 font-medium">
                    {lastRecord ? lastRecord.diagnosis : <span className="text-medical-subtext italic">Chưa khám</span>}
                  </td>
                  <td className="px-6 py-4">
                    {lastRecord?.severity === 'High' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold border border-red-200"><AlertTriangle size={12} /> High Risk</span>
                    ) : lastRecord?.severity === 'Medium' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold border border-yellow-200">Warning</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold border border-green-200"><UserCheck size={12} /> Stable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); navigate('/exam/new'); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Khám ngay"><Eye size={16} /></button>
                      <button className="p-2 text-medical-subtext hover:bg-medical-hover rounded-lg"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPatients.length === 0 && (
          <div className="p-12 text-center text-medical-subtext flex flex-col items-center">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>Không tìm thấy hồ sơ phù hợp.</p>
          </div>
        )}
      </div>

      {/* --- MODAL THÊM BỆNH NHÂN (MỚI) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-medical-card w-full max-w-lg rounded-2xl shadow-2xl border border-medical-border overflow-hidden animate-scale-up">
            
            {/* Header Modal */}
            <div className="bg-medical-hover p-4 flex justify-between items-center border-b border-medical-border">
              <h3 className="text-lg font-bold text-medical-text flex items-center gap-2">
                <UserPlus className="text-medical-accent" size={20} /> Thêm Hồ Sơ Mới
              </h3>
              <button onClick={() => setShowModal(false)} className="text-medical-subtext hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-medical-subtext uppercase">Họ và Tên (*)</label>
                 <input 
                   type="text" required autoFocus
                   className="w-full bg-medical-bg border border-medical-border text-medical-text px-4 py-3 rounded-xl focus:border-medical-accent outline-none"
                   placeholder="Nhập tên bệnh nhân..."
                   value={newPatient.name}
                   onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-medical-subtext uppercase">Tuổi (*)</label>
                    <input 
                      type="number" required min="1" max="120"
                      className="w-full bg-medical-bg border border-medical-border text-medical-text px-4 py-3 rounded-xl focus:border-medical-accent outline-none"
                      placeholder="VD: 65"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-medical-subtext uppercase">Giới tính</label>
                    <select 
                      className="w-full bg-medical-bg border border-medical-border text-medical-text px-4 py-3 rounded-xl focus:border-medical-accent outline-none"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-medical-subtext uppercase">Số điện thoại</label>
                 <input 
                   type="text"
                   className="w-full bg-medical-bg border border-medical-border text-medical-text px-4 py-3 rounded-xl focus:border-medical-accent outline-none"
                   placeholder="VD: 0912..."
                   value={newPatient.phone}
                   onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                 />
              </div>

              <div className="pt-4 flex gap-3 border-t border-medical-border mt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-transparent border border-medical-border text-medical-subtext hover:bg-medical-hover hover:text-medical-text font-bold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-medical-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Lưu Hồ Sơ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListPage;