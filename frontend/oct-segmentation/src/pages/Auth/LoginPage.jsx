import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Lock, Mail, Activity } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Giả lập gọi API login
    setTimeout(() => {
      setLoading(false);
      navigate('/'); // Chuyển về Dashboard
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RetinaNet.AI</h1>
          <p className="text-slate-400 mt-2">Hệ thống hỗ trợ chẩn đoán hình ảnh OCT</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email công vụ</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="email" placeholder="doctor@hospital.com" className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition-colors" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="password" placeholder="••••••••" className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition-colors" required />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300">Quên mật khẩu?</a>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-500 mt-6">
          Phần mềm tuân thủ tiêu chuẩn bảo mật HIPAA & GDPR.<br/>
          Phiên bản v2.5.0 - Build 2025
        </p>
      </div>
    </div>
  );
};

export default LoginPage;