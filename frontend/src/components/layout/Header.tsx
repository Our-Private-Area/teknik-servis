import { Search, Bell, Moon, Sun, User, Building2, Crown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useTenantStore } from '../../store/tenantStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
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
        {isSuperAdmin && (
          <Link
            to="/super-admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.25))',
              color: '#fbbf24',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
            }}
            title="Platform Sahibi Paneline Dön (Gelir / Gider & Tüm İşletmeler)"
          >
            <Crown size={14} />
            <span>Süper Admin Paneli</span>
          </Link>
        )}

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 8,
            background: 'rgba(0, 113, 227, 0.12)',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 600,
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
          title={currentTenant.name}
        >
          <Building2 size={14} />
          <span>{currentTenant.brandName || currentTenant.name}</span>
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
