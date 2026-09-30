import { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Copy,
  Calendar,
  Phone,
  Mail,
  Shield,
  ArrowRight,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { useTenantStore } from '../../../store/tenantStore';
import { Tenant } from '../../../types';
import toast from 'react-hot-toast';

export default function TenantManagement() {
  const { tenants, currentTenant, setCurrentTenant, createTenant, updateCurrentTenant } =
    useTenantStore();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New tenant form state
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cargoCompany, setCargoCompany] = useState('Yurtiçi Kargo');
  const [cargoCode, setCargoCode] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [subscriptionMonths, setSubscriptionMonths] = useState(12);

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.brandName && t.brandName.toLowerCase().includes(q)) ||
      t.slug.toLowerCase().includes(q) ||
      t.phone.includes(q)
    );
  });

  const handleSlugGen = (val: string) => {
    setName(val);
    if (!slug) {
      const generated = val
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !phone.trim()) {
      toast.error('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    // Check duplicate slug
    if (tenants.some((t) => t.slug.toLowerCase() === slug.trim().toLowerCase())) {
      toast.error('Bu web uzantısı (slug) zaten başka bir işletmede kayıtlı.');
      return;
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(subscriptionMonths));

    try {
      await createTenant({
        name,
        brandName: brandName || name,
        slug: slug.trim().toLowerCase(),
        phone,
        email: email || undefined,
        address: address || undefined,
        cargoCompany,
        cargoCode: cargoCode || undefined,
        warrantyDays: 90,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionEndDate: endDate.toISOString().split('T')[0],
      });

      toast.success(`${name} başarıyla sisteme eklendi!`);
      setShowModal(false);
      // Reset form
      setName('');
      setBrandName('');
      setSlug('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCargoCode('');
    } catch {
      toast.error('İşletme eklenirken hata oluştu.');
    }
  };

  const handleCopyLink = (tenantSlug: string) => {
    const url = `${window.location.origin}/servis-randevusu?firma=${tenantSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('İşletme online randevu linki kopyalandı');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
            İşletmeler & Müşteri Firmalarınız (SaaS)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', marginTop: 6, margin: 0 }}>
            Yazılımınızı kullanan teknik servis firmalarını yönetin, yeni işletme lisansı açın veya dondurun.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0071e3',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)',
          }}
        >
          <Plus size={18} />
          <span>Yeni İşletme Kaydet</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255,255,255,0.08))', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#38bdf8' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Kayıtlı İşletmeler</span>
            <Building2 size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>{tenants.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>Aktif kullanılan teknik servisler</div>
        </div>

        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255,255,255,0.08))', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34c759' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Aktif Lisanslar</span>
            <CheckCircle size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>
            {tenants.filter((t) => t.subscriptionStatus === 'active').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>Kesintisiz hizmet verenler</div>
        </div>

        <div style={{ background: 'var(--bg-card, #111827)', border: '1px solid var(--border-primary, rgba(255,255,255,0.08))', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Şu An Yönetilen</span>
            <SlidersHorizontal size={20} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px', color: '#f59e0b' }}>
            {currentTenant.brandName || currentTenant.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>Panelde görüntülenen işletme</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="İşletme adı, slug veya telefon ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              background: 'var(--bg-card, #111827)',
              border: '1px solid var(--border-primary, rgba(255,255,255,0.1))',
              color: 'white',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Tenant List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTenants.map((t) => {
          const isCurrent = t.id === currentTenant.id;
          const tenantUrl = `${window.location.origin}/servis-randevusu?firma=${t.slug}`;

          return (
            <div
              key={t.id}
              style={{
                background: 'var(--bg-card, #111827)',
                border: isCurrent ? '1.5px solid #0071e3' : '1px solid var(--border-primary, rgba(255,255,255,0.08))',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: isCurrent ? '0 0 16px rgba(0, 113, 227, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: isCurrent ? '#0071e3' : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  <Building2 size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{t.name}</h3>
                    {isCurrent && (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#0071e3', color: 'white' }}>
                        Aktif Görüntülenen
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: t.subscriptionStatus === 'active' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: t.subscriptionStatus === 'active' ? '#34c759' : '#ef4444',
                      }}
                    >
                      {t.subscriptionStatus === 'active' ? 'Aktif' : 'Askıda'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', marginTop: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Globe size={13} />
                      <code>{t.slug}</code>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={13} />
                      {t.phone}
                    </span>
                    {t.cargoCompany && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        📦 {t.cargoCompany} ({t.cargoCode || 'Kodsuz'})
                      </span>
                    )}
                    {t.subscriptionEndDate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} />
                        Bitiş: {t.subscriptionEndDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleCopyLink(t.slug)}
                  title="Müşteri Randevu Linkini Kopyala"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <Copy size={13} />
                  <span>Randevu Linki</span>
                </button>

                <a
                  href={tenantUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Müşteri Ekranında Aç"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textDecoration: 'none',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Önizle</span>
                </a>

                {!isCurrent ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTenant(t);
                      toast.success(`Aktif işletme "${t.name}" olarak değiştirildi.`);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 6,
                      background: '#0071e3',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span>Bu İşletmeye Geç</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600, padding: '0 8px' }}>
                    Şu an Seçili
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for New Tenant */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={22} color="#0071e3" />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Yeni İşletme / Tamirci Ekle</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İşletme / Dükkan Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Kaya Teknik Servis"
                  value={name}
                  onChange={(e) => handleSlugGen(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>URL Slug (Özel Link) *</label>
                  <input
                    type="text"
                    placeholder="Örn: kaya-teknik"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontFamily: 'monospace' }}
                  />
                  <small style={{ fontSize: 10, color: '#64748b' }}>Link: /servis-randevusu?firma={slug || '...'}</small>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Telefon Numarası *</label>
                  <input
                    type="text"
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Anlaşmalı Kargo Firması</label>
                  <input
                    type="text"
                    placeholder="Örn: Yurtiçi Kargo"
                    value={cargoCompany}
                    onChange={(e) => setCargoCompany(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kargo Anlaşma Kodu</label>
                  <input
                    type="text"
                    placeholder="Örn: YK-88412"
                    value={cargoCode}
                    onChange={(e) => setCargoCode(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Abonelik Paketi</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <option value="starter">Başlangıç (Starter)</option>
                    <option value="pro">Profesyonel (Pro)</option>
                    <option value="enterprise">Kurumsal (Enterprise)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Lisans Süresi</label>
                  <select
                    value={subscriptionMonths}
                    onChange={(e) => setSubscriptionMonths(Number(e.target.value))}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <option value={1}>1 Ay (Deneme)</option>
                    <option value={3}>3 Ay</option>
                    <option value={6}>6 Ay</option>
                    <option value={12}>12 Ay (Yıllık)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Dükkan / Servis Adresi</label>
                <input
                  type="text"
                  placeholder="İl, İlçe, Mahalle..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: 8, background: '#0071e3', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  İşletmeyi Kaydet & Lisansla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
