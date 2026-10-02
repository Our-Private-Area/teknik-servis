import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { useThemeStore } from '../../store/themeStore';
import { applyAdminTheme } from '../../utils/themeUtils';
import Sidebar from './Sidebar';
import Header from './Header';
import './AdminLayout.css';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const { currentTenant, tenants, setCurrentTenant } = useTenantStore();
  const { theme } = useThemeStore();

  // Oturum açan hangi işletmeyse (Kadıköy Cep, Bursa Bilişim, TeknikPro vb.) başlığı ve verileri dinamik eşitle
  useEffect(() => {
    if (currentUser?.tenantId && currentTenant.id !== currentUser.tenantId) {
      const matched = tenants.find((t) => t.id === currentUser.tenantId);
      if (matched) {
        setCurrentTenant(matched);
      }
    }
  }, [currentUser?.tenantId, currentTenant.id, tenants, setCurrentTenant]);

  // İşletmenin seçtiği panel renk temasını (Varsayılan, Web Sitesi veya Özel Renk) uygula
  useEffect(() => {
    applyAdminTheme(currentTenant.theme, theme === 'dark');
    return () => {
      applyAdminTheme(null);
    };
  }, [currentTenant.theme, theme]);

  // Route değiştiğinde mobilde menüyü otomatik kapat
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="admin-layout__main">
        <Header onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
