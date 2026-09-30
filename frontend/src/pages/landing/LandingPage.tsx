import { Link } from 'react-router-dom';
import {
  Zap,
  CalendarPlus,
  Search,
  Monitor,
  Users,
  BarChart3,
  Package,
  Wallet,
  Building2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Crown,
  LogIn,
  MapPin,
  Wrench,
} from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { Tenant } from '../../types';
import './LandingPage.css';

export default function LandingPage() {
  const { tenants } = useTenantStore();

  const activeTenants = tenants.filter((t) => t.subscriptionStatus === 'active');

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__brand">
            <div className="landing-nav__logo">
              <Zap size={18} />
            </div>
            <span className="landing-nav__name">TeknikPro</span>
          </Link>

          <div className="landing-nav__links">
            <Link to="/giris" className="landing-nav__link landing-nav__link--business">
              <LogIn size={14} />
              İşletme Girişi
            </Link>
            <Link to="/admin-giris" className="landing-nav__link landing-nav__link--admin">
              <Crown size={14} />
              Admin Girişi
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero__bg">
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <div className="landing-hero__orb landing-hero__orb--3" />
        </div>

        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <Zap size={14} />
            <span>SaaS Teknik Servis Platformu</span>
          </div>

          <h1 className="landing-hero__title">
            Teknik Servis Yönetiminde{' '}
            <span className="landing-hero__gradient">Yeni Nesil.</span>
          </h1>

          <p className="landing-hero__desc">
            Servis kayıtları, müşteri takibi, stok yönetimi, online randevu ve daha fazlası.
            İşletmenizi dakikalar içinde dijitalleştirin.
          </p>

          <div className="landing-hero__actions">
            <Link to="/giris" className="landing-hero__btn landing-hero__btn--primary">
              <Building2 size={18} />
              Hemen Başlayın
            </Link>
            <a href="#features" className="landing-hero__btn landing-hero__btn--secondary">
              <Search size={18} />
              Özellikleri Keşfedin
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stat">
          <div className="landing-stat__val">{activeTenants.length}+</div>
          <div className="landing-stat__label">Aktif İşletme</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat__val">10K+</div>
          <div className="landing-stat__label">Servis Kaydı</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat__val">%99.9</div>
          <div className="landing-stat__label">Uptime</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat__val">7/24</div>
          <div className="landing-stat__label">Destek</div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <p className="landing-section-label">Özellikler</p>
        <h2 className="landing-section-title">İşletmeniz İçin Her Şey Tek Yerde</h2>

        <div className="landing-features__grid">
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(0,113,227,0.15)', color: '#0071e3' }}>
              <Wrench size={24} />
            </div>
            <h3 className="landing-feature-card__title">Servis Yönetimi</h3>
            <p className="landing-feature-card__desc">
              Cihaz kabul, arıza teşhisi, onarım süreçleri ve teslimat. Tüm servis akışını tek ekrandan yönetin.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(52,199,89,0.15)', color: '#34c759' }}>
              <Users size={24} />
            </div>
            <h3 className="landing-feature-card__title">Müşteri CRM</h3>
            <p className="landing-feature-card__desc">
              Müşteri geçmişi, iletişim bilgileri, cihaz kayıtları. Müşterilerinizi tanıyın ve daha iyi hizmet verin.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
              <CalendarPlus size={24} />
            </div>
            <h3 className="landing-feature-card__title">Online Randevu</h3>
            <p className="landing-feature-card__desc">
              Müşterileriniz web sitenizden randevu alsın. Otomatik bildirimler ile süreci yönetin.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
              <Search size={24} />
            </div>
            <h3 className="landing-feature-card__title">Servis Takip</h3>
            <p className="landing-feature-card__desc">
              Müşterileriniz takip numarası ile servis durumunu 7/24 sorgulayabilsin. Şeffaf süreç yönetimi.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
              <Package size={24} />
            </div>
            <h3 className="landing-feature-card__title">Stok & Parça Yönetimi</h3>
            <p className="landing-feature-card__desc">
              Yedek parça stok takibi, kritik seviye uyarıları, tedarikçi yönetimi. Eksik parça sorunu yaşamayın.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Wallet size={24} />
            </div>
            <h3 className="landing-feature-card__title">Kasa & Muhasebe</h3>
            <p className="landing-feature-card__desc">
              Gelir/gider takibi, ödeme durumları, detaylı raporlar. Finansal kontrolünüz tam olsun.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className="landing-feature-card__title">Raporlar & Analiz</h3>
            <p className="landing-feature-card__desc">
              Günlük, haftalık, aylık performans raporları. İşletmenizin nabzını tutun, veriye dayalı kararlar alın.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icon" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
              <Monitor size={24} />
            </div>
            <h3 className="landing-feature-card__title">Özel Web Sayfası</h3>
            <p className="landing-feature-card__desc">
              İşletmenize özel logolu, markanızın renklerinde halka açık sayfa. Müşterilerinizi etkileyin.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <p className="landing-section-label">Nasıl Başlarım?</p>
        <h2 className="landing-section-title">3 Kolay Adım</h2>

        <div className="landing-how__steps">
          <div className="landing-how-step">
            <div className="landing-how-step__num">1</div>
            <h3 className="landing-how-step__title">Kayıt Olun</h3>
            <p className="landing-how-step__desc">
              İşletme bilgilerinizi, logonuzu ve tema renklerinizi belirleyerek sisteme kaydolun.
            </p>
          </div>

          <div className="landing-how-step">
            <div className="landing-how-step__num">2</div>
            <h3 className="landing-how-step__title">Ayarlayın</h3>
            <p className="landing-how-step__desc">
              Personel, stok ve hizmet bilgilerinizi girin. Halka açık sayfanızı özelleştirin.
            </p>
          </div>

          <div className="landing-how-step">
            <div className="landing-how-step__num">3</div>
            <h3 className="landing-how-step__title">Başlayın!</h3>
            <p className="landing-how-step__desc">
              Servis kayıtlarınızı oluşturun, müşterilerinize online randevu ve takip imkânı sunun.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-pricing" id="pricing">
        <p className="landing-section-label">Fiyatlandırma</p>
        <h2 className="landing-section-title">İşletmenize Uygun Plan</h2>

        <div className="landing-pricing__grid">
          {/* Starter */}
          <div className="landing-price-card">
            <h3 className="landing-price-card__name">Starter</h3>
            <p className="landing-price-card__desc">Küçük işletmeler için ideal</p>
            <div className="landing-price-card__price">
              ₺1.490<span>/ay</span>
            </div>
            <ul className="landing-price-card__features">
              <li><CheckCircle2 size={16} /> Sınırsız servis kaydı</li>
              <li><CheckCircle2 size={16} /> Müşteri yönetimi</li>
              <li><CheckCircle2 size={16} /> Stok takibi</li>
              <li><CheckCircle2 size={16} /> Online randevu sayfası</li>
              <li><CheckCircle2 size={16} /> Servis sorgulama sayfası</li>
            </ul>
            <Link to="/giris" className="landing-price-card__btn landing-price-card__btn--outline">
              Hemen Başla
            </Link>
          </div>

          {/* Pro */}
          <div className="landing-price-card landing-price-card--featured">
            <div className="landing-price-card__badge">En Popüler</div>
            <h3 className="landing-price-card__name">Pro</h3>
            <p className="landing-price-card__desc">Büyüyen işletmeler için</p>
            <div className="landing-price-card__price">
              ₺2.990<span>/ay</span>
            </div>
            <ul className="landing-price-card__features">
              <li><CheckCircle2 size={16} /> Starter'daki her şey</li>
              <li><CheckCircle2 size={16} /> Kasa & muhasebe modülü</li>
              <li><CheckCircle2 size={16} /> Detaylı raporlar</li>
              <li><CheckCircle2 size={16} /> Personel yönetimi</li>
              <li><CheckCircle2 size={16} /> Özel marka sayfası</li>
              <li><CheckCircle2 size={16} /> Öncelikli destek</li>
            </ul>
            <Link to="/giris" className="landing-price-card__btn landing-price-card__btn--primary">
              Hemen Başla
            </Link>
          </div>

          {/* Enterprise */}
          <div className="landing-price-card">
            <h3 className="landing-price-card__name">Enterprise</h3>
            <p className="landing-price-card__desc">Çok şubeli işletmeler</p>
            <div className="landing-price-card__price">
              ₺4.990<span>/ay</span>
            </div>
            <ul className="landing-price-card__features">
              <li><CheckCircle2 size={16} /> Pro'daki her şey</li>
              <li><CheckCircle2 size={16} /> Çoklu şube desteği</li>
              <li><CheckCircle2 size={16} /> API erişimi</li>
              <li><CheckCircle2 size={16} /> Özel entegrasyonlar</li>
              <li><CheckCircle2 size={16} /> 180 gün garanti desteği</li>
              <li><CheckCircle2 size={16} /> 7/24 teknik destek</li>
            </ul>
            <Link to="/giris" className="landing-price-card__btn landing-price-card__btn--outline">
              Hemen Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Active Tenants / Showcase */}
      {activeTenants.length > 0 && (
        <section className="landing-tenants">
          <p className="landing-section-label">Bize Güvenen İşletmeler</p>
          <h2 className="landing-section-title">Platformumuzdaki Servisler</h2>

          <div className="landing-tenants__grid">
            {activeTenants.map((t: Tenant) => (
              <Link
                key={t.id}
                to={`/${t.slug}`}
                className="landing-tenant-card"
              >
                <div className="landing-tenant-card__header">
                  <div
                    className="landing-tenant-card__avatar"
                    style={{
                      background: t.theme
                        ? `linear-gradient(135deg, ${t.theme.primaryColor}, ${t.theme.secondaryColor})`
                        : 'linear-gradient(135deg, #0071e3, #5e5ce6)',
                    }}
                  >
                    {(t.brandName || t.name).charAt(0)}
                  </div>
                  <div className="landing-tenant-card__info">
                    <h3>{t.brandName || t.name}</h3>
                    <p>
                      <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {t.city && t.district ? `${t.district}, ${t.city}` : t.address || 'Türkiye'}
                    </p>
                  </div>
                </div>

                {t.shortDescription && (
                  <p className="landing-tenant-card__desc">{t.shortDescription}</p>
                )}

                {t.services && t.services.length > 0 && (
                  <div className="landing-tenant-card__tags">
                    {t.services.slice(0, 3).map((s) => (
                      <span key={s} className="landing-tenant-card__tag">{s}</span>
                    ))}
                    {t.services.length > 3 && (
                      <span className="landing-tenant-card__tag">+{t.services.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="landing-tenant-card__link" style={{ color: t.theme?.primaryColor || '#0071e3' }}>
                  Sayfayı Görüntüle <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta__card">
          <h2 className="landing-cta__title">İşletmenizi dijitalleştirmeye hazır mısınız?</h2>
          <p className="landing-cta__desc">
            Hemen kayıt olun, dakikalar içinde servis yönetim sisteminizi kurun.
          </p>
          <div className="landing-cta__actions">
            <Link to="/giris" className="landing-hero__btn landing-hero__btn--primary">
              <Building2 size={18} />
              Ücretsiz Deneyin
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        © 2026 <strong>TeknikPro</strong> · SaaS Teknik Servis Platformu · Tüm hakları saklıdır.
        {' · '}
        <Link to="/giris">İşletme Girişi</Link>
        {' · '}
        <Link to="/admin-giris">Admin Girişi</Link>
      </footer>
    </div>
  );
}
