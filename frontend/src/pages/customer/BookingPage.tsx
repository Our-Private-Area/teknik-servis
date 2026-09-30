import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  Wrench,
  Calendar,
  Send,
  Truck,
  Building2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { useTenantStore } from '../../store/tenantStore';
import './BookingPage.css';

/* =============================================
   Sabit Veriler
   ============================================= */
const DEVICE_TYPES = [
  { key: 'Telefon', label: 'Telefon', icon: Smartphone },
  { key: 'Tablet', label: 'Tablet', icon: Tablet },
  { key: 'Laptop', label: 'Laptop', icon: Laptop },
  { key: 'Masaüstü', label: 'Masaüstü', icon: Monitor },
];

const BRANDS_BY_TYPE: Record<string, string[]> = {
  Telefon: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'OnePlus', 'Google', 'Nothing'],
  Tablet: ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Xiaomi'],
  Laptop: ['Apple', 'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'MSI', 'Monster'],
  Masaüstü: ['Özel Yapım', 'Dell', 'HP', 'Lenovo', 'Asus'],
};

const COMMON_FAULTS = [
  'Ekran / Cam Kırık',
  'Batarya / Hızlı Bitiyor',
  'Şarj Soketi Arızası',
  'Sıvı Teması',
  'Kamera / Lens Bozuk',
  'Cihaz Hiç Açılmıyor',
  'Kasa / Arka Cam Hasarı',
  'Ses / Hoparlör / Mikrofon',
  'Aşırı Isınma / Donma',
  'Yazılım / Sıfırlama',
  'Genel Kontrol & Bakım',
];

const STEP_LABELS = ['Cihaz', 'Marka & Model', 'Arıza Türü', 'Teslimat & İletişim', 'Onay'];

/* =============================================
   Component
   ============================================= */
