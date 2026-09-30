import { useState, useEffect } from 'react';
import {
  Globe,
  Palette,
  Sparkles,
  Tag,
  ExternalLink,
  Copy,
  Check,
  Save,
  Clock,
  Phone,
  ShieldCheck,
  MapPin,
  MessageCircle,
  FileText,
  Wrench,
  Smartphone,
  Eye,
} from 'lucide-react';
import { useTenantStore } from '../../../store/tenantStore';
import toast from 'react-hot-toast';
import './WebsiteSettings.css';

const THEME_PRESETS = [
  { name: 'Okyanus Mavisi', primary: '#0071e3', secondary: '#06b6d4', accent: '#f59e0b' },
  { name: 'Neon Turuncu', primary: '#f97316', secondary: '#fbbf24', accent: '#3b82f6' },
  { name: 'Mor Gece', primary: '#8b5cf6', secondary: '#ec4899', accent: '#10b981' },
  { name: 'Zümrüt Yeşili', primary: '#10b981', secondary: '#06b6d4', accent: '#6366f1' },
  { name: 'Lüks Altın', primary: '#eab308', secondary: '#f97316', accent: '#3b82f6' },
  { name: 'Koyu Grafit', primary: '#3b82f6', secondary: '#64748b', accent: '#38bdf8' },
];

