// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';

// 1. AUTH PAGES
import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';

// 2. DASHBOARD
import DashboardPage from './pages/Dashboard/DashboardPage';

// 3. PATIENT MODULE
import PatientListPage from './pages/Patients/PatientListPage';     
import PatientProfilePage from './pages/Patients/PatientProfilePage'; 

// 4. EXAMINATION MODULE
import UploadScanPage from './pages/Examination/UploadScanPage';
import AnalysisViewerPage from './pages/Examination/AnalysisViewerPage';

// 5. REPORT MODULE
import ReportPreviewPage from './pages/Report/ReportPreviewPage';

// 6. NOTIFICATION MODULE (MỚI)
import NotificationPage from './pages/NotificationPage';

function App() {
  // Giả lập trạng thái đăng nhập (Sau này sẽ thay bằng logic kiểm tra token thật)
  const isAuthenticated = true; 

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES (Không cần đăng nhập) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- PROTECTED ROUTES (Cần đăng nhập & Có Layout Sidebar) --- */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          
          {/* Dashboard (Trang chủ) */}
          <Route index element={<DashboardPage />} />

          {/* Trang Thông Báo (Mới thêm) */}
          <Route path="notifications" element={<NotificationPage />} />
          
          {/* Patient Module Routes */}
          <Route path="patients" element={<PatientListPage />} />        {/* Danh sách BN */}
          <Route path="patients/:id" element={<PatientProfilePage />} /> {/* Hồ sơ chi tiết BN */}

          {/* Examination Flow (Quy trình khám) */}
          <Route path="exam/new" element={<UploadScanPage />} />
          <Route path="exam/:visitId/analyze" element={<AnalysisViewerPage />} />
          <Route path="exam/:visitId/report" element={<ReportPreviewPage />} />

          {/* Fallback (Nếu gõ link sai sẽ về trang chủ) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;