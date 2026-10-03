import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Server,
  Calendar,
  Phone,
  Trash2,
  Copy,
  Receipt,
  LogOut,
  Globe,
  Layers,
  Palette,
  Sparkles,
  MapPin,
  Clock,
  Tag,
  Info,
  Image as ImageIcon,
  MessageCircle,
  Upload,
  Headphones,
  Send,
  CheckCheck,
} from 'lucide-react';
import { useTenantStore, getTenantDefaultEmail, PLATFORM_DOMAIN } from '../../store/tenantStore';
import { usePlatformStore } from '../../store/platformStore';
import { compressImageFile } from '../../utils/imageUtils';
import { useAuthStore } from '../../store/authStore';
import { Tenant } from '../../types';
import { Conversation, ChatMessage } from '../../types/chat';
import {
  subscribeToSuperAdminConversations,
  subscribeToMessages,
  sendChatMessage,
  markConversationAsRead,
} from '../../services/chatService';
import toast from 'react-hot-toast';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { tenants, currentTenant, setCurrentTenant, createTenant, updateTenant, updateCurrentTenant } = useTenantStore();
  const { transactions, addTransaction, deleteTransaction } = usePlatformStore();
  const { logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'tenants' | 'finances' | 'support'>('tenants');
  const [searchTenant, setSearchTenant] = useState('');

  // Canlı Destek Masası State
  const [supportConversations, setSupportConversations] = useState<Conversation[]>([]);
  const [selectedSupportConv, setSelectedSupportConv] = useState<Conversation | null>(null);
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isAdminSending, setIsAdminSending] = useState(false);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);

  // Süper admin için tüm işletmelerin destek odalarını canlı dinle
  useEffect(() => {
    const unsub = subscribeToSuperAdminConversations((list) => {
      setSupportConversations(list);
      if (!selectedSupportConv && list.length > 0) {
        setSelectedSupportConv(list[0]);
      }
    });
    return () => unsub();
  }, []);

  // Seçili işletmenin mesajlarını dinle
  useEffect(() => {
    if (!selectedSupportConv?.id) {
      setSupportMessages([]);
      return;
    }

    markConversationAsRead(selectedSupportConv.id, 'superadmin');

    const unsub = subscribeToMessages(selectedSupportConv.id, (msgs) => {
      setSupportMessages(msgs);
    });
    return () => unsub();
  }, [selectedSupportConv?.id]);

  useEffect(() => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages]);

  const handleSendAdminReply = async () => {
    if (!adminReplyText.trim() || !selectedSupportConv || isAdminSending) return;
    setIsAdminSending(true);
    const text = adminReplyText.trim();
    setAdminReplyText('');

    try {
      await sendChatMessage({
        conversationId: selectedSupportConv.id,
        tenantId: selectedSupportConv.tenantId,
        senderType: 'superadmin',
        senderId: 'superadmin',
        senderName: 'TeknikPro Süper Admin',
        text,
        isSupportChannel: true,
      });
    } catch {
      toast.error('Mesaj gönderilemedi.');
    } finally {
      setIsAdminSending(false);
    }
  };

  const totalUnreadSupportAdmin = supportConversations.reduce(
    (acc, c) => acc + (c.unreadCountSuperAdmin || 0),
    0
  );

  // Modals & Editing
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  // New Tenant Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [monthlyFee, setMonthlyFee] = useState(2990);
  const [months, setMonths] = useState(12);
  const [cargoCompany, setCargoCompany] = useState('Yurtiçi Kargo');
  const [cargoCode, setCargoCode] = useState('');

  // Branding & Public Page State
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Kadıköy');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [tenantPassword, setTenantPassword] = useState('Teknik2026!');
  const [workingHours, setWorkingHours] = useState('Hafta içi 09:00 - 19:30, Cumartesi 10:00 - 18:00');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0071e3');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [servicesInput, setServicesInput] = useState('Ekran Değişimi, Batarya Değişimi, Sıvı Teması Onarımı, Anakart Tamiri, Kamera Değişimi, Kasa Değişimi');
  const [deviceBrandsInput, setDeviceBrandsInput] = useState('Apple, Samsung, Xiaomi, Huawei, Dyson, Asus, Lenovo, HP');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const THEME_PRESETS = [
    { name: 'Okyanus Mavisi', primary: '#0071e3', secondary: '#06b6d4', accent: '#f59e0b' },
    { name: 'Neon Turuncu', primary: '#f97316', secondary: '#fbbf24', accent: '#3b82f6' },
    { name: 'Mor Gece', primary: '#8b5cf6', secondary: '#ec4899', accent: '#10b981' },
    { name: 'Zümrüt Yeşili', primary: '#10b981', secondary: '#06b6d4', accent: '#6366f1' },
    { name: 'Lüks Altın', primary: '#eab308', secondary: '#f97316', accent: '#3b82f6' },
    { name: 'Koyu Grafit', primary: '#3b82f6', secondary: '#64748b', accent: '#38bdf8' },
  ];

  // New Transaction Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('Abonelik Tahsilatı');
  const [txAmount, setTxAmount] = useState<number>(2990);
  const [txTenantName, setTxTenantName] = useState('');
  const [txDescription, setTxDescription] = useState('');

  // Financial Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  // Monthly Recurring Revenue estimate
  const mrr = tenants
    .filter((t) => t.subscriptionStatus === 'active')
    .reduce((sum, t) => sum + (t.monthlyFee || (t.subscriptionPlan === 'starter' ? 1490 : t.subscriptionPlan === 'enterprise' ? 4990 : 2990)), 0);

  // Switch to tenant's store panel
  const handleImpersonateTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    toast.success(`"${tenant.name}" işletmesinin paneline geçildi.`);
    navigate('/panel');
  };

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
      if (!loginEmail) {
        setLoginEmail(getTenantDefaultEmail(generated));
      }
    }
  };

  const handleOpenNewTenantModal = () => {
    setEditingTenantId(null);
    setName('');
    setSlug('');
    setPhone('');
    setEmail('');
    setPlan('pro');
    setMonthlyFee(2990);
    setMonths(12);
    setCargoCompany('Yurtiçi Kargo');
    setCargoCode('');
    setShortDescription('');
    setDescription('');
    setCity('İstanbul');
    setDistrict('Kadıköy');
    setAddress('');
    setGoogleMapsUrl('');
    setLoginEmail('');
    setTenantPassword('Teknik2026!');
    setWorkingHours('Hafta içi 09:00 - 19:30, Cumartesi 10:00 - 18:00');
    setLogoUrl('');
    setCoverImageUrl('');
    setPrimaryColor('#0071e3');
    setSecondaryColor('#06b6d4');
    setAccentColor('#f59e0b');
    setServicesInput('Ekran Değişimi, Batarya Değişimi, Sıvı Teması Onarımı, Anakart Tamiri, Kamera Değişimi, Kasa Değişimi');
    setDeviceBrandsInput('Apple, Samsung, Xiaomi, Huawei, Dyson, Asus, Lenovo, HP');
    setInstagram('');
    setWhatsapp('');
    setShowTenantModal(true);
  };

  const handleOpenEditModal = (t: Tenant) => {
    setEditingTenantId(t.id);
    setName(t.name || '');
    setSlug(t.slug || '');
    setPhone(t.phone || '');
    setEmail(t.email || '');
    setPlan(t.subscriptionPlan || 'pro');
    setMonthlyFee(t.monthlyFee || (t.subscriptionPlan === 'starter' ? 1490 : t.subscriptionPlan === 'enterprise' ? 4990 : 2990));
    setCargoCompany(t.cargoCompany || 'Yurtiçi Kargo');
    setCargoCode(t.cargoCode || '');
    setShortDescription(t.shortDescription || '');
    setDescription(t.description || '');
    setCity(t.city || 'İstanbul');
    setDistrict(t.district || 'Kadıköy');
    setAddress(t.address || '');
    setGoogleMapsUrl(t.googleMapsUrl || '');
    setLoginEmail(t.loginEmail || getTenantDefaultEmail(t.slug));
    setTenantPassword(t.password || 'Teknik2026!');
    setWorkingHours(t.workingHours || 'Hafta içi 09:00 - 19:30, Cumartesi 10:00 - 18:00');
    setLogoUrl(t.logoUrl || '');
    setCoverImageUrl(t.coverImageUrl || '');
    setPrimaryColor(t.theme?.primaryColor || '#0071e3');
    setSecondaryColor(t.theme?.secondaryColor || '#06b6d4');
    setAccentColor(t.theme?.accentColor || '#f59e0b');
    setServicesInput(t.services ? t.services.join(', ') : 'Ekran Değişimi, Batarya Değişimi, Sıvı Teması Onarımı, Anakart Tamiri');
    setDeviceBrandsInput(t.deviceBrands ? t.deviceBrands.join(', ') : 'Apple, Samsung, Xiaomi, Huawei');
    setInstagram(t.socialMedia?.instagram || '');
    setWhatsapp(t.socialMedia?.whatsapp || '');
    setShowTenantModal(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !phone.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (!editingTenantId && tenants.some((t) => t.slug.toLowerCase() === slug.trim().toLowerCase())) {
      toast.error('Bu slug zaten kayıtlı.');
      return;
    }

    const parsedServices = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedBrands = deviceBrandsInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const themeData = {
      primaryColor,
      secondaryColor,
      accentColor,
      gradientFrom: primaryColor,
      gradientTo: secondaryColor,
    };

    try {
      if (editingTenantId) {
        await updateTenant(editingTenantId, {
          name,
          brandName: name,
          slug: slug.trim().toLowerCase(),
          phone,
          email: email || undefined,
          city: city || undefined,
          district: district || undefined,
          address: address || undefined,
          googleMapsUrl: googleMapsUrl.trim() || undefined,
          loginEmail: loginEmail.trim() || undefined,
          password: tenantPassword.trim() || undefined,
          workingHours: workingHours || undefined,
          shortDescription: shortDescription || undefined,
          description: description || undefined,
          logoUrl: logoUrl || undefined,
          coverImageUrl: coverImageUrl || undefined,
          theme: themeData,
          services: parsedServices.length > 0 ? parsedServices : undefined,
          deviceBrands: parsedBrands.length > 0 ? parsedBrands : undefined,
          socialMedia: {
            instagram: instagram || undefined,
            whatsapp: whatsapp || phone.replace(/\D/g, '') || undefined,
          },
          cargoCompany,
          cargoCode: cargoCode || undefined,
          subscriptionPlan: plan,
          monthlyFee: Number(monthlyFee),
        });
        toast.success(`"${name}" işletmesi ve teması başarıyla güncellendi!`);
      } else {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + Number(months));

        const newT = await createTenant({
          name,
          brandName: name,
          slug: slug.trim().toLowerCase(),
          phone,
          email: email || undefined,
          city: city || undefined,
          district: district || undefined,
          address: address || undefined,
          googleMapsUrl: googleMapsUrl.trim() || undefined,
          loginEmail: loginEmail.trim() || undefined,
          password: tenantPassword.trim() || undefined,
          workingHours: workingHours || undefined,
          shortDescription: shortDescription || undefined,
          description: description || undefined,
          logoUrl: logoUrl || undefined,
          coverImageUrl: coverImageUrl || undefined,
          theme: themeData,
          services: parsedServices.length > 0 ? parsedServices : undefined,
          deviceBrands: parsedBrands.length > 0 ? parsedBrands : undefined,
          socialMedia: {
            instagram: instagram || undefined,
            whatsapp: whatsapp || phone.replace(/\D/g, '') || undefined,
          },
          cargoCompany,
          cargoCode: cargoCode || undefined,
          warrantyDays: 90,
          subscriptionStatus: 'active',
          subscriptionPlan: plan,
          monthlyFee: Number(monthlyFee),
          subscriptionEndDate: endDate.toISOString().split('T')[0],
        });

        // Also record initial subscription income
        await addTransaction({
          type: 'income',
          category: 'Abonelik Tahsilatı',
          amount: Number(monthlyFee),
          tenantId: newT.id,
          tenantName: name,
          description: `${name} - İlk Kurulum & ${plan.toUpperCase()} Paket Lisansı`,
          date: new Date().toISOString(),
        });

        toast.success(`${name} başarıyla sisteme kaydedildi!`);
      }

      setShowTenantModal(false);
    } catch {
      toast.error('İşlem sırasında hata oluştu.');
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const nextStatus = tenant.subscriptionStatus === 'active' ? 'expired' : 'active';
    await updateCurrentTenant({
      subscriptionStatus: nextStatus,
    });
    toast.success(`Abonelik durumu güncellendi: ${nextStatus === 'active' ? 'Aktif' : 'Askıda'}`);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || txAmount <= 0) {
      toast.error('Geçerli bir tutar giriniz.');
      return;
    }

    await addTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      tenantName: txTenantName || undefined,
      description: txDescription || `${txCategory} işlemi`,
      date: new Date().toISOString(),
    });

    toast.success('Finansal hareket kaydedildi!');
    setShowFinanceModal(false);
    setTxDescription('');
    setTxTenantName('');
  };

  const copyBookingLink = (tSlug: string) => {
    const url = `${window.location.origin}/servis-randevusu?firma=${tSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('Randevu linki kopyalandı');
  };

  return (
    <div className="super-admin">
      {/* Top Header */}
      <header className="super-header">
        <div className="super-header__inner">
          <div className="super-brand">
            <div className="super-brand__badge">
              <Crown size={20} />
            </div>
            <div>
              <div className="super-brand__title">TeknikPro Platform Sahibi Paneli</div>
              <span className="super-brand__subtitle">SaaS & Çoklu İşletme Yönetim Merkezi</span>
            </div>
          </div>

          <div className="super-header__actions">
            <Link to="/panel" className="super-btn-goto-panel">
              <span>Aktif Dükkan Paneline Git</span>
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success('Süper Admin oturumu kapatıldı.');
                navigate('/admin-giris');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="super-main">
        {/* KPI Stats */}
        <div className="super-kpis">
          <div className="super-kpi">
            <div className="super-kpi__header">
              <span>Aylık Düzenli Gelir (MRR)</span>
              <div className="super-kpi__icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="super-kpi__val">₺{mrr.toLocaleString('tr-TR')}</div>
            <div className="super-kpi__sub">Aktif abonelerden gelen aylık sabit ciro</div>
          </div>

          <div className="super-kpi">
            <div className="super-kpi__header">
              <span>Toplam SaaS Geliri</span>
              <div className="super-kpi__icon" style={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34c759' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div className="super-kpi__val" style={{ color: '#34c759' }}>
              ₺{totalIncome.toLocaleString('tr-TR')}
            </div>
            <div className="super-kpi__sub">Abonelik tahsilatları toplamı</div>
          </div>

          <div className="super-kpi">
            <div className="super-kpi__header">
              <span>Platform Giderleri</span>
              <div className="super-kpi__icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <TrendingDown size={18} />
              </div>
            </div>
            <div className="super-kpi__val" style={{ color: '#f87171' }}>
              ₺{totalExpense.toLocaleString('tr-TR')}
            </div>
            <div className="super-kpi__sub">Sunucu, SMS, API, Hosting maliyetleri</div>
          </div>

          <div className="super-kpi">
            <div className="super-kpi__header">
              <span>Net Platform Kârınız</span>
              <div className="super-kpi__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Crown size={18} />
              </div>
            </div>
            <div className="super-kpi__val" style={{ color: '#fbbf24' }}>
              ₺{netProfit.toLocaleString('tr-TR')}
            </div>
            <div className="super-kpi__sub">Kasa net bakiye (Gelir - Gider)</div>
          </div>

          <div className="super-kpi">
            <div className="super-kpi__header">
              <span>Kayıtlı İşletmeler</span>
              <div className="super-kpi__icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <Building2 size={18} />
              </div>
            </div>
            <div className="super-kpi__val">{tenants.length}</div>
            <div className="super-kpi__sub">
              {tenants.filter((t) => t.subscriptionStatus === 'active').length} aktif / {tenants.filter((t) => t.subscriptionStatus !== 'active').length} dondurulmuş
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="super-tabs">
          <button
            type="button"
            className={`super-tab ${activeTab === 'tenants' ? 'super-tab--active' : ''}`}
            onClick={() => setActiveTab('tenants')}
          >
            <Building2 size={16} />
            <span>Kayıtlı İşletmeler ({tenants.length})</span>
          </button>
          <button
            type="button"
            className={`super-tab ${activeTab === 'finances' ? 'super-tab--active' : ''}`}
            onClick={() => setActiveTab('finances')}
          >
            <Receipt size={16} />
            <span>Gelir / Gider Defterim ({transactions.length})</span>
          </button>
          <button
            type="button"
            className={`super-tab ${activeTab === 'support' ? 'super-tab--active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <Headphones size={16} />
            <span>İşletme Canlı Destek Masası ({supportConversations.length})</span>
            {totalUnreadSupportAdmin > 0 && (
              <span style={{ background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>
                {totalUnreadSupportAdmin}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Tenants List */}
        {activeTab === 'tenants' && (
          <div className="super-card">
            <div className="super-card__header">
              <h2 className="super-card__title">
                <Building2 size={18} color="#38bdf8" />
                <span>Teknik Servis İşletmeleri</span>
              </h2>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="İşletme adı veya slug ara..."
                    value={searchTenant}
                    onChange={(e) => setSearchTenant(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '8px 12px 8px 32px',
                      color: 'white',
                      fontSize: 13,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewTenantModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#0071e3',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Plus size={16} />
                  <span>Yeni İşletme Ekle</span>
                </button>
              </div>
            </div>

            <table className="super-table">
              <thead>
                <tr>
                  <th>İşletme Unvanı</th>
                  <th>Özel Link (Slug)</th>
                  <th>Giriş Bilgileri (Giriş Mail & Şifre)</th>
                  <th>Paket & Lisans</th>
                  <th>Durum</th>
                  <th>Bitiş Tarihi</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tenants
                  .filter((t) => t.name.toLowerCase().includes(searchTenant.toLowerCase()) || t.slug.includes(searchTenant))
                  .map((t) => {
                    const isSelected = t.id === currentTenant.id;
                    const fee = t.monthlyFee || (t.subscriptionPlan === 'starter' ? 1490 : t.subscriptionPlan === 'enterprise' ? 4990 : 2990);

                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: t.theme
                                  ? `linear-gradient(135deg, ${t.theme.primaryColor}, ${t.theme.secondaryColor})`
                                  : isSelected ? '#0071e3' : 'rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 14,
                                color: 'white',
                                boxShadow: t.theme ? `0 2px 10px ${t.theme.primaryColor}40` : 'none',
                              }}
                            >
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
                                />
                              ) : (
                                (t.brandName || t.name).charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'white' }}>{t.name}</div>
                              {t.theme ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.theme.primaryColor, border: '1px solid rgba(255,255,255,0.3)' }} />
                                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.theme.secondaryColor, border: '1px solid rgba(255,255,255,0.3)' }} />
                                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2, fontFamily: 'monospace' }}>{t.theme.primaryColor}</span>
                                </div>
                              ) : (
                                <div style={{ fontSize: 11, color: '#64748b' }}>{t.id}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ color: '#38bdf8', fontSize: 12 }}>{t.slug}</code>
                            <button
                              type="button"
                              onClick={() => copyBookingLink(t.slug)}
                              title="Randevu Linkini Kopyala"
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                            {t.loginEmail || getTenantDefaultEmail(t.slug)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Şifre:</span>
                            <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4, color: '#fbbf24', fontFamily: 'monospace' }}>
                              {t.password || 'Teknik2026!'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.phone}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, color: '#fbbf24' }}>
                            {t.subscriptionPlan || 'Pro'}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>₺{fee.toLocaleString('tr-TR')}/ay</div>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: t.subscriptionStatus === 'active' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: t.subscriptionStatus === 'active' ? '#34c759' : '#ef4444',
                            }}
                          >
                            {t.subscriptionStatus === 'active' ? 'Aktif' : 'Askıda'}
                          </span>
                        </td>

                        <td style={{ color: '#94a3b8', fontSize: 12 }}>
                          {t.subscriptionEndDate || 'Belirtilmedi'}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                            <a
                              href={`/${t.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Halka Açık Web Sitesini Gör"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 10px',
                                borderRadius: 6,
                                background: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <Globe size={13} />
                              <span>Web Sayfası</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(t)}
                              title="İşletme Temasını & Bilgilerini Düzenle"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 10px',
                                borderRadius: 6,
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#e2e8f0',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <SlidersHorizontal size={13} />
                              <span>Düzenle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleImpersonateTenant(t)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0071e3',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              <span>Dükkan Paneline Gir</span>
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: SaaS Finances (Gelir / Gider Defteri) */}
        {activeTab === 'finances' && (
          <div className="super-card">
            <div className="super-card__header">
              <h2 className="super-card__title">
                <Receipt size={18} color="#34c759" />
                <span>SaaS Gelir / Gider Defteri</span>
              </h2>

              <button
                type="button"
                onClick={() => setShowFinanceModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#34c759',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Plus size={16} />
                <span>Yeni Gelir / Gider Ekle</span>
              </button>
            </div>

            <table className="super-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İşlem Türü</th>
                  <th>Kategori</th>
                  <th>İşletme / Açıklama</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                  <th style={{ textAlign: 'right' }}>Sil</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const dateStr = new Date(tx.date).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={tx.id}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{dateStr}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: isIncome ? 'rgba(52, 199, 89, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isIncome ? '#34c759' : '#ef4444',
                          }}
                        >
                          {isIncome ? 'Gelir (Tahsilat)' : 'Gider (Maliyet)'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'white' }}>{tx.category}</td>
                      <td>
                        <div style={{ color: '#e2e8f0' }}>{tx.description}</div>
                        {tx.tenantName && (
                          <div style={{ fontSize: 11, color: '#38bdf8' }}>Firma: {tx.tenantName}</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: isIncome ? '#34c759' : '#f87171' }}>
                        {isIncome ? '+' : '-'}₺{Number(tx.amount).toLocaleString('tr-TR')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => deleteTransaction(tx.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Business Live Support Desk */}
        {activeTab === 'support' && (
          <div className="super-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '620px' }}>
              {/* Sol: Destek Talebi Olan İşletmeler Listesi */}
              <div style={{ width: '320px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', background: '#0a0e14', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Headphones size={18} color="#10b981" />
                    <span>İşletme Destek Masası</span>
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    İşletmelerden gelen resmi platform yardım ve soru talepleri
                  </p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {supportConversations.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      Henüz bir işletmeden destek mesajı gelmedi.
                    </div>
                  ) : (
                    supportConversations.map((conv) => {
                      const isSelected = selectedSupportConv?.id === conv.id;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedSupportConv(conv)}
                          style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                            borderLeft: isSelected ? '3px solid #10b981' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 12,
                          }}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38bdf8' }}>
                            {conv.tenantName?.charAt(0).toUpperCase() || 'F'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.tenantName}
                              </span>
                            </div>
                            <p style={{ margin: '3px 0 0 0', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {conv.lastMessage || 'Destek talebi'}
                            </p>
                          </div>
                          {conv.unreadCountSuperAdmin > 0 && (
                            <span style={{ background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, height: 'fit-content' }}>
                              {conv.unreadCountSuperAdmin}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sağ: Seçili İşletmeyle Canlı Yazışma */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#070a0e' }}>
                {selectedSupportConv ? (
                  <>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#0c1117', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>
                          {selectedSupportConv.tenantName}
                        </h4>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          Tenant ID: <code>{selectedSupportConv.tenantId}</code>
                        </span>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {supportMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: 40 }}>
                          Henüz bir mesaj bulunmuyor.
                        </div>
                      ) : (
                        supportMessages.map((msg) => {
                          const isSuperAdmin = msg.senderType === 'superadmin';
                          const timeFormatted = msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '';
                          return (
                            <div
                              key={msg.id}
                              style={{
                                alignSelf: isSuperAdmin ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isSuperAdmin ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 12,
                                  background: isSuperAdmin ? '#0071e3' : '#1e293b',
                                  color: 'white',
                                  fontSize: 13,
                                  lineHeight: 1.45,
                                }}
                              >
                                {msg.text}
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 3, display: 'flex', gap: 4 }}>
                                <span>{msg.senderName}</span>
                                <span>•</span>
                                <span>{timeFormatted}</span>
                                {isSuperAdmin && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={supportMessagesEndRef} />
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#0c1117', display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        placeholder="İşletmeye platform yanıtınızı yazın... (Enter)"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAdminReply();
                          }
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: 'white',
                          fontSize: 13,
                          outline: 'none',
                        }}
                        disabled={isAdminSending}
                      />
                      <button
                        type="button"
                        onClick={handleSendAdminReply}
                        disabled={!adminReplyText.trim() || isAdminSending}
                        style={{
                          background: '#0071e3',
                          border: 'none',
                          color: 'white',
                          padding: '0 18px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <Send size={15} />
                        <span>Gönder</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    Yazışmak için soldan bir işletme seçin.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal 1: New Tenant */}
      {showTenantModal && (
        <div className="super-modal-backdrop" onClick={() => setShowTenantModal(false)}>
          <div className="super-modal super-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={22} color="#0071e3" />
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                    {editingTenantId ? `"${name}" İşletmesini & Temasını Düzenle` : 'Yeni İşletme & Halka Açık Sayfa Oluştur'}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                    {editingTenantId
                      ? 'Tema renklerini ve işletme bilgilerini güncelleyin.'
                      : 'İşletmenin yönetim paneli ve web sitesi otomatik oluşturulacaktır.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTenantModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTenant} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Section 1: Temel Bilgiler */}
              <div className="super-modal-section">
                <div className="super-modal-section__title">
                  <Building2 size={15} />
                  <span>1. Temel İşletme Bilgileri</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İşletme / Dükkan Adı *</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy Cep Servisi"
                      value={name}
                      onChange={(e) => handleSlugGen(e.target.value)}
                      required
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Özel URL Slug *</label>
                    <input
                      type="text"
                      placeholder="Örn: kadikoy-cep"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: 11, color: '#64748b' }}>Web adresi: /{slug || 'slug'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>Giriş E-postası (Panele Giriş)</label>
                    <input
                      type="email"
                      placeholder={`örn: bursabilisim@${PLATFORM_DOMAIN}`}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#0f172a', border: '1px solid #38bdf8', color: 'white' }}
                    />
                    <span style={{ fontSize: 11, color: '#64748b' }}>Örn: bursabilisim@{PLATFORM_DOMAIN}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Giriş Şifresi</label>
                    <input
                      type="text"
                      placeholder="Şifre belirleyin (örn: Bursa2026!)"
                      value={tenantPassword}
                      onChange={(e) => setTenantPassword(e.target.value)}
                      required
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(251,191,36,0.5)', color: 'white' }}
                    />
                    <span style={{ fontSize: 11, color: '#64748b' }}>İşletmenin yönetim paneline giriş şifresi</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Telefon Numarası *</label>
                    <input
                      type="text"
                      placeholder="0216 330 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>E-Posta</label>
                    <input
                      type="email"
                      placeholder="destek@isletme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İl</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İlçe</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Çalışma Saatleri</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Açık Adres</label>
                  <input
                    type="text"
                    placeholder="Örn: Osmanağa Mah. Söğütlüçeşme Cad. No:42 Kadıköy / İstanbul"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Google Maps Konum / Harita Linki (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: https://maps.app.goo.gl/... veya Google Maps paylaşım linki"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Boş bırakırsanız işletme sayfasında açık adresiniz ve ilçe/il baz alınarak otomatik harita oluşturulur.
                  </span>
                </div>
              </div>

              {/* Section 2: Halka Açık Sayfa & Tema Tasarımı */}
              <div className="super-modal-section">
                <div className="super-modal-section__title">
                  <Palette size={15} />
                  <span>2. Halka Açık Sayfa & Tema Tasarımı</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kısa Slogan / Rozet Metni</label>
                  <input
                    type="text"
                    placeholder="Örn: Kadıköy'ün Lider Apple & Android Teknik Servisi"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Hakkımızda / Tanıtım Metni</label>
                  <textarea
                    rows={2}
                    placeholder="İşletmenin halka açık ana sayfasında görünecek tanıtım ve güven metni..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Logo URL</label>
                      <label
                        style={{
                          fontSize: 11,
                          color: '#38bdf8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Upload size={12} /> Bilgisayardan Seç
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const dataUrl = await compressImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.85 });
                                setLogoUrl(dataUrl);
                              } catch {
                                // ignore
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://.../logo.png veya yükleyin"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12 }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kapak Görseli URL</label>
                      <label
                        style={{
                          fontSize: 11,
                          color: '#38bdf8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Upload size={12} /> Bilgisayardan Seç
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 600, quality: 0.82 });
                                setCoverImageUrl(dataUrl);
                              } catch {
                                // ignore
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://.../cover.jpg veya yükleyin"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12 }}
                    />
                  </div>
                </div>

                {/* Color presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Hazır Renk Paletleri</label>
                  <div className="color-presets-row">
                    {THEME_PRESETS.map((p) => {
                      const isCurrent = primaryColor === p.primary && secondaryColor === p.secondary;
                      return (
                        <button
                          type="button"
                          key={p.name}
                          className="color-preset-pill"
                          onClick={() => {
                            setPrimaryColor(p.primary);
                            setSecondaryColor(p.secondary);
                            setAccentColor(p.accent);
                          }}
                          style={
                            isCurrent
                              ? {
                                  borderColor: p.primary,
                                  background: `${p.primary}33`,
                                  boxShadow: `0 0 12px ${p.primary}40`,
                                  fontWeight: 700,
                                }
                              : undefined
                          }
                        >
                          <div className="color-dot-pair">
                            <span className="color-dot" style={{ background: p.primary }} />
                            <span className="color-dot" style={{ background: p.secondary }} />
                          </div>
                          <span>{p.name}</span>
                          {isCurrent && <span style={{ color: p.primary, fontSize: 11 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Ana Renk</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İkincil Renk</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Vurgu Rengi</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Canlı Tema Önizleme Kartı */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Canlı Tema Önizlemesi
                  </label>
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: `1.5px solid ${primaryColor}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: 18,
                          boxShadow: `0 4px 16px ${primaryColor}50`,
                        }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
                        ) : name ? (
                          name.charAt(0).toUpperCase()
                        ) : (
                          'T'
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>
                          {name || 'İşletme Adınız'}
                        </div>
                        <div style={{ fontSize: 12, color: primaryColor, fontWeight: 600 }}>
                          {shortDescription || 'Özel Tema & Halka Açık Web Sitesi'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          boxShadow: `0 4px 14px ${primaryColor}40`,
                        }}
                      >
                        Online Randevu Al
                      </div>
                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          border: `1px solid ${secondaryColor}60`,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Servis Sorgula
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Servis & Marka Portföyü */}
              <div className="super-modal-section">
                <div className="super-modal-section__title">
                  <Tag size={15} />
                  <span>3. Servis & Marka Portföyü</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Hizmetler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Desteklenen Markalar (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={deviceBrandsInput}
                    onChange={(e) => setDeviceBrandsInput(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Instagram Kullanıcı Adı</label>
                    <input
                      type="text"
                      placeholder="kadikoycep"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>WhatsApp Numarası</label>
                    <input
                      type="text"
                      placeholder="905320000000"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Abonelik & Kargo */}
              <div className="super-modal-section">
                <div className="super-modal-section__title">
                  <Receipt size={15} />
                  <span>4. Abonelik & Kargo Anlaşması</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Abonelik Paketi</label>
                    <select
                      value={plan}
                      onChange={(e) => {
                        const p = e.target.value as any;
                        setPlan(p);
                        setMonthlyFee(p === 'starter' ? 1490 : p === 'enterprise' ? 4990 : 2990);
                      }}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    >
                      <option value="starter">Starter (₺1.490/ay)</option>
                      <option value="pro">Pro (₺2.990/ay)</option>
                      <option value="enterprise">Enterprise (₺4.990/ay)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Aylık Lisans Ücreti (₺)</label>
                    <input
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#34c759', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kargo Şirketi</label>
                    <input
                      type="text"
                      value={cargoCompany}
                      onChange={(e) => setCargoCompany(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kargo Anlaşma Kodu</label>
                    <input
                      type="text"
                      placeholder="YK-12345"
                      value={cargoCode}
                      onChange={(e) => setCargoCode(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: 8, background: '#0071e3', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Sparkles size={16} />
                  <span>{editingTenantId ? 'Değişiklikleri & Temayı Kaydet' : 'İşletmeyi & Web Sitesini Başlat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: New Finance Transaction */}
      {showFinanceModal && (
        <div className="super-modal-backdrop" onClick={() => setShowFinanceModal(false)}>
          <div className="super-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Receipt size={20} color="#34c759" />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Yeni Platform Gelir / Gideri</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İşlem Türü</label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setTxType(t);
                      setTxCategory(t === 'income' ? 'Abonelik Tahsilatı' : 'Sunucu / Cloud VPS');
                    }}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <option value="income">Gelir (Abonelik Tahsilatı)</option>
                    <option value="expense">Gider (Platform Maliyeti)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Kategori</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    {txType === 'income' ? (
                      <>
                        <option value="Abonelik Tahsilatı">Abonelik Tahsilatı</option>
                        <option value="Kurulum & Eğitim Bedeli">Kurulum & Eğitim Bedeli</option>
                        <option value="Özel Entegrasyon">Özel Entegrasyon</option>
                      </>
                    ) : (
                      <>
                        <option value="Sunucu / Cloud VPS">Sunucu / Cloud VPS (Hetzner, AWS)</option>
                        <option value="SMS & Bildirim Altyapısı">SMS & Bildirim Altyapısı (Netgsm vb.)</option>
                        <option value="Alan Adı & SSL">Alan Adı & SSL (Cloudflare)</option>
                        <option value="Pazarlama & Reklam">Pazarlama & Reklam</option>
                        <option value="Yazılım Araçları">Yazılım Araçları</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Tutar (₺) *</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    required
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: txType === 'income' ? '#34c759' : '#f87171', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>İlgili Firma (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: Kaya Teknik Servis"
                    value={txTenantName}
                    onChange={(e) => setTxTenantName(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Açıklama</label>
                <input
                  type="text"
                  placeholder="İşlem detayı..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowFinanceModal(false)}
                  style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: 8, background: txType === 'income' ? '#34c759' : '#ef4444', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hareketi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
