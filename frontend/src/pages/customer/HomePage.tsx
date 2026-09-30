import { Link } from 'react-router-dom';
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
  Smartphone,
} from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import './HomePage.css';

export default function HomePage() {
  const { currentTenant } = useTenantStore();
  const brandTitle = currentTenant.brandName || currentTenant.name;

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav__inner">
          <Link to="/" className="home-nav__brand">
            <div className="home-nav__logo">
              <Zap size={16} />
            </div>
            <span className="home-nav__name">{brandTitle}</span>
          </Link>

          <div className="home-nav__links">
            <Link to="/servis-sorgulama" className="home-nav__link">
              <Search size={14} />
              Servis Sorgula
            </Link>
            <Link to="/servis-randevusu" className="home-nav__link home-nav__link--primary">
              <CalendarPlus size={14} />
              Randevu Al
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__badge">
          <Smartphone size={14} />
          <span>Profesyonel Teknik Servis</span>
        </div>

        <h1 className="home-hero__title">
          Cihazınız bizimle{' '}
          <span className="home-hero__gradient">güvende.</span>
        </h1>

        <p className="home-hero__desc">
          Telefon, tablet ve bilgisayar onarımında uzman ekibimizle
          cihazınızı en kısa sürede çalışır hale getiriyoruz.
        </p>

        <div className="home-hero__actions">
          <Link to="/servis-randevusu" className="home-hero__btn home-hero__btn--primary">
            <CalendarPlus size={18} />
            Online Randevu Oluştur
          </Link>
          <Link to="/servis-sorgulama" className="home-hero__btn home-hero__btn--secondary">
            <Search size={18} />
            Servis Sorgula
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <p className="home-features__label">Hizmetlerimiz</p>
        <h2 className="home-features__heading">Neden TeknikPro?</h2>

        <div className="home-features__grid">
          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--blue">
              <Wrench size={22} />
            </div>
            <h3 className="home-feature-card__title">Uzman Onarım</h3>
            <p className="home-feature-card__desc">
              Sertifikalı teknisyenlerimiz tüm marka ve modellerde
              profesyonel onarım hizmeti sunar.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--green">
              <ShieldCheck size={22} />
            </div>
            <h3 className="home-feature-card__title">{currentTenant.warrantyDays || 90} Gün Garanti</h3>
            <p className="home-feature-card__desc">
              Tüm onarımlarımız {currentTenant.warrantyDays || 90} gün garanti kapsamındadır.
              Değiştirilen parçalar için tam güvence.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--orange">
              <Clock size={22} />
            </div>
            <h3 className="home-feature-card__title">Hızlı Teslimat</h3>
            <p className="home-feature-card__desc">
              Çoğu onarım aynı gün içinde tamamlanır.
              Acil durumlar için ekspres servis imkânı.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--purple">
              <Search size={22} />
            </div>
            <h3 className="home-feature-card__title">Anlık Takip</h3>
            <p className="home-feature-card__desc">
              Cihazınızın onarım durumunu takip numaranızla
              7/24 anlık olarak takip edebilirsiniz.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--red">
              <Truck size={22} />
            </div>
            <h3 className="home-feature-card__title">Kargo ile Gönder</h3>
            <p className="home-feature-card__desc">
              Uzaktaysanız cihazınızı kargo ile gönderebilirsiniz.
              Onarım sonrası güvenle iade edilir.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-card__icon home-feature-card__icon--teal">
              <CalendarPlus size={22} />
            </div>
            <h3 className="home-feature-card__title">Online Randevu</h3>
            <p className="home-feature-card__desc">
              İnternetten kolayca randevu oluşturun, sıra beklemeden
              cihazınızı teslim edin.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-how">
        <div className="home-how__inner">
          <p className="home-how__label">Nasıl Çalışır?</p>
          <h2 className="home-how__heading">4 Kolay Adım</h2>

          <div className="home-how__steps">
            <div className="home-how-step">
              <div className="home-how-step__num">1</div>
              <h3 className="home-how-step__title">Randevu Oluştur</h3>
              <p className="home-how-step__desc">
                Online formdan cihaz bilgilerinizi ve arızanızı belirtin.
              </p>
            </div>

            <div className="home-how-step">
              <div className="home-how-step__num">2</div>
              <h3 className="home-how-step__title">Cihazı Teslim Et</h3>
              <p className="home-how-step__desc">
                Randevu saatinizde mağazamıza gelin veya kargo ile gönderin.
              </p>
            </div>

            <div className="home-how-step">
              <div className="home-how-step__num">3</div>
              <h3 className="home-how-step__title">Onarım Süreci</h3>
              <p className="home-how-step__desc">
                Uzman ekibimiz cihazınızı onarır, süreç boyunca sizi bilgilendirir.
              </p>
            </div>

            <div className="home-how-step">
              <div className="home-how-step__num">4</div>
              <h3 className="home-how-step__title">Teslim Al</h3>
              <p className="home-how-step__desc">
                Onarım tamamlandığında cihazınızı garanti ile teslim alın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta__card">
          <h2 className="home-cta__title">Hemen başlayın</h2>
          <p className="home-cta__desc">
            Cihazınızın arızasını belirtin, size en uygun çözümü sunalım.
            Online randevu ile sıra beklemeden hizmet alın.
          </p>
          <div className="home-cta__actions">
            <Link to="/servis-randevusu" className="home-cta__btn home-cta__btn--light">
              <CalendarPlus size={18} />
              Randevu Oluştur
            </Link>
            <Link to="/servis-sorgulama" className="home-cta__btn home-cta__btn--ghost">
              Servis Sorgula
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="home-contact">
        <div className="home-contact__inner">
          <p className="home-contact__label">İletişim</p>
          <h2 className="home-contact__heading">Bize Ulaşın</h2>

          <div className="home-contact__grid">
            <div className="home-contact-card">
              <div className="home-contact-card__icon">
                <Phone size={20} />
              </div>
              <h3 className="home-contact-card__title">Telefon</h3>
              <p className="home-contact-card__value">
                <a href={`tel:${currentTenant.phone.replace(/\s+/g, '')}`}>{currentTenant.phone}</a>
              </p>
            </div>

            <div className="home-contact-card">
              <div className="home-contact-card__icon">
                <MapPin size={20} />
              </div>
              <h3 className="home-contact-card__title">Adres</h3>
              <p className="home-contact-card__value">
                {currentTenant.address || 'Merkez Servis Noktası'}
              </p>
            </div>

            <div className="home-contact-card">
              <div className="home-contact-card__icon">
                <Mail size={20} />
              </div>
              <h3 className="home-contact-card__title">E-posta</h3>
              <p className="home-contact-card__value">
                <a href={`mailto:${currentTenant.email || 'destek@teknikpro.com'}`}>
                  {currentTenant.email || 'destek@teknikpro.com'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        © 2026 <strong>{brandTitle}</strong> · Tüm hakları saklıdır.
        {' · '}
        <Link to="/giris">Yönetici Girişi</Link>
      </footer>
    </div>
  );
}
