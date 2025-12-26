import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';

// 1. AUTH PAGES
import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';

// 2. DASHBOARD
import DashboardPage from './pages/Dashboard/DashboardPage';

// 3. PATIENT MODULE (SỬA LỖI TẠI ĐÂY)
// Thay vì import PatientManager, ta import 2 trang mới đã tách
import PatientListPage from './pages/Patients/PatientListPage';     
import PatientProfilePage from './pages/Patients/PatientProfilePage'; 

// 4. EXAMINATION MODULE
import UploadScanPage from './pages/Examination/UploadScanPage';
import AnalysisViewerPage from './pages/Examination/AnalysisViewerPage';

// 5. REPORT MODULE
import ReportPreviewPage from './pages/Report/ReportPreviewPage';

function App() {
  // Giả lập trạng thái đăng nhập
  const isAuthenticated = true; 

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- PROTECTED ROUTES (CÓ LAYOUT) --- */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Patient Module Routes */}
          <Route path="patients" element={<PatientListPage />} />        {/* Danh sách BN */}
          <Route path="patients/:id" element={<PatientProfilePage />} /> {/* Chi tiết BN (Mini-EHR) */}

          {/* Examination Flow */}
          <Route path="exam/new" element={<UploadScanPage />} />
          <Route path="exam/:visitId/analyze" element={<AnalysisViewerPage />} />
          <Route path="exam/:visitId/report" element={<ReportPreviewPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;