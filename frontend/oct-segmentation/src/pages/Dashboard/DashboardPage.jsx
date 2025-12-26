import React from 'react';
import { Users, Activity, Clock, FileCheck, Search, Plus, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-medical-card p-6 rounded-2xl border border-medical-border shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-medical-subtext text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-medical-text mt-2">{value}</h3>
        <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${subtext.includes('+') ? 'text-green-500' : 'text-medical-subtext'}`}>
          {subtext.includes('+') && <ArrowUpRight size={12} />} {subtext}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();

  // Mock Data cho danh sách chờ
  const pendingScans = [
    { id: 'S001', patient: 'Lê Văn C', time: '10 phút trước', status: 'AI Processing', risk: 'High' },
    { id: 'S002', patient: 'Phạm Thị D', time: '30 phút trước', status: 'Ready to Review', risk: 'Medium' },
    { id: 'S003', patient: 'Nguyễn Văn E', time: '1 giờ trước', status: 'Ready to Review', risk: 'Low' },
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      
      {/* 1. WELCOME & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-medical-text">Xin chào, Bs. Nguyễn Minh Trí 👋</h1>
          <p className="text-medical-subtext">Hôm nay bạn có <strong className="text-medical-accent">5 ca chụp mới</strong> cần chẩn đoán.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/patients')} 
            className="px-4 py-2 border border-medical-border bg-medical-card text-medical-text hover:bg-medical-hover rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Search size={18} /> Tìm Bệnh Nhân
          </button>
          <button 
            onClick={() => navigate('/exam/new')}
            className="px-4 py-2 bg-medical-accent text-white hover:bg-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={18} /> Thêm Ca Chụp Mới
          </button>
        </div>
      </div>

      {/* 2. QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Bệnh nhân mới" value="12" subtext="+2 so với hôm qua" icon={Users} colorClass="bg-blue-500/10 text-blue-500" />
        <StatCard title="Ca chụp chờ duyệt" value="5" subtext="Cần xử lý gấp" icon={Clock} colorClass="bg-orange-500/10 text-orange-500" />
        <StatCard title="Ca nguy hiểm cao" value="3" subtext="Phát hiện bởi AI" icon={AlertCircle} colorClass="bg-red-500/10 text-red-500" />
        <StatCard title="Đã hoàn thành" value="28" subtext="Trong tuần này" icon={FileCheck} colorClass="bg-green-500/10 text-green-500" />
      </div>

      {/* 3. RECENT ACTIVITY & PENDING SCANS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Danh sách chờ xử lý */}
        <div className="lg:col-span-2 bg-medical-card rounded-2xl border border-medical-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-medical-border flex justify-between items-center">
            <h3 className="font-bold text-medical-text flex items-center gap-2"><Activity size={18} className="text-medical-accent"/> Danh Sách Chờ Duyệt (Pending Queue)</h3>
            <span className="text-xs font-bold text-medical-accent cursor-pointer hover:underline">Xem tất cả</span>
          </div>
          <div className="divide-y divide-medical-border">
            {pendingScans.map((scan) => (
              <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-medical-hover transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${scan.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {scan.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-medical-text text-sm">{scan.patient}</h4>
                    <p className="text-xs text-medical-subtext">{scan.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold border ${
                    scan.status === 'AI Processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                    'bg-green-500/10 text-green-500 border-green-500/20'
                  }`}>
                    {scan.status}
                  </span>
                  <button onClick={() => navigate(`/exam/${scan.id}/analyze`)} className="px-3 py-1.5 bg-medical-accent text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Xử lý
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Thông báo hệ thống */}
        <div className="bg-medical-card rounded-2xl border border-medical-border shadow-sm p-5">
           <h3 className="font-bold text-medical-text mb-4">Thông báo hệ thống</h3>
           <div className="space-y-4">
              <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                 <div>
                    <p className="text-sm text-medical-text font-medium">Bảo trì hệ thống AI</p>
                    <p className="text-xs text-medical-subtext mt-1">Hệ thống sẽ bảo trì định kỳ vào 02:00 AM ngày mai.</p>
                 </div>
              </div>
              <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0"></div>
                 <div>
                    <p className="text-sm text-medical-text font-medium">Cập nhật Model v2.1</p>
                    <p className="text-xs text-medical-subtext mt-1">Cải thiện độ chính xác phát hiện SRF lên 98%.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;