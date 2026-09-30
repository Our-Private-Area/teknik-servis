import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Phone,
  MessageSquare,
  Printer,
  ChevronRight,
  ChevronDown,
  Zap,
  Laptop,
  Smartphone,
  Calendar,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useServiceStore } from '../../store/serviceStore';
import { useTenantStore } from '../../store/tenantStore';
import { SERVICE_STATUS_MAP, ServiceStatus, ServiceRecord } from '../../types';
import './TrackingPage.css';

// Timeline aşamaları
const TIMELINE_STEPS = [
  { key: 'received', label: 'Teslim Alındı' },
  { key: 'diagnosis', label: 'İnceleniyor' },
  { key: 'in_repair', label: 'Onarımda' },
  { key: 'testing', label: 'Test Ediliyor' },
  { key: 'ready', label: 'Hazır' },
  { key: 'delivered', label: 'Teslim Edildi' },
];

export default function TrackingPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { getServiceByTrackingNo, services } = useServiceStore();
  const { currentTenant, switchTenantBySlug } = useTenantStore();

  useEffect(() => {
    if (slug) {
      switchTenantBySlug(slug);
    }
  }, [slug, switchTenantBySlug]);

  useEffect(() => {
    if (currentTenant?.theme?.primaryColor) {
      document.documentElement.style.setProperty('--primary', currentTenant.theme.primaryColor);
    }
    return () => {
      document.documentElement.style.removeProperty('--primary');
    };
  }, [currentTenant?.theme?.primaryColor]);

  const homeUrl = slug ? `/${slug}` : '/';
  const bookingUrl = slug ? `/${slug}/servis-randevusu` : '/servis-randevusu';
  const trackingUrl = slug ? `/${slug}/servis-sorgulama` : '/servis-sorgulama';

  const [inputQuery, setInputQuery] = useState(id || '');
  const [searchedRecord, setSearchedRecord] = useState<ServiceRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Kartların açılıp kapanma durumu (varsayılan: tümü kapalı)
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    device: false,
    history: false,
    payment: false,
    dates: false,
  });

  const toggleCard = (cardKey: string) => {
    setOpenCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const allOpen = Object.values(openCards).every(Boolean);
  const toggleAllCards = () => {
    const nextState = !allOpen;
    setOpenCards({
      device: nextState,
      history: nextState,
      payment: nextState,
      dates: nextState,
    });
  };

  useEffect(() => {
    if (id) {
      handleSearch(id);
    }
  }, [id]);

  const handleSearch = (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const found = getServiceByTrackingNo(q);
      setSearchedRecord(found || null);
      setOpenCards({
        device: false,
        history: false,
        payment: false,
        dates: false,
      });
      setIsSearching(false);
    }, 300);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputQuery);
  };

  const getStepStatus = (stepIndex: number, currentStatus: ServiceStatus) => {
    const order: Record<ServiceStatus, number> = {
      received: 0,
      waiting_approval: 1,
      approved: 1,
      rejected: 1,
      waiting_parts: 2,
      in_repair: 2,
      at_another_service: 2,
      ready: 4,
      delivered: 5,
      returned: 5,
      cancelled: 0,
    };

    const currentIdx = order[currentStatus] ?? 0;
    if (stepIndex < currentIdx) return 'completed';
    if (stepIndex === currentIdx) return 'active';
    return 'pending';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatShortDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const statusConfig = searchedRecord ? SERVICE_STATUS_MAP[searchedRecord.status] : null;

  return (
    <div className="tracking-page">
      {/* Navbar */}
      <header className="tracking-header">
        <div className="tracking-container tracking-header__inner">
          <Link to={homeUrl} className="tracking-brand">
            {currentTenant.logoUrl ? (
              <img
                src={currentTenant.logoUrl}
                alt={currentTenant.brandName || currentTenant.name}
                style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8 }}
              />
            ) : (
              <div
                className="tracking-brand__logo"
                style={currentTenant.theme?.primaryColor ? { background: currentTenant.theme.primaryColor } : undefined}
              >
                <Zap size={17} />
              </div>
            )}
            <div>
              <span className="tracking-brand__name">{currentTenant.brandName || currentTenant.name}</span>
              <span className="tracking-brand__tag">Servis Takip</span>
            </div>
          </Link>

          <div className="tracking-header__actions">
            <Link to={bookingUrl} className="tracking-header__booking-btn">
              Randevu Al
            </Link>
            <a href={`tel:${(currentTenant.phone || '').replace(/\s+/g, '')}`} className="tracking-header__contact">
              <Phone size={14} />
              <span>{currentTenant.phone}</span>
            </a>
            <Link to="/giris" className="tracking-header__login-btn">
              Personel Girişi
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="tracking-hero">
        <div className="tracking-container tracking-hero__inner">
          <div className="tracking-hero__badge">
            <ShieldCheck size={14} />
            <span>Güvenli Servis Takip Sistemi</span>
          </div>

          <h1 className="tracking-hero__title">
            Cihazınızın durumunu{' '}
            <span className="tracking-hero__highlight">anlık takip edin.</span>
          </h1>

          <p className="tracking-hero__desc">
            Servis formunuzdaki <strong>takip numarasını</strong> girerek onarım sürecinizi adım adım görüntüleyin.
          </p>

          {/* Search */}
          <form className="tracking-search" onSubmit={onSubmit}>
            <div className="tracking-search__input-wrapper">
              <Search className="tracking-search__icon" size={18} />
              <input
                type="text"
                className="tracking-search__input"
                placeholder="Takip numaranızı girin"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="tracking-search__submit"
              disabled={isSearching || !inputQuery.trim()}
            >
              {isSearching ? 'Aranıyor…' : 'Sorgula'}
            </button>
          </form>

          {/* Quick Demo Buttons */}
          {services.length > 0 && (
            <div className="tracking-hero__demos">
              <span className="tracking-hero__demos-label">Örnek kayıtlar</span>
              <div className="tracking-hero__demo-chips">
                {services.slice(0, 3).map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    className="tracking-demo-chip"
                    onClick={() => {
                      setInputQuery(srv.trackingNo);
                      handleSearch(srv.trackingNo);
                    }}
                  >
                    <span className="tracking-demo-chip__no">{srv.trackingNo}</span>
                    <span className="tracking-demo-chip__model">{srv.deviceBrand} {srv.deviceModel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="tracking-container tracking-main">
        {/* Empty State */}
        {hasSearched && !isSearching && !searchedRecord && (
          <div className="tracking-empty-card">
            <div className="tracking-empty-card__icon">
              <Search size={32} />
            </div>
            <h3>Kayıt bulunamadı</h3>
            <p>
              "<strong>{inputQuery}</strong>" numarasına ait bir servis kaydı bulunamadı.
              Lütfen takip numaranızı kontrol edip tekrar deneyin.
            </p>
            <div className="tracking-empty-card__help">
              Yardım için <a href="tel:08503004050">0850 300 40 50</a> arayabilirsiniz.
            </div>
          </div>
        )}

        {/* Result */}
        {searchedRecord && (
          <div className="tracking-result">
            {/* Status Overview Card */}
            <div className="tracking-card tracking-card--primary">
              <div className="tracking-status-bar">
                <div className="tracking-status-bar__left">
                  <div className="tracking-record-id">
                    <span className="tracking-record-id__label">Takip No</span>
                    <span className="tracking-record-id__val">{searchedRecord.trackingNo}</span>
                  </div>
                  <div className="tracking-device-title">
                    {searchedRecord.deviceType === 'Laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                    <span>{searchedRecord.deviceBrand} {searchedRecord.deviceModel}</span>
                  </div>
                </div>

                <div className="tracking-status-bar__right">
                  <div
                    className="tracking-status-pill"
                    style={{
                      color: statusConfig?.color,
                      backgroundColor: statusConfig?.bgColor,
                    }}
                  >
                    <span
                      className="tracking-status-pill__dot"
                      style={{ backgroundColor: statusConfig?.color }}
                    />
                    <span>{statusConfig?.label}</span>
                  </div>
                </div>
              </div>

              {/* Stepper */}
              <div className="tracking-stepper">
                <div className="tracking-stepper__track">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const stepState = getStepStatus(idx, searchedRecord.status);
                    return (
                      <div
                        key={step.key}
                        className={`tracking-step tracking-step--${stepState}`}
                      >
                        <div className="tracking-step__node">
                          {stepState === 'completed' ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <div className="tracking-step__content">
                          <span className="tracking-step__title">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section Header Controls */}
            <div className="tracking-section-header">
              <span className="tracking-section-header__title">Detay Bilgileri</span>
              <button
                type="button"
                className="tracking-section-header__toggle"
                onClick={toggleAllCards}
              >
                {allOpen ? 'Tümünü Kapat' : 'Tümünü Aç'}
              </button>
            </div>

            {/* Details Grid */}
            <div className="tracking-grid">
              {/* Left Column */}
              <div className="tracking-grid__col">
                {/* Device & Diagnosis */}
                <div className={`tracking-card tracking-card--collapsible ${!openCards.device ? 'tracking-card--collapsed' : ''}`}>
                  <button
                    type="button"
                    className="tracking-card__header tracking-card__header--clickable"
                    onClick={() => toggleCard('device')}
                    aria-expanded={openCards.device}
                  >
                    <div className="tracking-card__header-left">
                      <Wrench size={17} className="tracking-card__icon" />
                      <h2 className="tracking-card__title">Cihaz Bilgileri</h2>
                    </div>
                    <div className="tracking-card__header-right">
                      {!openCards.device && (
                        <span className="tracking-card__header-preview">
                          {searchedRecord.deviceBrand} {searchedRecord.deviceModel}
                        </span>
                      )}
                      <ChevronDown
                        size={18}
                        className={`tracking-card__chevron ${openCards.device ? 'tracking-card__chevron--open' : ''}`}
                      />
                    </div>
                  </button>

                  <div className="tracking-card__collapse-wrapper">
                    <div className="tracking-card__collapse-content">
                      <div className="tracking-card__body">
                        <div className="tracking-info-table">
                          <div className="tracking-info-row">
                            <span className="tracking-info-label">Cihaz</span>
                            <span className="tracking-info-value">{searchedRecord.deviceType} · {searchedRecord.deviceBrand}</span>
                          </div>
                          <div className="tracking-info-row">
                            <span className="tracking-info-label">Model</span>
                            <span className="tracking-info-value">{searchedRecord.deviceModel}</span>
                          </div>
                          {searchedRecord.serialNo && (
                            <div className="tracking-info-row">
                              <span className="tracking-info-label">Seri No</span>
                              <span className="tracking-info-value font-mono">{searchedRecord.serialNo}</span>
                            </div>
                          )}
                          {searchedRecord.imei && (
                            <div className="tracking-info-row">
                              <span className="tracking-info-label">IMEI</span>
                              <span className="tracking-info-value font-mono">{searchedRecord.imei}</span>
                            </div>
                          )}
                          <div className="tracking-info-row">
                            <span className="tracking-info-label">Aksesuarlar</span>
                            <span className="tracking-info-value">
                              {searchedRecord.accessoriesReceived?.length
                                ? searchedRecord.accessoriesReceived.join(', ')
                                : 'Yok'}
                            </span>
                          </div>
                        </div>

                        {/* Complaint */}
                        <div className="tracking-desc-box">
                          <span className="tracking-desc-box__title">Müşteri Bildirimi</span>
                          <p className="tracking-desc-box__text">{searchedRecord.complaint}</p>
                        </div>

                        {/* Diagnosis */}
                        {searchedRecord.diagnosis && (
                          <div className="tracking-desc-box tracking-desc-box--diagnosis">
                            <span className="tracking-desc-box__title">Teknik Teşhis</span>
                            <p className="tracking-desc-box__text">{searchedRecord.diagnosis}</p>
                          </div>
                        )}

                        {/* Performed Work */}
                        {searchedRecord.performedWork && (
                          <div className="tracking-desc-box tracking-desc-box--work">
                            <span className="tracking-desc-box__title">Yapılan İşlem</span>
                            <p className="tracking-desc-box__text">{searchedRecord.performedWork}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline History */}
                <div className={`tracking-card tracking-card--collapsible ${!openCards.history ? 'tracking-card--collapsed' : ''}`}>
                  <button
                    type="button"
                    className="tracking-card__header tracking-card__header--clickable"
                    onClick={() => toggleCard('history')}
                    aria-expanded={openCards.history}
                  >
                    <div className="tracking-card__header-left">
                      <Clock size={17} className="tracking-card__icon" />
                      <h2 className="tracking-card__title">İşlem Geçmişi</h2>
                    </div>
                    <div className="tracking-card__header-right">
                      {!openCards.history && searchedRecord.statusHistory.length > 0 && (
                        <span className="tracking-card__header-preview">
                          {searchedRecord.statusHistory.length} Kayıt
                        </span>
                      )}
                      <ChevronDown
                        size={18}
                        className={`tracking-card__chevron ${openCards.history ? 'tracking-card__chevron--open' : ''}`}
                      />
                    </div>
                  </button>

                  <div className="tracking-card__collapse-wrapper">
                    <div className="tracking-card__collapse-content">
                      <div className="tracking-card__body">
                        <div className="tracking-history-list">
                          {searchedRecord.statusHistory.map((item, index) => {
                            const sConf = SERVICE_STATUS_MAP[item.status as ServiceStatus];
                            return (
                              <div key={index} className="tracking-history-item">
                                <div className="tracking-history-item__point" style={{ borderColor: sConf?.color || '#0066cc' }} />
                                <div className="tracking-history-item__body">
                                  <div className="tracking-history-item__top">
                                    <span className="tracking-history-item__status" style={{ color: sConf?.color }}>
                                      {sConf?.label || item.status}
                                    </span>
                                    <span className="tracking-history-item__date">{formatDate(item.timestamp)}</span>
                                  </div>
                                  <p className="tracking-history-item__note">{item.note}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="tracking-grid__col">
                {/* Pricing */}
                <div className={`tracking-card tracking-card--collapsible ${!openCards.payment ? 'tracking-card--collapsed' : ''}`}>
                  <button
                    type="button"
                    className="tracking-card__header tracking-card__header--clickable"
                    onClick={() => toggleCard('payment')}
                    aria-expanded={openCards.payment}
                  >
                    <div className="tracking-card__header-left">
                      <CreditCard size={17} className="tracking-card__icon" />
                      <h2 className="tracking-card__title">Ödeme Özeti</h2>
                    </div>
                    <div className="tracking-card__header-right">
                      {!openCards.payment && (
                        <span className="tracking-card__header-preview tracking-card__header-preview--accent">
                          Kalan: ₺{(searchedRecord.remainingAmount || 0).toLocaleString('tr-TR')}
                        </span>
                      )}
                      <ChevronDown
                        size={18}
                        className={`tracking-card__chevron ${openCards.payment ? 'tracking-card__chevron--open' : ''}`}
                      />
                    </div>
                  </button>

                  <div className="tracking-card__collapse-wrapper">
                    <div className="tracking-card__collapse-content">
                      <div className="tracking-card__body">
                        <div className="tracking-pricing">
                          {searchedRecord.partsCost !== undefined && searchedRecord.partsCost > 0 && (
                            <div className="tracking-pricing__row">
                              <span>Yedek Parça</span>
                              <span>₺{searchedRecord.partsCost.toLocaleString('tr-TR')}</span>
                            </div>
                          )}
                          {searchedRecord.laborCost !== undefined && searchedRecord.laborCost > 0 && (
                            <div className="tracking-pricing__row">
                              <span>İşçilik</span>
                              <span>₺{searchedRecord.laborCost.toLocaleString('tr-TR')}</span>
                            </div>
                          )}
                          <div className="tracking-pricing__divider" />
                          <div className="tracking-pricing__row tracking-pricing__row--total">
                            <span>Toplam</span>
                            <span>₺{(searchedRecord.totalCost || searchedRecord.estimatedCost || 0).toLocaleString('tr-TR')}</span>
                          </div>
                          <div className="tracking-pricing__row tracking-pricing__row--paid">
                            <span>Ödenen</span>
                            <span>₺{(searchedRecord.paidAmount || 0).toLocaleString('tr-TR')}</span>
                          </div>
                          <div className="tracking-pricing__row tracking-pricing__row--remaining">
                            <span>Kalan</span>
                            <span>₺{(searchedRecord.remainingAmount || 0).toLocaleString('tr-TR')}</span>
                          </div>
                        </div>

                        <div className="tracking-warranty-badge">
                          <ShieldCheck size={16} />
                          <div>
                            <strong>90 Gün Garanti</strong>
                            <p>Değiştirilen parçalar garanti kapsamındadır.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className={`tracking-card tracking-card--collapsible ${!openCards.dates ? 'tracking-card--collapsed' : ''}`}>
                  <button
                    type="button"
                    className="tracking-card__header tracking-card__header--clickable"
                    onClick={() => toggleCard('dates')}
                    aria-expanded={openCards.dates}
                  >
                    <div className="tracking-card__header-left">
                      <Calendar size={17} className="tracking-card__icon" />
                      <h2 className="tracking-card__title">Tarihler</h2>
                    </div>
                    <div className="tracking-card__header-right">
                      {!openCards.dates && searchedRecord.estimatedDeliveryDate && (
                        <span className="tracking-card__header-preview">
                          Teslim: {formatShortDate(searchedRecord.estimatedDeliveryDate)}
                        </span>
                      )}
                      <ChevronDown
                        size={18}
                        className={`tracking-card__chevron ${openCards.dates ? 'tracking-card__chevron--open' : ''}`}
                      />
                    </div>
                  </button>

                  <div className="tracking-card__collapse-wrapper">
                    <div className="tracking-card__collapse-content">
                      <div className="tracking-card__body">
                        <div className="tracking-info-table">
                          <div className="tracking-info-row">
                            <span className="tracking-info-label">Kabul</span>
                            <span className="tracking-info-value">{formatDate(searchedRecord.receivedDate)}</span>
                          </div>
                          <div className="tracking-info-row">
                            <span className="tracking-info-label">Tahmini Teslim</span>
                            <span className="tracking-info-value">{formatDate(searchedRecord.estimatedDeliveryDate)}</span>
                          </div>
                          {searchedRecord.completedDate && (
                            <div className="tracking-info-row">
                              <span className="tracking-info-label">Tamamlanma</span>
                              <span className="tracking-info-value">{formatDate(searchedRecord.completedDate)}</span>
                            </div>
                          )}
                          {searchedRecord.deliveredDate && (
                            <div className="tracking-info-row">
                              <span className="tracking-info-label">Teslim</span>
                              <span className="tracking-info-value">{formatDate(searchedRecord.deliveredDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="tracking-card tracking-card--actions">
                  <button
                    type="button"
                    className="tracking-action-btn tracking-action-btn--print"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} />
                    <span>Yazdır</span>
                  </button>

                  <a
                    href={`https://wa.me/${(currentTenant.phone || '905320000000').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Merhaba, ${searchedRecord.trackingNo} numaralı ${searchedRecord.deviceBrand} ${searchedRecord.deviceModel} cihazım hakkında bilgi almak istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="tracking-action-btn tracking-action-btn--whatsapp"
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp ile İletişim</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="tracking-footer">
        <div className="tracking-container tracking-footer__inner">
          <div className="tracking-footer__copy">
            © 2026 <strong>{currentTenant.brandName || currentTenant.name}</strong> · Tüm hakları saklıdır.
          </div>
          <div className="tracking-footer__links">
            <Link to={homeUrl}>İşletme Sayfası</Link>
            <span>·</span>
            <Link to="/giris">Yönetici</Link>
            <span>·</span>
            <a href={`tel:${(currentTenant.phone || '').replace(/\s+/g, '')}`}>Destek</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
