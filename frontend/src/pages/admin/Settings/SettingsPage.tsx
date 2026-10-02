import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  Building2,
  Shield,
  Moon,
  Sun,
  Truck,
  Globe,
  CheckCircle,
  Copy,
  ExternalLink,
  Palette,
  Sparkles,
  Check,
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { useTenantStore } from '../../../store/tenantStore';
import { ADMIN_PRESET_COLORS, applyAdminTheme } from '../../../utils/themeUtils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { currentTenant, updateCurrentTenant, tenants, switchTenantBySlug } = useTenantStore();

  const [companyName, setCompanyName] = useState(currentTenant.name);
  const [brandName, setBrandName] = useState(currentTenant.brandName || '');
  const [phone, setPhone] = useState(currentTenant.phone);
  const [email, setEmail] = useState(currentTenant.email || '');
  const [address, setAddress] = useState(currentTenant.address || '');
  const [cargoCompany, setCargoCompany] = useState(currentTenant.cargoCompany || 'Yurtiçi Kargo');
  const [cargoCode, setCargoCode] = useState(currentTenant.cargoCode || '');
  const [warrantyDays, setWarrantyDays] = useState(currentTenant.warrantyDays || 90);
  const [terms, setTerms] = useState(currentTenant.terms || '');
  const [isSaving, setIsSaving] = useState(false);

  // Panel Tema Rengi Seçenekleri (Default, Web Sitesi veya Özel Renk)
  const [adminThemeMode, setAdminThemeMode] = useState<'default' | 'website_colors' | 'custom'>(
    currentTenant.theme?.adminThemeMode || 'default'
  );
  const [adminPrimaryColor, setAdminPrimaryColor] = useState(
    currentTenant.theme?.adminPrimaryColor || currentTenant.theme?.primaryColor || '#3b82f6'
  );

  // Sync state if currentTenant changes (e.g. from Firestore)
  useEffect(() => {
    setCompanyName(currentTenant.name);
    setBrandName(currentTenant.brandName || '');
    setPhone(currentTenant.phone);
    setEmail(currentTenant.email || '');
    setAddress(currentTenant.address || '');
    setCargoCompany(currentTenant.cargoCompany || 'Yurtiçi Kargo');
    setCargoCode(currentTenant.cargoCode || '');
    setWarrantyDays(currentTenant.warrantyDays || 90);
    setTerms(currentTenant.terms || '');
    setAdminThemeMode(currentTenant.theme?.adminThemeMode || 'default');
    setAdminPrimaryColor(
      currentTenant.theme?.adminPrimaryColor || currentTenant.theme?.primaryColor || '#3b82f6'
    );
  }, [currentTenant]);

  // Ayarlar sayfasında kullanıcı renk seçerken anlık canlı önizleme
  useEffect(() => {
    applyAdminTheme(
      {
        ...currentTenant.theme,
        primaryColor: currentTenant.theme?.primaryColor || '#0071e3',
        secondaryColor: currentTenant.theme?.secondaryColor || '#06b6d4',
        adminThemeMode,
        adminPrimaryColor,
      },
      theme === 'dark'
    );
  }, [adminThemeMode, adminPrimaryColor, currentTenant.theme, theme]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCurrentTenant({
        name: companyName,
        brandName: brandName || companyName,
        phone,
        email,
        address,
        cargoCompany,
        cargoCode,
        warrantyDays: Number(warrantyDays),
        terms,
        theme: {
          ...currentTenant.theme,
          primaryColor: currentTenant.theme?.primaryColor || '#0071e3',
          secondaryColor: currentTenant.theme?.secondaryColor || '#06b6d4',
          adminThemeMode,
          adminPrimaryColor,
        },
      });
      toast.success('İşletme ayarları ve panel tema rengi güncellendi!');
    } catch {
      toast.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const bookingUrl = `${window.location.origin}/servis-randevusu?firma=${currentTenant.slug}`;

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Randevu bağlantısı kopyalandı!');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Sistem & İşletme Ayarları</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
          İşletme kimliği, müşteri randevu sayfası ayarları, kargo anlaşması ve sistem tercihleri.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Multi-Tenant SaaS Info Card */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid rgba(0, 113, 227, 0.25)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0, 113, 227, 0.15)', color: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>İşletme Aboneliği (SaaS)</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Kiracı Kimliği: <code>{currentTenant.id}</code></span>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: 'rgba(52, 199, 89, 0.15)', color: '#34c759' }}>
              <CheckCircle size={13} />
              Aktif Abonelik (Pro)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.2)', padding: '12px 16px', borderRadius: 8, marginTop: 8, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Müşterileriniz İçin Online Randevu Linkiniz:</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginTop: 2, wordBreak: 'break-all' }}>{bookingUrl}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={copyBookingLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
              >
                <Copy size={13} />
                Kopyala
              </button>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, background: '#0071e3', color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}
              >
                <ExternalLink size={13} />
                Önizle
              </a>
            </div>
          </div>

          {/* Web Sitem & Tema Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '16px 20px', borderRadius: 10, marginTop: 14, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Palette size={24} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Özel Web Sitenizi & Renklerinizi Özelleştirin</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Web sitenizin logosunu, tema renklerini, sloganını, hizmet listesini ve iletişim kanallarını canlı düzenleyin.</div>
              </div>
            </div>
            <Link
              to="/panel/web-sitesi"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#0071e3', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
            >
              <span>Sayfa Düzenleyiciye Git</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Theme Settings */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Palette size={18} color="var(--accent-primary, #3b82f6)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Görünüm ve Panel Renk Teması</h3>
          </div>

          {/* Light / Dark Mode Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Tema Modu: {theme === 'dark' ? 'Koyu (Dark)' : 'Açık (Light)'}</div>
              <small style={{ color: 'var(--text-muted, #94a3b8)' }}>Tüm yönetim panelinde geçerli arka plan ve kontrast modu</small>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}</span>
            </button>
          </div>

          {/* Panel Accent Color Theme Section */}
          <div style={{ paddingTop: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color="var(--accent-primary, #3b82f6)" />
                <span>Yönetim Paneli Vurgu Rengi</span>
              </div>
              <small style={{ color: 'var(--text-muted, #94a3b8)' }}>
                Butonlar, sol menü göstergeleri, rozetler ve arama çubuğunun ana rengini belirleyin.
              </small>
            </div>

            {/* 3 Main Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px', marginBottom: 18 }}>
              {/* Option 1: Default */}
              <div
                onClick={() => setAdminThemeMode('default')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: adminThemeMode === 'default' ? '2px solid var(--accent-primary, #3b82f6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: adminThemeMode === 'default' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#3b82f6', border: '2px solid white' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Standart Tema</span>
                  </div>
                  {adminThemeMode === 'default' && <Check size={14} color="var(--accent-primary, #3b82f6)" />}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  TeknikPro'nun orijinal klasik mavi renk paletini korur.
                </p>
              </div>

              {/* Option 2: Website Colors */}
              <div
                onClick={() => setAdminThemeMode('website_colors')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: adminThemeMode === 'website_colors' ? '2px solid var(--accent-primary, #3b82f6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: adminThemeMode === 'website_colors' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: currentTenant.theme?.primaryColor || '#0071e3', border: '2px solid white' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Web Sitesi Renkleri</span>
                  </div>
                  {adminThemeMode === 'website_colors' && <Check size={14} color="var(--accent-primary, #3b82f6)" />}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  Müşteri web sayfanızdaki marka rengini (<code>{currentTenant.theme?.primaryColor || '#0071e3'}</code>) panele uygular.
                </p>
              </div>

              {/* Option 3: Custom Color */}
              <div
                onClick={() => setAdminThemeMode('custom')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: adminThemeMode === 'custom' ? '2px solid var(--accent-primary, #3b82f6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: adminThemeMode === 'custom' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: adminPrimaryColor, border: '2px solid white' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Özel Panel Rengi</span>
                  </div>
                  {adminThemeMode === 'custom' && <Check size={14} color="var(--accent-primary, #3b82f6)" />}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  Paneliniz için istediğiniz rengi seçin veya hazır modern paletlerden belirleyin.
                </p>
              </div>
            </div>

            {/* Custom Color Selector (Visible when custom is selected) */}
            {adminThemeMode === 'custom' && (
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '16px', marginTop: 10 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary, #94a3b8)' }}>
                  Hazır Modern Paletler:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 14 }}>
                  {ADMIN_PRESET_COLORS.map((p) => {
                    const isSelected = adminPrimaryColor.toLowerCase() === p.hex.toLowerCase();
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setAdminPrimaryColor(p.hex)}
                        title={`${p.name} (${p.desc})`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: isSelected ? `2px solid ${p.hex}` : '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.hex }} />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Serbest Renk Seçici:</label>
                    <input
                      type="color"
                      value={adminPrimaryColor}
                      onChange={(e) => setAdminPrimaryColor(e.target.value)}
                      style={{
                        width: 38,
                        height: 38,
                        padding: 2,
                        borderRadius: 8,
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>HEX:</span>
                    <input
                      type="text"
                      value={adminPrimaryColor}
                      onChange={(e) => setAdminPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                      style={{
                        width: 100,
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Interactive Preview Pill */}
            <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 8, background: 'var(--accent-primary-light, rgba(59, 130, 246, 0.12))', border: '1px solid var(--accent-primary, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--accent-primary, #3b82f6)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>
                  Canlı Önizleme: Sol menü, butonlar ve aktif başlıklar şu an seçtiğiniz renge büründü!
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'var(--accent-primary, #3b82f6)', color: 'white' }}>
                Örnek Buton
              </span>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building2 size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>İşletme & İletişim Bilgileri</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Firma Ticari Unvanı</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Müşteriye Görünen Marka Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Kaya Teknik Servis"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Müşteri İletişim Telefonu</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Dükkan / Servis Açık Adresi</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </div>
          </div>
        </div>

        {/* Cargo Settings for Online Booking */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Truck size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Kargo ile Gönderim Ayarları (Online Randevu)</h3>
          </div>

          <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Anlaşmalı Kargo Firması</label>
              <input
                type="text"
                placeholder="Örn: Yurtiçi Kargo, Aras Kargo"
                value={cargoCompany}
                onChange={(e) => setCargoCompany(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Müşteri Kargo Anlaşma Kodu</label>
              <input
                type="text"
                placeholder="Örn: YK-482910"
                value={cargoCode}
                onChange={(e) => setCargoCode(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        </div>

        {/* Service Terms */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Garanti & Fiş Şartları</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Varsayılan Garanti Süresi (Gün)</label>
              <input
                type="number"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                style={{
                  width: '120px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Servis Fişi Altındaki Yasal Şartlar</label>
              <textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#0071e3',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '999px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 2px 10px rgba(0, 113, 227, 0.3)',
              minHeight: '44px',
            }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
