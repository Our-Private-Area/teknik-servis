import { Search, Bell, Moon, Sun, User, Building2, Crown, LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useTenantStore } from '../../store/tenantStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export default function Header({ title, subtitle, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { currentTenant } = useTenantStore();
  const { currentUser, logout } = useAuthStore();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    toast.success('Oturum kapatıldı.');
    navigate('/giris');
  };

  return (
    <header className="header">
      <div className="header__left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="header__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Menüyü Aç"
        >
          <Menu size={22} />
        </button>

        {isSuperAdmin && (
          <Link
            to="/super-admin"
            className="header__superadmin-badge"
            title="Platform Sahibi Paneline Dön (Gelir / Gider & Tüm İşletmeler)"
          >
            <Crown size={14} />
            <span className="header__badge-label">Süper Admin</span>
          </Link>
        )}

        <div
          className="header__tenant-badge"
          title={currentTenant.name}
        >
          <Building2 size={14} className="header__tenant-icon" />
          <span className="header__tenant-text">{currentTenant.brandName || currentTenant.name}</span>
        </div>

        {title && (
          <div className="header__title-group">
            <h1 className="header__title">{title}</h1>
            {subtitle && <p className="header__subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="header__right">
        {/* Search */}
        <div className="header__search">
          <Search size={16} className="header__search-icon" />
          <input
            type="text"
            className="header__search-input"
            placeholder="Servis no, müşteri veya telefon ara..."
          />
          <kbd className="header__search-kbd">⌘K</kbd>
        </div>

        {/* Actions */}
        <div className="header__actions">
          {/* Theme Toggle */}
          <button
            className="header__action-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button className="header__action-btn header__action-btn--notification" title="Bildirimler">
            <Bell size={18} />
            <span className="header__notification-dot" />
          </button>

          {/* Profile */}
          <div className="header__profile" title={currentUser?.email || 'Kullanıcı'}>
            <div className="header__avatar">
              <User size={16} />
            </div>
            <span className="header__profile-name">
              {currentUser?.name || 'Yetkili'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            className="header__action-btn"
            onClick={handleLogout}
            title="Güvenli Çıkış Yap"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
