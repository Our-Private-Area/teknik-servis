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
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { useTenantStore } from '../../../store/tenantStore';
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
  }, [currentTenant]);

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
      });
      toast.success('İşletme ayarları ve müşteri sayfası güncellendi!');
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.2)', padding: '12px 16px', borderRadius: 8, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Müşterileriniz İçin Online Randevu Linkiniz:</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginTop: 2 }}>{bookingUrl}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
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
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Görünüm ve Tema</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Tema Modu: {theme === 'dark' ? 'Koyu (Dark)' : 'Açık (Light)'}</div>
              <small style={{ color: 'var(--text-muted, #94a3b8)' }}>Tüm yönetim panelinde geçerli renk paleti</small>
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
        </div>

        {/* Company info */}
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building2 size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>İşletme & İletişim Bilgileri</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
