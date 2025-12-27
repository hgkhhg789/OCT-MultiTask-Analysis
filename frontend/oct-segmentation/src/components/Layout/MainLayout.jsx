// src/components/Layout/MainLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, FileText, Settings, LogOut, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../ThemeContext'; 

const MainLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xử lý đăng xuất
    navigate('/login');
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', name: 'Quản lý Bệnh nhân', icon: Users },
    { path: '/exam/new', name: 'Ca chụp mới', icon: Activity },
    // { path: '/reports', name: 'Báo cáo', icon: FileText }, 
  ];

  return (
    <div className="flex h-screen bg-medical-bg text-medical-text transition-colors duration-300">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-medical-card border-r border-medical-border hidden md:flex flex-col z-20 shadow-xl">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-medical-border">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight">RetinaNet<span className="text-blue-500">.AI</span></span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-medical-subtext hover:bg-medical-hover hover:text-medical-text'}
              `}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-medical-border">
            <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-medical-subtext hover:bg-medical-hover hover:text-medical-text transition-all font-medium">
              <Settings size={20} /> Cài đặt
            </NavLink>
          </div>
        </nav>

        {/* User Profile (Bottom Sidebar) */}
        <div className="p-4 border-t border-medical-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-medical-hover border border-medical-border">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-10 h-10 rounded-full bg-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Bs. Minh Trí</p>
              <p className="text-xs text-medical-subtext truncate">Khoa Chẩn đoán HA</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-medical-card/80 backdrop-blur border-b border-medical-border flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-medical-subtext hover:bg-medical-hover rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-bold text-medical-subtext uppercase tracking-wider hidden sm:block">
              Hệ thống hỗ trợ chẩn đoán OCT
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* NÚT CHUÔNG ĐÃ ĐƯỢC CẬP NHẬT */}
            <button 
              onClick={() => navigate('/notifications')} 
              className="p-2 text-medical-subtext hover:bg-medical-hover rounded-full relative transition-colors"
              title="Thông báo"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <button onClick={toggleTheme} className="p-2 text-medical-subtext hover:bg-medical-hover rounded-full">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-6 w-px bg-medical-border mx-2"></div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all">
              <LogOut size={18} /> <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-0 scroll-smooth">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;