import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Building2,
  Crown,
  LogOut,
  Menu,
  Globe,
  ExternalLink,
  X,
  Wrench,
  ArrowRight,
  Smartphone,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useTenantStore } from '../../store/tenantStore';
import { useAuthStore } from '../../store/authStore';
import { useTenantServices, useTenantCustomers } from '../../hooks/useTenantData';
import { SERVICE_STATUS_MAP } from '../../types';
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

  const services = useTenantServices();
  const customers = useTenantCustomers();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Filtered live results
  const q = searchQuery.trim().toLowerCase();
  const phoneQuery = q.replace(/\D/g, '');

  const matchedServices = useMemo(() => {
    if (!q) return [];
    return services
      .filter((s) => {
        const matchTracking =
          s.trackingNo?.toLowerCase().includes(q) ||
          s.trackingNo?.replace(/-/g, '').toLowerCase().includes(q);
        const matchCustomer = s.customerName?.toLowerCase().includes(q);
        const matchPhone = Boolean(
          phoneQuery &&
            phoneQuery.length >= 3 &&
            s.customerPhone?.replace(/\D/g, '').includes(phoneQuery)
        );
        const matchDevice = `${s.deviceBrand || ''} ${s.deviceModel || ''}`
          .toLowerCase()
          .includes(q);
        const matchIssue =
          s.complaint?.toLowerCase().includes(q) ||
          s.diagnosis?.toLowerCase().includes(q);
        const matchImei =
          s.imei?.includes(q) || s.serialNo?.toLowerCase().includes(q);
        return (
          matchTracking ||
          matchCustomer ||
          matchPhone ||
          matchDevice ||
          matchIssue ||
          matchImei
        );
      })
      .slice(0, 5);
  }, [services, q, phoneQuery]);

  const matchedCustomers = useMemo(() => {
    if (!q) return [];
    return customers
      .filter((c) => {
        const matchName = c.fullName?.toLowerCase().includes(q);
        const matchPhone = Boolean(
          phoneQuery &&
            phoneQuery.length >= 3 &&
            c.phone?.replace(/\D/g, '').includes(phoneQuery)
        );
        const matchEmail = c.email?.toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail;
      })
      .slice(0, 3);
  }, [customers, q, phoneQuery]);

  // Click outside detection for desktop search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 60);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus mobile input when overlay opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 60);
    }
  }, [isMobileSearchOpen]);

  const handleSelectService = (serviceId: string) => {
    navigate(`/panel/servisler/${serviceId}`);
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectCustomer = () => {
    navigate('/panel/musteriler');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const handleViewAllServices = () => {
    navigate(`/panel/servisler?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    toast.success('Oturum kapatıldı.');
    navigate('/giris');
  };

  const hasResults = matchedServices.length > 0 || matchedCustomers.length > 0;

  // Search Results Dropdown Content (Shared between Desktop and Mobile)
  const renderSearchResults = () => (
    <div className="header__search-results-inner">
      {matchedServices.length > 0 && (
        <div className="header__search-section">
          <div className="header__search-section-title">
            <Wrench size={12} />
            <span>Servis Kayıtları ({matchedServices.length})</span>
          </div>
          <div className="header__search-list">
            {matchedServices.map((srv) => {
              const statusCfg = SERVICE_STATUS_MAP[srv.status];
              return (
                <div
                  key={srv.id}
                  className="header__search-item header__search-item--service"
                  onClick={() => handleSelectService(srv.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="header__search-item-main">
                    <div className="header__search-item-top">
                      <span className="header__search-tracking-badge">
                        {srv.trackingNo}
                      </span>
                      {statusCfg && (
                        <span
                          className="header__search-status-badge"
                          style={{
                            color: statusCfg.color,
                            backgroundColor: statusCfg.bgColor,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      )}
                    </div>
                    <div className="header__search-customer-name">
                      {srv.customerName || 'İsimsiz Müşteri'}
                    </div>
                    <div className="header__search-device-desc">
                      <Smartphone size={12} />
                      <span>
                        {srv.deviceBrand} {srv.deviceModel}
                        {srv.customerPhone ? ` • ${srv.customerPhone}` : ''}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="header__search-arrow" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matchedCustomers.length > 0 && (
        <div className="header__search-section">
          <div className="header__search-section-title">
            <Users size={12} />
            <span>Müşteriler ({matchedCustomers.length})</span>
          </div>
          <div className="header__search-list">
            {matchedCustomers.map((c) => (
              <div
                key={c.id}
                className="header__search-item header__search-item--customer"
                onClick={handleSelectCustomer}
                role="button"
                tabIndex={0}
              >
                <div className="header__search-item-main">
                  <div className="header__search-customer-name">
                    {c.fullName}
                  </div>
                  <div className="header__search-device-desc">
                    <span>{c.phone}</span>
                    {c.email ? <span> • {c.email}</span> : null}
                  </div>
                </div>
                <ArrowRight size={14} className="header__search-arrow" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasResults && (
        <div className="header__search-empty">
          <Search size={24} className="header__search-empty-icon" />
          <p className="header__search-empty-text">Sonuç bulunamadı</p>
          <span className="header__search-empty-sub">
            "{searchQuery}" ile eşleşen servis veya müşteri kaydı yok.
          </span>
        </div>
      )}

      {/* Footer view-all link */}
      <div
        className="header__search-footer"
        onClick={handleViewAllServices}
        role="button"
        tabIndex={0}
      >
        <span>
          Tüm servislerde ara: <strong>"{searchQuery}"</strong>
        </span>
        <ArrowRight size={13} />
      </div>
    </div>
  );

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

        {/* İşletme Rozeti (Hangi işletme giriş yaptıysa o yazar) -> Ayarlara yönlendirir */}
        <Link
          to="/panel/ayarlar"
          className="header__tenant-badge"
          title={`${currentTenant.brandName || currentTenant.name} - Ayarlara Git`}
        >
          <Building2 size={14} className="header__tenant-icon" />
          <span className="header__tenant-text">{currentTenant.brandName || currentTenant.name}</span>
        </Link>

        {/* Web Siteye Git Butonu (Hangi işletme giriş yaptıysa onun web sitesini açar) */}
        <a
          href={`/${currentTenant.slug || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="header__website-btn"
          title={`${currentTenant.brandName || currentTenant.name} Web Sitesine Git (Yeni Sekme)`}
        >
          <Globe size={13} className="header__website-icon" />
          <span className="header__website-text">Web Siteye Git</span>
          <ExternalLink size={11} className="header__website-arrow" />
        </a>

        {title && (
          <div className="header__title-group">
            <h1 className="header__title">{title}</h1>
            {subtitle && <p className="header__subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="header__right">
        {/* Live Search (Desktop) */}
        <div className="header__search" ref={searchRef}>
          <Search size={16} className="header__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="header__search-input"
            placeholder="Servis no, müşteri veya telefon ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (matchedServices.length > 0) {
                  handleSelectService(matchedServices[0].id);
                } else if (searchQuery.trim()) {
                  handleViewAllServices();
                }
              }
            }}
          />

          {searchQuery ? (
            <button
              type="button"
              className="header__search-clear"
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              title="Temizle"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="header__search-kbd">⌘K</kbd>
          )}

          {/* Desktop Search Dropdown */}
          {isOpen && searchQuery.trim().length > 0 && (
            <div className="header__search-dropdown">
              {renderSearchResults()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="header__actions">
          {/* Mobile Search Button (visible only on mobile) */}
          <button
            type="button"
            className="header__action-btn header__mobile-search-btn"
            onClick={() => setIsMobileSearchOpen(true)}
            title="Arama Yap"
            aria-label="Arama"
          >
            <Search size={18} />
          </button>

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

          {/* Profil Alanı (Giriş yapan işletme adı) -> Ayarlara yönlendirir */}
          <Link
            to="/panel/ayarlar"
            className="header__profile"
            title="Profil ve Ayarlara Git"
          >
            <div className="header__avatar">
              <User size={16} />
            </div>
            <span className="header__profile-name">
              {currentUser?.name || currentTenant.brandName || currentTenant.name || 'Yetkili'}
            </span>
          </Link>

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

      {/* Responsive Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div
          className="header__mobile-search-overlay"
          onClick={() => setIsMobileSearchOpen(false)}
        >
          <div
            className="header__mobile-search-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header__mobile-search-header">
              <Search size={18} className="header__mobile-search-icon" />
              <input
                ref={mobileInputRef}
                type="text"
                className="header__mobile-search-input"
                placeholder="Servis no, müşteri veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (matchedServices.length > 0) {
                      handleSelectService(matchedServices[0].id);
                    } else if (searchQuery.trim()) {
                      handleViewAllServices();
                    }
                  }
                }}
              />
              <button
                type="button"
                className="header__mobile-search-close"
                onClick={() => setIsMobileSearchOpen(false)}
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {searchQuery.trim().length > 0 ? (
              <div className="header__mobile-search-body">
                {renderSearchResults()}
              </div>
            ) : (
              <div className="header__mobile-search-hint">
                <p>Aramak için servis numarası, müşteri adı, telefon veya cihaz modeli yazın.</p>
                <div className="header__mobile-search-quick-tags">
                  <span onClick={() => setSearchQuery('SRV')}>#SRV</span>
                  <span onClick={() => setSearchQuery('iPhone')}>iPhone</span>
                  <span onClick={() => setSearchQuery('Samsung')}>Samsung</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
