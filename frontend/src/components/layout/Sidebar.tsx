import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Package,
  UserCog,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building2,
  Globe,
  X,
} from 'lucide-react';
import './Sidebar.css';

import { useAuthStore } from '../../store/authStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/panel', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/panel/web-sitesi', label: 'Web Sayfam & Tema', icon: <Globe size={20} color="#38bdf8" /> },
  { path: '/panel/servisler', label: 'Servisler', icon: <Wrench size={20} /> },
  { path: '/panel/musteriler', label: 'Müşteriler', icon: <Users size={20} /> },
  { path: '/panel/stok', label: 'Stok', icon: <Package size={20} /> },
  { path: '/panel/personel', label: 'Personel', icon: <UserCog size={20} /> },
  { path: '/panel/kasa', label: 'Kasa', icon: <Wallet size={20} /> },
  { path: '/panel/raporlar', label: 'Raporlar', icon: <BarChart3 size={20} /> },
  { path: '/panel/isletmeler', label: 'İşletmeler (SaaS)', icon: <Building2 size={20} />, superAdminOnly: true },
  { path: '/panel/ayarlar', label: 'Ayarlar', icon: <Settings size={20} /> },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const visibleNavItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  const isActive = (path: string) => {
    if (path === '/panel') return location.pathname === '/panel';
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Zap size={22} />
          </div>
          {!collapsed && (
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">TeknikPro</span>
              <span className="sidebar__brand-sub">Servis Yönetimi</span>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar__mobile-close"
            onClick={onClose}
            aria-label="Menüyü Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <ul className="sidebar__list">
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/panel'}
                  className={`sidebar__link ${isActive(item.path) ? 'sidebar__link--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  onClick={handleLinkClick}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {(!collapsed || isOpen) && <span className="sidebar__link-label">{item.label}</span>}
                  {isActive(item.path) && <span className="sidebar__link-indicator" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle (Desktop only) */}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Daralt</span>}
        </button>
      </aside>
    </>
  );
}
