import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Giả lập gửi API
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-4 border border-slate-600">
                <ShieldQuestion size={24} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Quên mật khẩu?</h1>
              <p className="text-slate-400 mt-2 text-sm">Nhập email công vụ của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com" 
                    className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition-colors" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : 'Gửi liên kết xác thực'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-4 border border-green-500/50">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Đã gửi email!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Vui lòng kiểm tra hộp thư đến của <strong>{email}</strong> và làm theo hướng dẫn để đặt lại mật khẩu.
            </p>
          </div>
        )}

        <div className="mt-6 text-center border-t border-slate-700 pt-4">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;