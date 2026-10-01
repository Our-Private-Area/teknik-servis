import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './AdminLayout.css';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