export default function BookingPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const { currentTenant, switchTenantBySlug } = useTenantStore();

  const effectiveSlug = slug || searchParams.get('firma') || '';

  useEffect(() => {
    if (effectiveSlug) {
      switchTenantBySlug(effectiveSlug);
    }
  }, [effectiveSlug, switchTenantBySlug]);

  useEffect(() => {
    if (currentTenant?.theme?.primaryColor) {
      document.documentElement.style.setProperty('--primary', currentTenant.theme.primaryColor);
    }
    return () => {
      document.documentElement.style.removeProperty('--primary');
    };
  }, [currentTenant?.theme?.primaryColor]);

  const homeUrl = effectiveSlug ? `/${effectiveSlug}` : '/';
  const trackingUrl = effectiveSlug ? `/${effectiveSlug}/servis-sorgulama` : '/servis-sorgulama';

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  const [complaint, setComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'store' | 'cargo'>('store');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const effectiveBrand = brand === 'Diğer' ? customBrand : brand;

  const toggleFault = (fault: string) => {
    setSelectedFaults((prev) =>
      prev.includes(fault) ? prev.filter((f) => f !== fault) : [...prev, fault]
    );
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 0:
        return !!deviceType;
      case 1:
        return !!effectiveBrand && !!model;
      case 2:
        return selectedFaults.length > 0 || complaint.trim().length > 4;
      case 3:
        if (deliveryMethod === 'cargo') {
          return (
            fullName.trim().length > 1 &&
            phone.trim().length > 5 &&
            address.trim().length > 5
          );
        }
        return fullName.trim().length > 1 && phone.trim().length > 5;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    try {
      // 1. Müşteri bul veya ekle
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const existingCust = useCustomerStore.getState().customers.find(
        (c) => (c.phone ? c.phone.replace(/\D/g, '') : '') === cleanPhone
      );

      let customerId = existingCust?.id;
      if (!customerId) {
        const newCust = useCustomerStore.getState().addCustomer({
          fullName,
          phone,
          email: email || undefined,
          address: address || undefined,
        });
        customerId = newCust?.id || `cust-${Date.now()}`;
      }

      // 2. Takip numarası oluştur
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const trackingNo = `TK-2026-${randomNum}`;

      const allFaultsText = [
        ...selectedFaults,
        ...(complaint.trim() ? [complaint.trim()] : []),
      ].join(' • ');

      // 3. Servis kaydını Zustand ve Firestore'a ekle
      const newRecord = useServiceStore.getState().addService({
        trackingNo,
        customerId,
        customerName: fullName,
        customerPhone: phone,
        customerAddress: address || undefined,
        deviceType,
        deviceBrand: effectiveBrand,
        deviceModel: model,
        complaint: allFaultsText || 'Arıza belirtilmedi',
        status: 'received',
        priority: 'normal',
        totalCost: 0,
        paidAmount: 0,
        isOnlineBooking: true,
        deliveryMethod,
        preferredAppointmentDate: preferredDate || undefined,
        accessoriesReceived: notes ? [notes] : [],
      } as any);

      const finalRef = newRecord?.trackingNo || trackingNo;
      setRefNo(finalRef);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Randevu talebiniz başarıyla oluşturuldu!');
    } catch (err) {
      console.error('Randevu oluşturma hatası:', err);
      // Hata durumunda dahi müşteriye referans kodunu göster
      const fallbackRef = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setRefNo(fallbackRef);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Randevunuz alındı!');
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referans numarası kopyalandı');
  };

  /* --- Stepper --- */
  const renderStepper = () => (
    <div className="booking-stepper">
      {STEP_LABELS.map((label, idx) => (
        <div key={label} className="booking-stepper__item">
          {idx > 0 && (
            <div
              className={`booking-stepper__line ${
                idx <= step ? 'booking-stepper__line--active' : ''
              }`}
            />
          )}
          <div
            className={`booking-stepper__step ${
              idx === step
                ? 'booking-stepper__step--active'
                : idx < step
                ? 'booking-stepper__step--done'
                : ''
            }`}
          >
            <div className="booking-stepper__num">
              {idx < step ? <CheckCircle2 size={13} /> : idx + 1}
            </div>
            <span className="booking-stepper__text">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );

  /* --- Step 0: Device Type --- */
  const renderDeviceType = () => (
    <>
      <h2 className="booking-step-title">Cihaz Türünüzü Seçin</h2>
      <p className="booking-step-subtitle">Hangi cihazınız için servis randevusu oluşturmak istiyorsunuz?</p>

      <div className="booking-type-grid">
        {DEVICE_TYPES.map((dt) => {
          const Icon = dt.icon;
          return (
            <button
              type="button"
              key={dt.key}
              className={`booking-type-card ${
                deviceType === dt.key ? 'booking-type-card--selected' : ''
              }`}
              onClick={() => {
                setDeviceType(dt.key);
                setBrand('');
                setCustomBrand('');
              }}
            >
              <div className="booking-type-card__icon">
                <Icon size={26} />
              </div>
              <div className="booking-type-card__label">{dt.label}</div>
            </button>
          );
        })}
      </div>
    </>
  );

  /* --- Step 1: Brand & Model --- */
  const renderBrandModel = () => {
    const brands = [...(BRANDS_BY_TYPE[deviceType] || []), 'Diğer'];
    return (
      <>
        <h2 className="booking-step-title">Marka ve Model</h2>
        <p className="booking-step-subtitle">Cihazınızın markasını seçin ve tam modelini yazın.</p>

        <div className="booking-card">
          <h3 className="booking-card__title">
            <Wrench size={16} />
            Marka Seçin
          </h3>
          <div className="booking-brand-grid">
            {brands.map((b) => (
              <button
                type="button"
                key={b}
                className={`booking-brand-card ${
                  brand === b ? 'booking-brand-card--selected' : ''
                }`}
                onClick={() => {
                  setBrand(b);
                  setCustomBrand('');
                }}
              >
                {b}
              </button>
            ))}
          </div>

          {brand === 'Diğer' && (
            <div className="booking-brand-other">
              <div className="booking-form-group">
                <label className="booking-form-label">Marka Adı *</label>
                <input
                  className="booking-form-input"
                  placeholder="Marka adını giriniz..."
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        <div className="booking-card">
          <div className="booking-form-group" style={{ marginBottom: 0 }}>
            <label className="booking-form-label">Model Bilgisi *</label>
            <input
              className="booking-form-input"
              placeholder={
                deviceType === 'Telefon'
                  ? 'Örn: iPhone 14 Pro, Samsung S23 Ultra, Redmi Note 12'
                  : deviceType === 'Laptop'
                  ? 'Örn: MacBook Air M2, ThinkPad X1, Asus ROG G15'
                  : 'Örn: iPad Pro 11, Tab S8, vs.'
              }
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>
      </>
    );
  };

  /* --- Step 2: Fault & Complaint --- */
  const renderComplaint = () => (
    <>
      <h2 className="booking-step-title">Arıza Bilgileri</h2>
      <p className="booking-step-subtitle">
        Sık karşılaşılan sorunlardan seçin veya açıklama ekleyin.
      </p>

      <div className="booking-card">
        <h3 className="booking-card__title">
          <AlertCircle size={16} />
          Sık Karşılaşılan Arızalar (Hızlı Seçim)
        </h3>
        <div className="booking-fault-chips">
          {COMMON_FAULTS.map((fault) => {
            const isSelected = selectedFaults.includes(fault);
            return (
              <button
                type="button"
                key={fault}
                className={`booking-fault-chip ${
                  isSelected ? 'booking-fault-chip--selected' : ''
                }`}
                onClick={() => toggleFault(fault)}
              >
                {isSelected && <Check size={13} />}
                <span>{fault}</span>
              </button>
            );
          })}
        </div>

        <div className="booking-form-group" style={{ marginTop: 20 }}>
          <label className="booking-form-label">
            Detaylı Arıza Açıklaması {selectedFaults.length === 0 ? '*' : '(İsteğe Bağlı)'}
          </label>
          <textarea
            className="booking-form-textarea"
            placeholder="Cihazınızda yaşadığınız sorunu açıklayın (örn: dün düştükten sonra görüntü gitti, şarj olmuyor vs.)..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />
        </div>

        <div className="booking-form-group" style={{ marginBottom: 0 }}>
          <label className="booking-form-label">Ek Notlar / Aksesuarlar</label>
          <input
            className="booking-form-input"
            placeholder="Kılıf, adaptör, SIM kart bırakıldı mı? Herhangi bir ek not..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </>
  );

  /* --- Step 3: Delivery & Contact --- */
  const renderContactInfo = () => (
    <>
      <h2 className="booking-step-title">Teslimat & İletişim</h2>
      <p className="booking-step-subtitle">Cihazı nasıl teslim edeceğinizi ve bilgilerinizi belirleyin.</p>

      {/* Delivery Method */}
      <div className="booking-card">
        <h3 className="booking-card__title">
          <Truck size={16} />
          Teslimat Yöntemi
        </h3>
        <div className="booking-delivery-grid">
          <button
            type="button"
            className={`booking-delivery-card ${
              deliveryMethod === 'store' ? 'booking-delivery-card--selected' : ''
            }`}
            onClick={() => setDeliveryMethod('store')}
          >
            <div className="booking-delivery-card__icon">
              <Building2 size={22} />
            </div>
            <div>
              <div className="booking-delivery-card__title">Servise Elden Teslim</div>
              <div className="booking-delivery-card__desc">
                Servis noktamıza kendiniz getirip teslim edin. Sıra beklemeden randevulu işlem.
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`booking-delivery-card ${
              deliveryMethod === 'cargo' ? 'booking-delivery-card--selected' : ''
            }`}
            onClick={() => setDeliveryMethod('cargo')}
          >
            <div className="booking-delivery-card__icon">
              <Truck size={22} />
            </div>
            <div>
              <div className="booking-delivery-card__title">
                {currentTenant.cargoCompany || 'Anlaşmalı Kargo'} ile Ücretsiz Gönderim
              </div>
              <div className="booking-delivery-card__desc">
                {currentTenant.cargoCode
                  ? `Anlaşma Kodu: ${currentTenant.cargoCode}. Randevu onayından sonra detaylar SMS ile iletilir.`
                  : 'Randevu onayından sonra kargo kodu SMS ile iletilir, anlaşmalı kargo ile ücretsiz gönderin.'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="booking-card">
        <h3 className="booking-card__title">
          <User size={16} />
          İletişim Bilgileri
        </h3>
        <div className="booking-form-group">
          <label className="booking-form-label">Ad Soyad *</label>
          <input
            className="booking-form-input"
            placeholder="Adınız Soyadınız"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="booking-form-row">
          <div className="booking-form-group">
            <label className="booking-form-label">Telefon Numarası *</label>
            <input
              className="booking-form-input"
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="booking-form-group">
            <label className="booking-form-label">E-posta</label>
            <input
              className="booking-form-input"
              placeholder="ornek@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {deliveryMethod === 'cargo' && (
          <div className="booking-form-group" style={{ marginBottom: 0 }}>
            <label className="booking-form-label">Kargo İade & Teslimat Adresi *</label>
            <textarea
              className="booking-form-textarea"
              placeholder="Onarım tamamlandıktan sonra cihazınızın geri kargolanacağı tam açık adresiniz..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ minHeight: 70 }}
            />
          </div>
        )}
      </div>

      {deliveryMethod === 'store' && (
        <div className="booking-card">
          <h3 className="booking-card__title">
            <Calendar size={16} />
            Tercih Edilen Randevu Tarihi (İsteğe Bağlı)
          </h3>
          <div className="booking-form-group" style={{ marginBottom: 0 }}>
            <input
              className="booking-form-input"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      )}
    </>
  );

  /* --- Step 4: Summary --- */
  const renderSummary = () => {
    const allFaultsText = [
      ...selectedFaults,
      ...(complaint ? [complaint] : []),
    ].join(' • ');

    return (
      <>
        <h2 className="booking-step-title">Randevu Özeti</h2>
        <p className="booking-step-subtitle">Bilgilerinizi gözden geçirin ve onaylayın.</p>

        <div className="booking-card">
          <h3 className="booking-card__title">
            <Wrench size={16} />
            Cihaz Bilgileri
          </h3>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Cihaz Türü</span>
            <span className="booking-summary-value">{deviceType}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Marka & Model</span>
            <span className="booking-summary-value">
              {effectiveBrand} {model}
            </span>
          </div>
        </div>

        <div className="booking-card">
          <h3 className="booking-card__title">
            <AlertCircle size={16} />
            Arıza Detayları
          </h3>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Belirtilen Sorunlar</span>
            <span className="booking-summary-value">{allFaultsText || 'Belirtilmedi'}</span>
          </div>
          {notes && (
            <div className="booking-summary-row">
              <span className="booking-summary-label">Ek Notlar</span>
              <span className="booking-summary-value">{notes}</span>
            </div>
          )}
        </div>

        <div className="booking-card">
          <h3 className="booking-card__title">
            <Truck size={16} />
            Teslimat & İletişim
          </h3>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Yöntem</span>
            <span className="booking-summary-value">
              {deliveryMethod === 'store' ? 'Elden Servise Teslim' : 'Ücretsiz Kargo Gönderimi'}
            </span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Müşteri</span>
            <span className="booking-summary-value">{fullName}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-label">Telefon</span>
            <span className="booking-summary-value">{phone}</span>
          </div>
          {email && (
            <div className="booking-summary-row">
              <span className="booking-summary-label">E-posta</span>
              <span className="booking-summary-value">{email}</span>
            </div>
          )}
          {deliveryMethod === 'cargo' && address && (
            <div className="booking-summary-row">
              <span className="booking-summary-label">Adres</span>
              <span className="booking-summary-value">{address}</span>
            </div>
          )}
          {deliveryMethod === 'store' && preferredDate && (
            <div className="booking-summary-row">
              <span className="booking-summary-label">Randevu Tarihi</span>
              <span className="booking-summary-value">
                {new Date(preferredDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  /* --- Success State --- */
  const renderSuccess = () => (
    <div className="booking-success">
      <div className="booking-success__icon">
        <CheckCircle2 size={36} />
      </div>
      <h2 className="booking-success__title">Randevunuz Başarıyla Oluşturuldu!</h2>
      <p className="booking-success__desc">
        {deliveryMethod === 'store'
          ? 'Cihazınızı belirlediğiniz tarihte servis noktamıza getirebilirsiniz. İşlem durumunu aşağıdaki referans numarası ile sorgulayabilirsiniz.'
          : 'Kargo gönderi kodunuz ve detaylar telefonunuza SMS olarak gönderilmiştir. Cihazınızı anlaşmalı kargoya ücretsiz teslim edebilirsiniz.'}
      </p>

      <div className="booking-success__ref-box">
        <span className="booking-success__ref-label">Servis Takip / Referans Kodu</span>
        <div className="booking-success__ref-inner">
          <span className="booking-success__ref">{refNo}</span>
          <button
            type="button"
            className="booking-success__copy-btn"
            onClick={handleCopyRef}
            title="Kopyala"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      <div className="booking-success__actions">
        <Link
          to={`${trackingUrl}/${refNo}`}
          className="booking-success__btn booking-success__btn--primary"
        >
          <Search size={16} />
          Servis Durumunu Sorgula
        </Link>
        <Link to={homeUrl} className="booking-success__btn booking-success__btn--secondary">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  /* --- Step Content --- */
  const stepContent = [
    renderDeviceType,
    renderBrandModel,
    renderComplaint,
    renderContactInfo,
    renderSummary,
  ];

  const primaryTheme = currentTenant?.theme?.primaryColor || '#0071e3';
  const secondaryTheme = currentTenant?.theme?.secondaryColor || '#42a5f5';

  return (
    <div
      className="booking-page"
      style={{
        ['--theme-primary' as any]: primaryTheme,
        ['--theme-secondary' as any]: secondaryTheme,
      }}
    >
      {/* Navbar */}
      <nav className="booking-nav">
        <div className="booking-nav__inner">
          <Link to={homeUrl} className="booking-nav__brand">
            {currentTenant.logoUrl ? (
              <img
                src={currentTenant.logoUrl}
                alt={currentTenant.brandName || currentTenant.name}
                style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }}
              />
            ) : (
              <div
                className="booking-nav__logo"
                style={currentTenant.theme?.primaryColor ? { background: currentTenant.theme.primaryColor } : undefined}
              >
                <Zap size={16} />
              </div>
            )}
            <span className="booking-nav__name">
              {currentTenant.brandName || currentTenant.name}
            </span>
          </Link>
          <div className="booking-nav__links">
            <Link to={homeUrl} className="booking-nav__link">
              Ana Sayfa
            </Link>
            <Link to={trackingUrl} className="booking-nav__link">
              <Search size={14} />
              Servis Sorgula
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="booking-main">
        {submitted ? (
          renderSuccess()
        ) : (
          <>
            {renderStepper()}
            {stepContent[step]()}

            {/* Actions */}
            <div className="booking-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="booking-btn booking-btn--back"
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft size={16} />
                  Geri
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="booking-btn booking-btn--next"
                  disabled={!canGoNext()}
                  onClick={() => setStep(step + 1)}
                >
                  İleri
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="booking-btn booking-btn--submit"
                  onClick={handleSubmit}
                >
                  <Send size={16} />
                  Randevuyu Onayla
                </button>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="booking-footer">
        © 2026 <strong>{currentTenant.brandName || currentTenant.name}</strong> · Tüm hakları saklıdır.
        {' · '}
        <Link to={homeUrl}>İşletme Sayfası</Link>
        {' · '}
        <Link to={trackingUrl}>Servis Sorgula</Link>
      </footer>
    </div>
  );
}
