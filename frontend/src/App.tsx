import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import ServiceList from './pages/admin/Services/ServiceList';
import NewService from './pages/admin/Services/NewService';
import ServiceDetail from './pages/admin/Services/ServiceDetail';
import CustomerList from './pages/admin/Customers/CustomerList';
import StockList from './pages/admin/Stock/StockList';
import CashManagement from './pages/admin/Cash/CashManagement';
import ReportsPage from './pages/admin/Reports/ReportsPage';
import StaffList from './pages/admin/Staff/StaffList';
import SettingsPage from './pages/admin/Settings/SettingsPage';
import TenantManagement from './pages/admin/Tenants/TenantManagement';
import WebsiteSettings from './pages/admin/Website/WebsiteSettings';
import { useEffect } from 'react';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import LandingPage from './pages/landing/LandingPage';
import TenantPublicPage from './pages/tenant-public/TenantPublicPage';
import TrackingPage from './pages/customer/TrackingPage';
import BookingPage from './pages/customer/BookingPage';
import { seedFirestoreIfEmpty } from './services/seedFirestore';

export default function App() {
  useEffect(() => {
    seedFirestoreIfEmpty();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Platform Ana Sayfası (Herkese Açık SaaS Tanıtım) */}
        <Route path="/" element={<LandingPage />} />

        {/* Platform Giriş Sayfaları */}
        <Route path="/giris" element={<Login />} />
        <Route path="/admin-giris" element={<AdminLogin />} />

        {/* Global / Varsayılan Müşteri Takip & Randevu */}
        <Route path="/servis-sorgulama" element={<TrackingPage />} />
        <Route path="/servis-sorgulama/:id" element={<TrackingPage />} />
        <Route path="/servis-randevusu" element={<BookingPage />} />
        <Route path="/takip" element={<Navigate to="/servis-sorgulama" replace />} />
        <Route path="/takip/:id" element={<TrackingPage />} />

        {/* Platform Sahibi / Super Admin Paneli */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/super-admin" replace />} />

        {/* İşletme Yönetim Paneli */}
        <Route path="/panel" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="web-sitesi" element={<WebsiteSettings />} />
          <Route path="servisler" element={<ServiceList />} />
          <Route path="servisler/yeni" element={<NewService />} />
          <Route path="servisler/:id" element={<ServiceDetail />} />
          <Route path="musteriler" element={<CustomerList />} />
          <Route path="stok" element={<StockList />} />
          <Route path="personel" element={<StaffList />} />
          <Route path="kasa" element={<CashManagement />} />
          <Route path="raporlar" element={<ReportsPage />} />
          <Route path="isletmeler" element={<TenantManagement />} />
          <Route path="ayarlar" element={<SettingsPage />} />
        </Route>

        {/* İşletmeye Özel Halka Açık Sayfalar (Slug bazlı) */}
        <Route path="/:slug" element={<TenantPublicPage />} />
        <Route path="/:slug/servis-sorgulama" element={<TrackingPage />} />
        <Route path="/:slug/servis-sorgulama/:id" element={<TrackingPage />} />
        <Route path="/:slug/servis-randevusu" element={<BookingPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card, #111827)',
            color: 'var(--text-primary, #ffffff)',
            border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.1))',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
          },
        }}
      />
    </BrowserRouter>
  );
}

