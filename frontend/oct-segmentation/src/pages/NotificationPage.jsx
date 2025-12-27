import React, { useState } from 'react';
import { 
  Bell, Check, Trash2, Info, AlertTriangle, 
  CheckCircle2, Clock, Filter 
} from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { 
    id: 1, 
    type: 'warning', 
    title: 'Cảnh báo: Bệnh nhân BN005', 
    message: 'AI phát hiện tổn thương mở rộng > 15% so với lần trước. Cần hội chẩn gấp.', 
    time: '10 phút trước', 
    isRead: false 
  },
  { 
    id: 2, 
    type: 'success', 
    title: 'Hoàn tất phân tích', 
    message: 'Ca chụp của bệnh nhân Nguyễn Văn A đã được xử lý xong.', 
    time: '1 giờ trước', 
    isRead: false 
  },
  { 
    id: 3, 
    type: 'system', 
    title: 'Bảo trì hệ thống', 
    message: 'Hệ thống sẽ bảo trì định kỳ vào 02:00 AM ngày mai. Vui lòng lưu dữ liệu.', 
    time: '5 giờ trước', 
    isRead: true 
  },
  { 
    id: 4, 
    type: 'info', 
    title: 'Cập nhật Model AI v2.1', 
    message: 'Đã cải thiện độ chính xác phát hiện dịch rỉ (Fluid).', 
    time: '1 ngày trước', 
    isRead: true 
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Đánh dấu tất cả là đã đọc
  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Xóa 1 thông báo
  const deleteNote = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Lọc danh sách
  const filteredList = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  // Helper chọn icon theo loại
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-red-500" size={20} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'system': return <Info className="text-blue-500" size={20} />;
      default: return <Bell className="text-medical-subtext" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
            <Bell className="text-medical-accent" /> Trung Tâm Thông Báo
          </h1>
          <p className="text-medical-subtext mt-1">Cập nhật tin tức hệ thống và cảnh báo bệnh nhân.</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={markAllRead}
             className="px-4 py-2 bg-medical-card border border-medical-border hover:bg-medical-hover text-medical-text text-sm font-bold rounded-xl transition-all flex items-center gap-2"
           >
             <Check size={16} /> Đánh dấu đã đọc
           </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 border-b border-medical-border pb-1">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-2 text-sm font-bold transition-all ${filter === 'all' ? 'text-medical-accent border-b-2 border-medical-accent' : 'text-medical-subtext hover:text-medical-text'}`}
        >
          Tất cả ({notifications.length})
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`pb-2 text-sm font-bold transition-all ${filter === 'unread' ? 'text-medical-accent border-b-2 border-medical-accent' : 'text-medical-subtext hover:text-medical-text'}`}
        >
          Chưa đọc ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* LIST */}
      <div className="bg-medical-card rounded-2xl border border-medical-border shadow-sm overflow-hidden">
        {filteredList.length > 0 ? (
          <div className="divide-y divide-medical-border">
            {filteredList.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-medical-hover group ${!item.isRead ? 'bg-blue-500/5' : ''}`}
              >
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-medical-border ${!item.isRead ? 'bg-medical-card' : 'bg-medical-bg'}`}>
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${!item.isRead ? 'text-medical-text' : 'text-medical-subtext'}`}>
                      {item.title}
                      {!item.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500"></span>}
                    </h3>
                    <span className="text-xs text-medical-subtext flex items-center gap-1">
                      <Clock size={12} /> {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-medical-subtext mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                   <button 
                     onClick={() => deleteNote(item.id)}
                     className="p-2 text-medical-subtext hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                     title="Xóa thông báo"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-medical-subtext">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>Không có thông báo nào.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationPage;