import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Zap,
  Search,
  CalendarPlus,
  Wrench,
  ShieldCheck,
  Clock,
  Truck,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  Smartphone,
  ExternalLink,
  Navigation,
  Image as ImageIcon,
  ZoomIn,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { Tenant } from '../../types';
import ChatWidget from '../../components/chat/ChatWidget';
import './TenantPublicPage.css';

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function TenantPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenants } = useTenantStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const found = tenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
    if (found) {
      setTenant(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [slug, tenants]);

  // Apply theme CSS variables
  useEffect(() => {
    if (!tenant?.theme) return;
    const root = document.documentElement;
    root.style.setProperty('--tp-primary', tenant.theme.primaryColor);
    root.style.setProperty('--tp-secondary', tenant.theme.secondaryColor);
    if (tenant.theme.accentColor) root.style.setProperty('--tp-accent', tenant.theme.accentColor);
    if (tenant.theme.gradientFrom) root.style.setProperty('--tp-gradient-from', tenant.theme.gradientFrom);
    if (tenant.theme.gradientTo) root.style.setProperty('--tp-gradient-to', tenant.theme.gradientTo);

    return () => {
      root.style.removeProperty('--tp-primary');
      root.style.removeProperty('--tp-secondary');
      root.style.removeProperty('--tp-accent');
      root.style.removeProperty('--tp-gradient-from');
      root.style.removeProperty('--tp-gradient-to');
    };
  }, [tenant]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight' && tenant?.mediaItems?.length) {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % tenant.mediaItems!.length : 0));
      } else if (e.key === 'ArrowLeft' && tenant?.mediaItems?.length) {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + tenant.mediaItems!.length) % tenant.mediaItems!.length : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, tenant?.mediaItems]);

  if (loading) {
    return (
      <div className="tenant-public__loading">
        <div className="tp-spinner" />
        <p style={{ color: '#64748b', fontSize: 14 }}>Yükleniyor...</p>
      </div>
    );
  }

  if (notFound || !tenant) {
    return (
      <div className="tenant-public__notfound">
        <h1>404</h1>
        <p>Bu işletme bulunamadı.</p>
        <Link to="/"><ArrowLeft size={16} /> Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const brandTitle = tenant.brandName || tenant.name;
  const basePath = `/${tenant.slug}`;

  const themeStyles: React.CSSProperties = {
    ['--tp-primary' as any]: tenant?.theme?.primaryColor || '#0071e3',
    ['--tp-secondary' as any]: tenant?.theme?.secondaryColor || '#06b6d4',
    ['--tp-accent' as any]: tenant?.theme?.accentColor || tenant?.theme?.secondaryColor || '#f59e0b',
    ['--tp-gradient-from' as any]: tenant?.theme?.gradientFrom || tenant?.theme?.primaryColor || '#0071e3',
    ['--tp-gradient-to' as any]: tenant?.theme?.gradientTo || tenant?.theme?.secondaryColor || '#06b6d4',
  };

  // Google Maps URL formatting (güvenli URL kontrolü)
  const getEmbedMapUrl = () => {
    if (tenant.googleMapsUrl && tenant.googleMapsUrl.startsWith('https://') && tenant.googleMapsUrl.includes('google.com/maps/embed')) {
      return tenant.googleMapsUrl;
    }
    const query = tenant.address
      ? `${tenant.address}, ${tenant.district || ''} ${tenant.city || ''}`
      : `${brandTitle} ${tenant.city || ''}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const getDirectMapUrl = () => {
    if (tenant.googleMapsUrl && tenant.googleMapsUrl.startsWith('https://') && !tenant.googleMapsUrl.includes('output=embed')) {
      return tenant.googleMapsUrl;
    }
    const query = tenant.address
      ? `${brandTitle} ${tenant.address}, ${tenant.district || ''} ${tenant.city || ''}`
      : `${brandTitle} ${tenant.city || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const hasLocation = Boolean(tenant.googleMapsUrl || tenant.address || (tenant.city && tenant.district));

  const hasSocialMedia = Boolean(
    tenant.socialMedia &&
      (tenant.socialMedia.instagram || tenant.socialMedia.facebook || tenant.socialMedia.whatsapp)
  );

  const hasMedia = Boolean(tenant.mediaEnabled && tenant.mediaItems && tenant.mediaItems.length > 0);
  const mediaItems = tenant.mediaItems || [];
  const mediaCategories = Array.from(new Set(mediaItems.map((m) => m.category).filter(Boolean))) as string[];
  const filteredMedia =
    activeCategory === 'all' ? mediaItems : mediaItems.filter((m) => m.category === activeCategory);

  return (
    <div className="tenant-public" style={themeStyles}>
      {/* Navbar */}
      <nav className="tp-nav">
        <div className="tp-nav__inner">
          <Link to={basePath} className="tp-nav__brand">
            <div className="tp-nav__logo">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={brandTitle} />
              ) : (
                brandTitle.charAt(0)
              )}
            </div>
            <span className="tp-nav__name">{brandTitle}</span>
          </Link>

          <div className="tp-nav__links">
            <Link to={`${basePath}/servis-sorgulama`} className="tp-nav__link">
              <Search size={14} />
              Servis Sorgula
            </Link>
            <Link to={`${basePath}/servis-randevusu`} className="tp-nav__link tp-nav__link--primary">
              <CalendarPlus size={14} />
              Randevu Al
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="tp-hero">
        <div className="tp-hero__bg">
          <div className="tp-hero__orb tp-hero__orb--1" />
          <div className="tp-hero__orb tp-hero__orb--2" />
        </div>

        <div className="tp-hero__content">
          <div className="tp-hero__badge">
            <Smartphone size={14} />
            <span>{tenant.shortDescription || 'Profesyonel Teknik Servis'}</span>
          </div>

          <h1 className="tp-hero__title">
            Cihazınız bizimle{' '}
            <span className="tp-hero__gradient">güvende.</span>
          </h1>

          <p className="tp-hero__desc">
            {tenant.description
              ? tenant.description.slice(0, 180) + (tenant.description.length > 180 ? '...' : '')
              : `${brandTitle} olarak profesyonel teknik servis hizmeti sunuyoruz. Cihazlarınızı uzman ekibimizle en kısa sürede onarıyoruz.`}
          </p>

          <div className="tp-hero__actions">
            <Link to={`${basePath}/servis-randevusu`} className="tp-hero__btn tp-hero__btn--primary">
              <CalendarPlus size={18} />
              Online Randevu Oluştur
            </Link>
            <Link to={`${basePath}/servis-sorgulama`} className="tp-hero__btn tp-hero__btn--secondary">
              <Search size={18} />
              Servis Sorgula
            </Link>
          </div>
        </div>
      </section>

      {/* Hizmetlerimiz */}
      {tenant.services && tenant.services.length > 0 && (
        <section className="tp-services">
          <p className="tp-section-label">Hizmetlerimiz</p>
          <h2 className="tp-section-title">Neler Yapıyoruz?</h2>

          <div className="tp-services__grid">
            {tenant.services.map((service, i) => (
              <div className="tp-service-card" key={i}>
                <div className="tp-service-card__icon">
                  <Wrench size={22} />
                </div>
                <h3 className="tp-service-card__name">{service}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hakkımızda */}
      <section className="tp-about">
        <p className="tp-section-label">Hakkımızda</p>
        <h2 className="tp-section-title">{brandTitle}</h2>

        <div className="tp-about__content">
          <div className="tp-about__text">
            <h3>Neden {brandTitle}?</h3>
            <p>{tenant.description || `${brandTitle} olarak cihazlarınızı profesyonel ekibimizle en kısa sürede onarıyoruz. Güvenilir, hızlı ve şeffaf servis anlayışımızla müşterilerimize en iyi deneyimi sunuyoruz.`}</p>
          </div>

          <div className="tp-about__details">
            <div className="tp-about__detail">
              <div className="tp-about__detail-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="tp-about__detail-label">Garanti</div>
                <div className="tp-about__detail-value">{tenant.warrantyDays} Gün Onarım Garantisi</div>
              </div>
            </div>
            {tenant.workingHours && (
              <div className="tp-about__detail">
                <div className="tp-about__detail-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="tp-about__detail-label">Çalışma Saatleri</div>
                  <div className="tp-about__detail-value">{tenant.workingHours}</div>
                </div>
              </div>
            )}
            {tenant.cargoCompany && (
              <div className="tp-about__detail">
                <div className="tp-about__detail-icon">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="tp-about__detail-label">Kargo Desteği</div>
                  <div className="tp-about__detail-value">{tenant.cargoCompany}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sosyal Medya (Hakkımızda kısmından hemen sonra) */}
      {hasSocialMedia && (
        <section className="tp-social-section">
          <div className="tp-social-section__inner">
            <div className="tp-social-section__header">
              <span className="tp-section-label">Bizi Takip Edin</span>
              <h3 className="tp-social-section__title">Sosyal Medya Hesaplarımız</h3>
              <p className="tp-social-section__desc">
                Servis duyuruları, yeni cihaz onarımları ve güncel kampanyalarımız için bizi takip edin.
              </p>
            </div>

            <div className="tp-social-section__cards">
              {tenant.socialMedia?.instagram && (
                <a
                  href={`https://instagram.com/${encodeURIComponent(tenant.socialMedia.instagram.replace(/^@/, '').trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-card tp-social-card--instagram"
                >
                  <div className="tp-social-card__icon-wrap">
                    <InstagramIcon size={22} />
                  </div>
                  <div className="tp-social-card__info">
                    <span className="tp-social-card__platform">Instagram</span>
                    <span className="tp-social-card__handle">@{tenant.socialMedia.instagram.replace(/^@/, '').trim()}</span>
                  </div>
                  <ExternalLink size={16} className="tp-social-card__arrow" />
                </a>
              )}

              {tenant.socialMedia?.facebook && (
                <a
                  href={
                    tenant.socialMedia.facebook.startsWith('https://') || tenant.socialMedia.facebook.startsWith('http://')
                      ? tenant.socialMedia.facebook
                      : `https://facebook.com/${encodeURIComponent(tenant.socialMedia.facebook.replace(/^\/+/, '').trim())}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-card tp-social-card--facebook"
                >
                  <div className="tp-social-card__icon-wrap">
                    <FacebookIcon size={22} />
                  </div>
                  <div className="tp-social-card__info">
                    <span className="tp-social-card__platform">Facebook</span>
                    <span className="tp-social-card__handle">{tenant.socialMedia.facebook}</span>
                  </div>
                  <ExternalLink size={16} className="tp-social-card__arrow" />
                </a>
              )}

              {tenant.socialMedia?.whatsapp && (
                <a
                  href={`https://wa.me/${tenant.socialMedia.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-card tp-social-card--whatsapp"
                >
                  <div className="tp-social-card__icon-wrap">
                    <MessageCircle size={22} />
                  </div>
                  <div className="tp-social-card__info">
                    <span className="tp-social-card__platform">WhatsApp</span>
                    <span className="tp-social-card__handle">
                      {tenant.socialMedia.whatsapp.startsWith('+') ? tenant.socialMedia.whatsapp : `+${tenant.socialMedia.whatsapp}`}
                    </span>
                  </div>
                  <ExternalLink size={16} className="tp-social-card__arrow" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Medya & Fotoğraf Galerisi */}
      {hasMedia && (
        <section className="tp-gallery-section" id="galeri">
          <div className="tp-gallery-section__inner">
            <div className="tp-gallery-section__header">
              <span className="tp-section-label">
                <ImageIcon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                Medya & Fotoğraflar
              </span>
              <h2 className="tp-section-title">{tenant.mediaTitle || 'Dükkanımız & Ürünlerimiz'}</h2>
              {tenant.mediaDescription && (
                <p className="tp-gallery-section__desc">{tenant.mediaDescription}</p>
              )}

              {/* Kategori Filtre Butonları */}
              {mediaCategories.length > 1 && (
                <div className="tp-gallery-filters">
                  <button
                    type="button"
                    className={`tp-gallery-filter-btn ${activeCategory === 'all' ? 'tp-gallery-filter-btn--active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    Tümü ({mediaItems.length})
                  </button>
                  {mediaCategories.map((cat) => {
                    const count = mediaItems.filter((m) => m.category === cat).length;
                    return (
                      <button
                        type="button"
                        key={cat}
                        className={`tp-gallery-filter-btn ${activeCategory === cat ? 'tp-gallery-filter-btn--active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Galeri Izgarası */}
            <div className="tp-gallery-grid">
              {filteredMedia.map((item, idx) => {
                const realIndex = mediaItems.findIndex((m) => m.id === item.id);
                return (
                  <div
                    key={item.id || idx}
                    className="tp-gallery-card"
                    onClick={() => setLightboxIndex(realIndex >= 0 ? realIndex : idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setLightboxIndex(realIndex >= 0 ? realIndex : idx);
                    }}
                  >
                    <div className="tp-gallery-card__img-wrap">
                      <img src={item.url} alt={item.title || `${brandTitle} Fotoğraf`} loading="lazy" />
                      <div className="tp-gallery-card__overlay">
                        <div className="tp-gallery-card__zoom-btn">
                          <ZoomIn size={20} />
                        </div>
                        <div className="tp-gallery-card__meta">
                          {item.category && (
                            <span className="tp-gallery-card__tag">{item.category}</span>
                          )}
                          {item.title && (
                            <h4 className="tp-gallery-card__caption">{item.title}</h4>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Desteklenen Markalar */}
      {tenant.deviceBrands && tenant.deviceBrands.length > 0 && (
        <section className="tp-brands">
          <p className="tp-section-label">Desteklenen Markalar</p>
          <h2 className="tp-section-title">Tüm Markalar, Tek Adres</h2>
          <div className="tp-brands__list">
            {tenant.deviceBrands.map((brand) => (
              <div key={brand} className="tp-brand-tag">{brand}</div>
            ))}
          </div>
        </section>
      )}

      {/* Nasıl Çalışır */}
      <section className="tp-how">
        <p className="tp-section-label">Nasıl Çalışır?</p>
        <h2 className="tp-section-title">4 Kolay Adım</h2>

        <div className="tp-how__steps">
          <div className="tp-how-step">
            <div className="tp-how-step__num">1</div>
            <h3 className="tp-how-step__title">Randevu Oluştur</h3>
            <p className="tp-how-step__desc">Online formdan cihaz bilgilerinizi ve arızanızı belirtin.</p>
          </div>
          <div className="tp-how-step">
            <div className="tp-how-step__num">2</div>
            <h3 className="tp-how-step__title">Cihazı Teslim Et</h3>
            <p className="tp-how-step__desc">Randevu saatinizde gelin veya kargo ile gönderin.</p>
          </div>
          <div className="tp-how-step">
            <div className="tp-how-step__num">3</div>
            <h3 className="tp-how-step__title">Onarım Süreci</h3>
            <p className="tp-how-step__desc">Uzman ekibimiz cihazınızı onarır, sizi bilgilendirir.</p>
          </div>
          <div className="tp-how-step">
            <div className="tp-how-step__num">4</div>
            <h3 className="tp-how-step__title">Teslim Al</h3>
            <p className="tp-how-step__desc">Onarım tamamlandığında cihazınızı garanti ile teslim alın.</p>
          </div>
        </div>
      </section>

      {/* İletişim */}
      <section className="tp-contact">
        <p className="tp-section-label">İletişim</p>
        <h2 className="tp-section-title">Bize Ulaşın</h2>

        <div className="tp-contact__grid">
          <div className="tp-contact-card">
            <div className="tp-contact-card__icon">
              <Phone size={22} />
            </div>
            <h3 className="tp-contact-card__title">Telefon</h3>
            <p className="tp-contact-card__value">
              <a href={`tel:${tenant.phone.replace(/\s+/g, '')}`}>{tenant.phone}</a>
            </p>
          </div>

          <div className="tp-contact-card">
            <div className="tp-contact-card__icon">
              <MapPin size={22} />
            </div>
            <h3 className="tp-contact-card__title">Adres</h3>
            <p className="tp-contact-card__value">
              {tenant.address || `${tenant.district || ''} ${tenant.city || ''}`}
            </p>
            {hasLocation && (
              <a
                href={getDirectMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="tp-contact-map-link"
              >
                <Navigation size={13} />
                Yol Tarifi Al
              </a>
            )}
          </div>

          {tenant.email && (
            <div className="tp-contact-card">
              <div className="tp-contact-card__icon">
                <Mail size={22} />
              </div>
              <h3 className="tp-contact-card__title">E-posta</h3>
              <p className="tp-contact-card__value">
                <a href={`mailto:${tenant.email}`}>{tenant.email}</a>
              </p>
            </div>
          )}

          {tenant.workingHours && (
            <div className="tp-contact-card">
              <div className="tp-contact-card__icon">
                <Clock size={22} />
              </div>
              <h3 className="tp-contact-card__title">Çalışma Saatleri</h3>
              <p className="tp-contact-card__value">{tenant.workingHours}</p>
            </div>
          )}
        </div>

        {/* Google Maps / Harita Alanı */}
        {hasLocation && (
          <div className="tp-map-container">
            <div className="tp-map-header">
              <div className="tp-map-header__title">
                <MapPin size={20} style={{ color: 'var(--tp-primary)' }} />
                <span>Harita ve Konum</span>
              </div>
              <a
                href={getDirectMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="tp-map-header__link"
              >
                <ExternalLink size={14} />
                Google Haritalar'da Aç
              </a>
            </div>
            <div className="tp-map-frame-wrap">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={getEmbedMapUrl()}
              />
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="tp-cta">
        <div className="tp-cta__card">
          <h2 className="tp-cta__title">Hemen başlayın</h2>
          <p className="tp-cta__desc">
            Cihazınızın arızasını belirtin, size en uygun çözümü sunalım.
            Online randevu ile sıra beklemeden hizmet alın.
          </p>
          <div className="tp-cta__actions">
            <Link to={`${basePath}/servis-randevusu`} className="tp-hero__btn tp-hero__btn--primary">
              <CalendarPlus size={18} />
              Randevu Oluştur
            </Link>
            <Link to={`${basePath}/servis-sorgulama`} className="tp-hero__btn tp-hero__btn--secondary">
              Servis Sorgula
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tp-footer">
        © 2026 <strong>{brandTitle}</strong> · Tüm hakları saklıdır.
        <div className="tp-footer__powered">
          <a href="/" target="_blank" rel="noopener noreferrer">TeknikPro</a> altyapısı ile çalışmaktadır.
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && mediaItems[lightboxIndex] && (
        <div className="tp-lightbox" onClick={() => setLightboxIndex(null)}>
          <div className="tp-lightbox__dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="tp-lightbox__close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            {/* Previous Button */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                className="tp-lightbox__nav tp-lightbox__nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + mediaItems.length) % mediaItems.length : 0));
                }}
                aria-label="Önceki Fotoğraf"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Button */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                className="tp-lightbox__nav tp-lightbox__nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % mediaItems.length : 0));
                }}
                aria-label="Sonraki Fotoğraf"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className="tp-lightbox__image-wrap">
              <img
                src={mediaItems[lightboxIndex].url}
                alt={mediaItems[lightboxIndex].title || 'Fotoğraf Detayı'}
                className="tp-lightbox__img"
              />
            </div>

            <div className="tp-lightbox__footer">
              <div className="tp-lightbox__info">
                {mediaItems[lightboxIndex].category && (
                  <span className="tp-lightbox__category">{mediaItems[lightboxIndex].category}</span>
                )}
                {mediaItems[lightboxIndex].title && (
                  <h3 className="tp-lightbox__title">{mediaItems[lightboxIndex].title}</h3>
                )}
              </div>
              <div className="tp-lightbox__counter">
                {lightboxIndex + 1} / {mediaItems.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canlı Müşteri Sohbet Widget'ı */}
      {tenant && <ChatWidget tenant={tenant} />}
    </div>
  );
}