export default function WebsiteSettings() {
  const { currentTenant, updateCurrentTenant } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'services' | 'contact'>('appearance');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState(currentTenant.theme?.primaryColor || '#0071e3');
  const [secondaryColor, setSecondaryColor] = useState(currentTenant.theme?.secondaryColor || '#06b6d4');
  const [accentColor, setAccentColor] = useState(currentTenant.theme?.accentColor || '#f59e0b');
  const [logoUrl, setLogoUrl] = useState(currentTenant.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(currentTenant.coverImageUrl || '');

  // Content
  const [brandName, setBrandName] = useState(currentTenant.brandName || currentTenant.name || '');
  const [shortDescription, setShortDescription] = useState(currentTenant.shortDescription || '');
  const [description, setDescription] = useState(currentTenant.description || '');
  const [workingHours, setWorkingHours] = useState(currentTenant.workingHours || '');
  const [warrantyDays, setWarrantyDays] = useState(currentTenant.warrantyDays || 90);

  // Services & Brands
  const [servicesInput, setServicesInput] = useState(
    currentTenant.services ? currentTenant.services.join(', ') : 'Ekran Değişimi, Batarya Değişimi, Sıvı Teması Onarımı, Anakart Tamiri, Kamera Değişimi, Kasa Değişimi'
  );
  const [deviceBrandsInput, setDeviceBrandsInput] = useState(
    currentTenant.deviceBrands ? currentTenant.deviceBrands.join(', ') : 'Apple, Samsung, Xiaomi, Huawei, Dyson, Asus, Lenovo, HP'
  );

  // Contact & Social
  const [phone, setPhone] = useState(currentTenant.phone || '');
  const [email, setEmail] = useState(currentTenant.email || '');
  const [city, setCity] = useState(currentTenant.city || 'İstanbul');
  const [district, setDistrict] = useState(currentTenant.district || 'Kadıköy');
  const [address, setAddress] = useState(currentTenant.address || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(currentTenant.googleMapsUrl || '');
  const [instagram, setInstagram] = useState(currentTenant.socialMedia?.instagram || '');
  const [facebook, setFacebook] = useState(currentTenant.socialMedia?.facebook || '');
  const [whatsapp, setWhatsapp] = useState(currentTenant.socialMedia?.whatsapp || '');

  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state if currentTenant updates
  useEffect(() => {
    setPrimaryColor(currentTenant.theme?.primaryColor || '#0071e3');
    setSecondaryColor(currentTenant.theme?.secondaryColor || '#06b6d4');
    setAccentColor(currentTenant.theme?.accentColor || '#f59e0b');
    setLogoUrl(currentTenant.logoUrl || '');
    setCoverImageUrl(currentTenant.coverImageUrl || '');
    setBrandName(currentTenant.brandName || currentTenant.name || '');
    setShortDescription(currentTenant.shortDescription || '');
    setDescription(currentTenant.description || '');
    setWorkingHours(currentTenant.workingHours || '');
    setWarrantyDays(currentTenant.warrantyDays || 90);
    setServicesInput(currentTenant.services ? currentTenant.services.join(', ') : '');
    setDeviceBrandsInput(currentTenant.deviceBrands ? currentTenant.deviceBrands.join(', ') : '');
    setPhone(currentTenant.phone || '');
    setEmail(currentTenant.email || '');
    setCity(currentTenant.city || 'İstanbul');
    setDistrict(currentTenant.district || 'Kadıköy');
    setAddress(currentTenant.address || '');
    setGoogleMapsUrl(currentTenant.googleMapsUrl || '');
    setInstagram(currentTenant.socialMedia?.instagram || '');
    setFacebook(currentTenant.socialMedia?.facebook || '');
    setWhatsapp(currentTenant.socialMedia?.whatsapp || '');
  }, [currentTenant]);

  const publicUrl = `${window.location.origin}/${currentTenant.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Web sitesi adresiniz kopyalandı!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const parsedServices = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedBrands = deviceBrandsInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    try {
      await updateCurrentTenant({
        brandName: brandName.trim() || currentTenant.name,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        theme: {
          primaryColor,
          secondaryColor,
          accentColor,
          gradientFrom: primaryColor,
          gradientTo: secondaryColor,
        },
        workingHours: workingHours.trim() || undefined,
        warrantyDays: Number(warrantyDays),
        services: parsedServices.length > 0 ? parsedServices : undefined,
        deviceBrands: parsedBrands.length > 0 ? parsedBrands : undefined,
        phone: phone.trim() || currentTenant.phone,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        socialMedia: {
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          whatsapp: whatsapp.trim() || phone.replace(/\D/g, '') || undefined,
        },
      });

      toast.success('Halka açık web sayfanız ve tema renkleriniz başarıyla güncellendi!');
    } catch {
      toast.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ws-page">
      {/* Top Banner with Public Link */}
      <div className="ws-header">
        <div className="ws-header__info">
          <h1>
            <Globe size={24} color="#38bdf8" />
            <span>Web Sayfam & Tema Düzenleyici</span>
          </h1>
          <p>
            Müşterilerinizin randevu aldığı ve servis sorguladığı özel web sitenizin tasarımını, renklerini ve yazılarını buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="ws-header__actions">
          <div className="ws-link-box">
            <span>Adresiniz:</span>
            <code>{publicUrl}</code>
            <button
              type="button"
              className="ws-btn-icon"
              onClick={handleCopyLink}
              title="Adresi Kopyala"
            >
              {copied ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
            </button>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="ws-btn-visit"
            title="Canlı Sayfayı Aç"
          >
            <Eye size={15} />
            <span>Canlı Sayfayı Aç</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="ws-tabs">
        <button
          type="button"
          className={`ws-tab ${activeTab === 'appearance' ? 'ws-tab--active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <Palette size={16} />
          <span>Görünüm & Tema Renkleri</span>
        </button>
        <button
          type="button"
          className={`ws-tab ${activeTab === 'content' ? 'ws-tab--active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileText size={16} />
          <span>Yazılar & Tanıtım</span>
        </button>
        <button
          type="button"
          className={`ws-tab ${activeTab === 'services' ? 'ws-tab--active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Wrench size={16} />
          <span>Hizmetler & Markalar</span>
        </button>
        <button
          type="button"
          className={`ws-tab ${activeTab === 'contact' ? 'ws-tab--active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <Phone size={16} />
          <span>İletişim & Sosyal Medya</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Tab 1: Appearance & Colors */}
        {activeTab === 'appearance' && (
          <div className="ws-card">
            <h2 className="ws-card__title">
              <Palette size={18} color="#38bdf8" />
              <span>Marka Renkleri & Kurumsal Kimlik</span>
            </h2>

            {/* Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Hazır Renk Paletleri</label>
              <div className="ws-presets">
                {THEME_PRESETS.map((p) => {
                  const isCurrent = primaryColor === p.primary && secondaryColor === p.secondary;
                  return (
                    <button
                      type="button"
                      key={p.name}
                      className={`ws-preset-btn ${isCurrent ? 'ws-preset-btn--active' : ''}`}
                      onClick={() => {
                        setPrimaryColor(p.primary);
                        setSecondaryColor(p.secondary);
                        setAccentColor(p.accent);
                      }}
                      style={
                        isCurrent
                          ? {
                              borderColor: p.primary,
                              background: `${p.primary}25`,
                              color: 'white',
                            }
                          : undefined
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary }} />
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.secondary, marginLeft: -4 }} />
                      </div>
                      <span>{p.name}</span>
                      {isCurrent && <span style={{ color: p.primary, fontSize: 11 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="ws-form-grid ws-form-grid--3">
              <div className="ws-field">
                <label>Ana Tema Rengi (Primary)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="ws-field">
                <label>İkincil Gradyan Rengi (Secondary)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="ws-field">
                <label>Vurgu Rengi (Accent)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            {/* Logo & Cover URLs */}
            <div className="ws-form-grid">
              <div className="ws-field">
                <label>İşletme Logo URL (PNG/SVG önerilir)</label>
                <input
                  type="url"
                  placeholder="https://.../logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="ws-field">
                <label>Kapak / Arka Plan Görseli URL (Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://.../cover.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Anlık Canlı Önizleme
              </label>
              <div className="ws-preview-box">
                <div className="ws-preview-orb" style={{ background: primaryColor, top: -50, left: 40 }} />
                <div className="ws-preview-orb" style={{ background: secondaryColor, bottom: -50, right: 40 }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: 20,
                        boxShadow: `0 4px 16px ${primaryColor}60`,
                        overflow: 'hidden',
                      }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        brandName ? brandName.charAt(0).toUpperCase() : 'T'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>
                        {brandName || 'İşletme Adınız'}
                      </div>
                      <div style={{ fontSize: 12, color: primaryColor, fontWeight: 600 }}>
                        {shortDescription || 'Güvenilir & Profesyonel Teknik Servis'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        padding: '10px 20px',
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: `0 4px 14px ${primaryColor}40`,
                      }}
                    >
                      Online Randevu Al
                    </div>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#e2e8f0',
                        border: `1px solid ${secondaryColor}60`,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Servis Sorgula
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Content & Texts */}
        {activeTab === 'content' && (
          <div className="ws-card">
            <h2 className="ws-card__title">
              <FileText size={18} color="#38bdf8" />
              <span>Yazılar & Tanıtım Bilgileri</span>
            </h2>

            <div className="ws-form-grid">
              <div className="ws-field">
                <label>Müşteriye Görünen Marka / Dükkan Adı</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Örn: Kadıköy Cep Servisi"
                  required
                />
              </div>

              <div className="ws-field">
                <label>Kısa Slogan / Rozet Metni</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Örn: Kadıköy'ün Lider Apple & Android Servisi"
                />
              </div>
            </div>

            <div className="ws-field">
              <label>Hakkımızda / Tanıtım Yazısı (Web sitenizin ana gövdesinde görünür)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="İşletmenizin geçmişi, uzmanlık alanları ve müşteriye sunduğu güvenilirlik hakkında detaylı metin..."
              />
            </div>

            <div className="ws-form-grid">
              <div className="ws-field">
                <label>Çalışma Saatleri</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Örn: Pzt-Cum 09:00 - 19:30, Cts 10:00 - 18:00"
                />
              </div>

              <div className="ws-field">
                <label>Onarım Garanti Süresi (Gün)</label>
                <input
                  type="number"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Services & Brands */}
        {activeTab === 'services' && (
          <div className="ws-card">
            <h2 className="ws-card__title">
              <Wrench size={18} color="#38bdf8" />
              <span>Sunulan Hizmetler & Desteklenen Cihaz Markaları</span>
            </h2>
            <p style={{ margin: '-10px 0 10px', fontSize: 13, color: '#94a3b8' }}>
              Web sitenizde kart ve rozet olarak listelenecektir. Öğeleri virgülle (,) ayırarak yazabilirsiniz.
            </p>

            <div className="ws-field">
              <label>Sunulan Hizmetler (Virgülle ayırın)</label>
              <textarea
                rows={3}
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                placeholder="Ekran Değişimi, Batarya Değişimi, Sıvı Teması Onarımı, Anakart Tamiri, Kamera Değişimi, Kasa Değişimi"
              />
            </div>

            <div className="ws-field">
              <label>Desteklenen Cihaz Markaları (Virgülle ayırın)</label>
              <textarea
                rows={3}
                value={deviceBrandsInput}
                onChange={(e) => setDeviceBrandsInput(e.target.value)}
                placeholder="Apple, Samsung, Xiaomi, Huawei, Dyson, Asus, Lenovo, HP"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Contact & Social */}
        {activeTab === 'contact' && (
          <div className="ws-card">
            <h2 className="ws-card__title">
              <Phone size={18} color="#38bdf8" />
              <span>İletişim & Sosyal Medya Kanalları</span>
            </h2>

            <div className="ws-form-grid">
              <div className="ws-field">
                <label>Telefon Numarası</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0216 333 44 55"
                  required
                />
              </div>

              <div className="ws-field">
                <label>İletişim E-Postası</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="destek@isletme.com"
                />
              </div>
            </div>

            <div className="ws-form-grid ws-form-grid--3">
              <div className="ws-field">
                <label>İl</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="İstanbul"
                />
              </div>

              <div className="ws-field">
                <label>İlçe</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Kadıköy"
                />
              </div>

              <div className="ws-field">
                <label>Google Maps Konum URL</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div className="ws-field">
              <label>Dükkan Açık Adresi</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Moda Cad. No: 18, Kadıköy, İstanbul"
              />
            </div>

            <div className="ws-form-grid ws-form-grid--3">
              <div className="ws-field">
                <label>WhatsApp Numarası (Örn: 905321234567)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="905320000000"
                />
              </div>

              <div className="ws-field">
                <label>Instagram Kullanıcı Adı</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="kadikoycep"
                />
              </div>

              <div className="ws-field">
                <label>Facebook Sayfası</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="kadikoycep"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="ws-save-bar">
          <button
            type="submit"
            className="ws-btn-save"
            disabled={isSaving}
          >
            {isSaving ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <Save size={16} />
                <span>Değişiklikleri Web Siteme Uygula</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
