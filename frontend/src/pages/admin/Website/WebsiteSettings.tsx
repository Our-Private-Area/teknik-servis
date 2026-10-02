import { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Camera,
  X,
} from 'lucide-react';
import { useTenantStore } from '../../../store/tenantStore';
import { TenantMediaItem } from '../../../types';
import { compressImageFile } from '../../../utils/imageUtils';
import toast from 'react-hot-toast';
import './WebsiteSettings.css';

export const DEFAULT_PRESET_CATEGORIES = [
  'Dükkan & Atölye',
  'Onarım',
  'Ürünler',
  'Ekibimiz',
  'Genel',
];

const PRESET_TECH_PHOTOS: Array<{ url: string; title: string; category: string }> = [
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
    title: 'Modern Teknik Servis Atölyemiz',
    category: 'Dükkan & Atölye',
  },
  {
    url: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=900&q=80',
    title: 'Mikroskop Altında BGA & Anakart Tamiri',
    category: 'Onarım',
  },
  {
    url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=900&q=80',
    title: 'Ekran, Cam ve Batarya Değişim İstasyonu',
    category: 'Onarım',
  },
  {
    url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=900&q=80',
    title: 'Deneyimli Teknisyen Ekibimiz',
    category: 'Dükkan & Atölye',
  },
  {
    url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    title: 'Orijinal Yedek Parça ve Aksesuar Stoğumuz',
    category: 'Ürünler',
  },
  {
    url: 'https://images.unsplash.com/photo-1517430816045-df4b7de81a30?auto=format&fit=crop&w=900&q=80',
    title: 'Müşteri Danışma ve Teslimat Masası',
    category: 'Dükkan & Atölye',
  },
];

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

  const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'services' | 'media' | 'contact'>('appearance');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState(currentTenant.theme?.primaryColor || '#0071e3');
  const [secondaryColor, setSecondaryColor] = useState(currentTenant.theme?.secondaryColor || '#06b6d4');
  const [accentColor, setAccentColor] = useState(currentTenant.theme?.accentColor || '#f59e0b');
  const [applyToAdminPanel, setApplyToAdminPanel] = useState(
    currentTenant.theme?.adminThemeMode === 'website_colors'
  );
  const [logoUrl, setLogoUrl] = useState(currentTenant.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(currentTenant.coverImageUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // File input refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Media / Gallery
  const [mediaEnabled, setMediaEnabled] = useState(Boolean(currentTenant.mediaEnabled));
  const [mediaTitle, setMediaTitle] = useState(currentTenant.mediaTitle || 'Dükkanımız & Ürünlerimiz');
  const [mediaDescription, setMediaDescription] = useState(
    currentTenant.mediaDescription ||
      'Modern laboratuvar ekipmanlarımız, temiz çalışma ortamımız ve orijinal yedek parça stoğumuz.'
  );
  const [mediaItems, setMediaItems] = useState<TenantMediaItem[]>(currentTenant.mediaItems || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Dükkan & Atölye');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Categories list (presets + custom saved on tenant + items)
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const fromTenant = currentTenant.mediaCategories || [];
    const fromItems = (currentTenant.mediaItems || []).map((m) => m.category).filter(Boolean) as string[];
    return Array.from(new Set([...DEFAULT_PRESET_CATEGORIES, ...fromTenant, ...fromItems]));
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

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
    setApplyToAdminPanel(currentTenant.theme?.adminThemeMode === 'website_colors');
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
    setMediaEnabled(Boolean(currentTenant.mediaEnabled));
    setMediaTitle(currentTenant.mediaTitle || 'Dükkanımız & Ürünlerimiz');
    setMediaDescription(currentTenant.mediaDescription || '');
    setMediaItems(currentTenant.mediaItems || []);
    const fromTenant = currentTenant.mediaCategories || [];
    const fromItems = (currentTenant.mediaItems || []).map((m) => m.category).filter(Boolean) as string[];
    setCategoriesList(Array.from(new Set([...DEFAULT_PRESET_CATEGORIES, ...fromTenant, ...fromItems])));
  }, [currentTenant]);

  const publicUrl = `${window.location.origin}/${currentTenant.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Web sitesi adresiniz kopyalandı!');
  };

  // Logo file upload handler
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, SVG, WebP).');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.85 });
      setLogoUrl(dataUrl);
      toast.success('Logo bilgisayarınızdan başarıyla yüklendi!');
    } catch {
      toast.error('Logo yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  // Cover image file upload handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }
    setIsUploadingCover(true);
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 600, quality: 0.82 });
      setCoverImageUrl(dataUrl);
      toast.success('Kapak görseli başarıyla yüklendi!');
    } catch {
      toast.error('Kapak görseli yüklenirken hata oluştu.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Media gallery file upload handler (supports multi-file)
  const handleMediaFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);

    try {
      const newItems: TenantMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.82 });
        const title = newPhotoTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
        newItems.push({
          id: `media-${Date.now()}-${i}`,
          url: compressed,
          title,
          category: newPhotoCategory,
          createdAt: new Date().toISOString(),
        });
      }

      if (newItems.length > 0) {
        setMediaItems((prev) => [...prev, ...newItems]);
        setNewPhotoTitle('');
        toast.success(`${newItems.length} adet fotoğraf başarıyla eklendi!`);
      } else {
        toast.error('Lütfen geçerli görsel dosyaları seçin.');
      }
    } catch {
      toast.error('Fotoğraflar işlenirken hata oluştu.');
    } finally {
      setIsUploadingPhoto(false);
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = '';
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) {
      toast.error('Lütfen bir görsel URL adresi girin.');
      return;
    }
    const item: TenantMediaItem = {
      id: `media-${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || undefined,
      category: newPhotoCategory,
      createdAt: new Date().toISOString(),
    };
    setMediaItems((prev) => [...prev, item]);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    toast.success('Fotoğraf galeriye eklendi!');
  };

  const handleRemovePhoto = (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    toast.success('Fotoğraf galeriden kaldırıldı.');
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) {
      toast.error('Lütfen bir kategori adı yazın.');
      return;
    }
    const found = categoriesList.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (found) {
      toast.error(`"${found}" kategorisi zaten mevcut.`);
      setNewPhotoCategory(found);
      setIsAddingCategory(false);
      setCustomCategoryInput('');
      return;
    }

    const updated = [...categoriesList, trimmed];
    setCategoriesList(updated);
    setNewPhotoCategory(trimmed);
    setCustomCategoryInput('');
    setIsAddingCategory(false);
    toast.success(`"${trimmed}" kategorisi eklendi ve seçildi!`);
  };

  const handleRemoveCustomCategory = (catToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const inUse = mediaItems.some((m) => m.category === catToRemove);
    if (inUse) {
      toast.error(`"${catToRemove}" kategorisi fotoğraflarda kullanıldığı için silinemez.`);
      return;
    }
    const updated = categoriesList.filter((c) => c !== catToRemove);
    setCategoriesList(updated);
    if (newPhotoCategory === catToRemove) {
      setNewPhotoCategory(updated[0] || 'Genel');
    }
    toast.success(`"${catToRemove}" kategorisi kaldırıldı.`);
  };

  const handleLoadPresetPhotos = () => {
    const items: TenantMediaItem[] = PRESET_TECH_PHOTOS.map((p, idx) => ({
      id: `media-preset-${Date.now()}-${idx}`,
      url: p.url,
      title: p.title,
      category: p.category,
      createdAt: new Date().toISOString(),
    }));
    setMediaItems(items);
    setMediaEnabled(true);
    toast.success('Örnek atölye ve ürün fotoğrafları yüklendi!');
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
          ...currentTenant.theme,
          primaryColor,
          secondaryColor,
          accentColor,
          gradientFrom: primaryColor,
          gradientTo: secondaryColor,
          adminThemeMode: applyToAdminPanel
            ? 'website_colors'
            : currentTenant.theme?.adminThemeMode === 'website_colors'
            ? 'default'
            : currentTenant.theme?.adminThemeMode || 'default',
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
        mediaEnabled,
        mediaTitle: mediaTitle.trim() || undefined,
        mediaDescription: mediaDescription.trim() || undefined,
        mediaItems,
        mediaCategories: categoriesList,
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
          className={`ws-tab ${activeTab === 'media' ? 'ws-tab--active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <ImageIcon size={16} />
          <span>Dükkan & Ürün Medyası</span>
          {mediaEnabled && <span className="ws-tab-badge">Aktif</span>}
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

              {/* Yönetim Paneline Uygula Seçeneği */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#38bdf8" />
                    <span>Bu renkleri Yönetim Panelimde de kullan</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Seçtiğiniz web sitesi ana rengi ({primaryColor}) yönetim panelinizin menü ve buton vurgularına anında yansıtılır.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={applyToAdminPanel}
                  onChange={(e) => setApplyToAdminPanel(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0071e3' }}
                />
              </div>
            </div>

            {/* Logo & Kapak Görselleri (Bilgisayardan Yükle veya URL) */}
            <div className="ws-upload-cards-grid">
              {/* Logo Kartı */}
              <div className="ws-upload-card">
                <div className="ws-upload-card__header">
                  <label className="ws-upload-card__label">
                    İşletme Logosu (PNG, SVG, JPG)
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      className="ws-upload-card__remove"
                      onClick={() => setLogoUrl('')}
                      title="Logoyu Kaldır"
                    >
                      <Trash2 size={13} /> Kaldır
                    </button>
                  )}
                </div>

                <div className="ws-upload-card__body">
                  <div className="ws-upload-card__preview">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Önizleme" />
                    ) : (
                      <div className="ws-upload-card__placeholder">
                        <Camera size={24} />
                        <span>Logo Yok</span>
                      </div>
                    )}
                  </div>

                  <div className="ws-upload-card__controls">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      style={{ display: 'none' }}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoFileUpload}
                    />
                    <button
                      type="button"
                      className="ws-btn-upload"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      <Upload size={14} />
                      <span>{isUploadingLogo ? 'İşleniyor...' : 'Bilgisayardan Logo Seç'}</span>
                    </button>

                    <div className="ws-upload-card__url-input">
                      <span>veya URL:</span>
                      <input
                        type="url"
                        placeholder="https://.../logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kapak Görseli Kartı */}
              <div className="ws-upload-card">
                <div className="ws-upload-card__header">
                  <label className="ws-upload-card__label">
                    Kapak / Arka Plan Görseli (Opsiyonel)
                  </label>
                  {coverImageUrl && (
                    <button
                      type="button"
                      className="ws-upload-card__remove"
                      onClick={() => setCoverImageUrl('')}
                      title="Kapağı Kaldır"
                    >
                      <Trash2 size={13} /> Kaldır
                    </button>
                  )}
                </div>

                <div className="ws-upload-card__body">
                  <div className="ws-upload-card__preview ws-upload-card__preview--banner">
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Kapak Önizleme" />
                    ) : (
                      <div className="ws-upload-card__placeholder">
                        <ImageIcon size={24} />
                        <span>Kapak Yok</span>
                      </div>
                    )}
                  </div>

                  <div className="ws-upload-card__controls">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      style={{ display: 'none' }}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCoverFileUpload}
                    />
                    <button
                      type="button"
                      className="ws-btn-upload"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploadingCover}
                    >
                      <Upload size={14} />
                      <span>{isUploadingCover ? 'İşleniyor...' : 'Bilgisayardan Kapak Seç'}</span>
                    </button>

                    <div className="ws-upload-card__url-input">
                      <span>veya URL:</span>
                      <input
                        type="url"
                        placeholder="https://.../cover.jpg"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
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

        {/* Tab 4: Media & Gallery */}
        {activeTab === 'media' && (
          <div className="ws-card">
            <h2 className="ws-card__title">
              <ImageIcon size={18} color="#38bdf8" />
              <span>Dükkan, Atölye & Ürün Medyası</span>
            </h2>

            {/* Toggle Status Card */}
            <div className="ws-switch-card">
              <div className="ws-switch-card__info">
                <div className="ws-switch-card__title">
                  <span>Medya Galerisi Bölümünü Web Sayfanda Göster</span>
                  <span className={`ws-badge ${mediaEnabled ? 'ws-badge--success' : 'ws-badge--muted'}`}>
                    {mediaEnabled ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
                  </span>
                </div>
                <p className="ws-switch-card__desc">
                  Aktif edildiğinde, randevu ve servis web sitenizde dükkanınızdan, atölyenizden ve ürünlerinizden fotoğraflar ziyaretçilere sergilenir.
                </p>
              </div>

              <button
                type="button"
                className={`ws-toggle-switch ${mediaEnabled ? 'ws-toggle-switch--on' : ''}`}
                onClick={() => setMediaEnabled(!mediaEnabled)}
                aria-label="Medya Galeri Durumu"
              >
                <span className="ws-toggle-switch__thumb" />
              </button>
            </div>

            {/* Galeri Başlık & Açıklama */}
            <div className="ws-form-grid">
              <div className="ws-field">
                <label>Galeri Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Atölyemiz & Dükkanımızdan Kareler"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                />
              </div>

              <div className="ws-field">
                <label>Galeri Alt Açıklaması</label>
                <input
                  type="text"
                  placeholder="Örn: Modern laboratuvarımız ve orijinal yedek parçalarımız."
                  value={mediaDescription}
                  onChange={(e) => setMediaDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Fotoğraf Ekleme Bölümü */}
            <div className="ws-media-add-box">
              <div className="ws-media-add-box__header">
                <div>
                  <h3 className="ws-media-add-box__title">Yeni Fotoğraf Ekle</h3>
                  <p className="ws-media-add-box__subtitle">
                    Bilgisayarınızdan dükkan içi, onarım masası veya ürün fotoğraflarını seçip ekleyin.
                  </p>
                </div>
                <button
                  type="button"
                  className="ws-btn-secondary"
                  onClick={handleLoadPresetPhotos}
                  title="Hazır örnek atölye fotoğraflarını yükler"
                >
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Örnek Fotoğrafları Yükle</span>
                </button>
              </div>

              <div className="ws-media-add-form">
                <div className="ws-form-grid">
                  <div className="ws-field">
                    <label>Fotoğraf Başlığı / Not (Opsiyonel)</label>
                    <input
                      type="text"
                      placeholder="Örn: Anakart Onarım Masamız"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                    />
                  </div>

                  <div className="ws-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ margin: 0 }}>Kategori Seçin veya Yeni Ekleyin</label>
                      {!isAddingCategory && (
                        <button
                          type="button"
                          className="ws-btn-add-cat"
                          onClick={() => setIsAddingCategory(true)}
                        >
                          <Plus size={13} />
                          <span>Yeni Kategori Ekle</span>
                        </button>
                      )}
                    </div>

                    {/* Inline yeni kategori input alanı */}
                    {isAddingCategory && (
                      <div className="ws-cat-add-inline">
                        <input
                          type="text"
                          placeholder="Yeni kategori adı (Örn: Aksesuarlar, Yedek Parça...)"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCategory();
                            } else if (e.key === 'Escape') {
                              setIsAddingCategory(false);
                              setCustomCategoryInput('');
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="ws-btn-cat-save"
                          onClick={handleAddCustomCategory}
                        >
                          <Check size={14} /> Ekle
                        </button>
                        <button
                          type="button"
                          className="ws-btn-cat-cancel"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setCustomCategoryInput('');
                          }}
                          title="İptal"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="ws-category-chips">
                      {categoriesList.map((cat) => {
                        const isSelected = newPhotoCategory === cat;
                        const isPreset = DEFAULT_PRESET_CATEGORIES.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            className={`ws-category-chip ${isSelected ? 'ws-category-chip--active' : ''}`}
                            onClick={() => setNewPhotoCategory(cat)}
                          >
                            <span>{cat}</span>
                            {!isPreset && (
                              <span
                                className="ws-category-chip__remove"
                                onClick={(e) => handleRemoveCustomCategory(cat, e)}
                                title="Özel kategoriyi sil"
                              >
                                ×
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="ws-media-upload-actions">
                  <input
                    type="file"
                    ref={mediaFileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    multiple
                    onChange={handleMediaFilesUpload}
                  />

                  <button
                    type="button"
                    className="ws-btn-primary ws-btn-primary--upload"
                    onClick={() => mediaFileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                  >
                    <Upload size={16} />
                    <span>{isUploadingPhoto ? 'Yükleniyor & Sıkıştırılıyor...' : 'Bilgisayardan Fotoğraf Seç (Çoklu Seçilebilir)'}</span>
                  </button>

                  <div className="ws-media-url-row">
                    <input
                      type="url"
                      placeholder="veya direkt görsel URL yapıştırın (https://...)"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="ws-btn-secondary"
                      onClick={handleAddPhotoByUrl}
                    >
                      <Plus size={15} /> URL ile Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mevcut Yüklenmiş Fotoğraflar */}
            <div className="ws-media-list-section">
              <div className="ws-media-list-header">
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary, white)' }}>
                  Yayınlanan Fotoğraflar ({mediaItems.length})
                </h3>
                {mediaItems.length > 0 && (
                  <button
                    type="button"
                    className="ws-btn-danger-text"
                    onClick={() => {
                      if (window.confirm('Tüm galeri fotoğraflarını silmek istediğinize emin misiniz?')) {
                        setMediaItems([]);
                      }
                    }}
                  >
                    Tümünü Temizle
                  </button>
                )}
              </div>

              {mediaItems.length === 0 ? (
                <div className="ws-media-empty">
                  <div className="ws-media-empty__icon">
                    <ImageIcon size={36} />
                  </div>
                  <h4>Henüz fotoğraf eklenmedi</h4>
                  <p>
                    Dükkanınızın vitrinini, onarım ortamınızı veya sattığınız aksesuarları müşterilerinizle paylaşmak için yukarıdan fotoğraf ekleyin.
                  </p>
                  <button
                    type="button"
                    className="ws-btn-secondary"
                    onClick={handleLoadPresetPhotos}
                    style={{ marginTop: 8 }}
                  >
                    <Sparkles size={14} color="#f59e0b" />
                    <span>Hızlıca Örnek Fotoğraflar Ekle</span>
                  </button>
                </div>
              ) : (
                <div className="ws-media-grid">
                  {mediaItems.map((item, idx) => (
                    <div key={item.id || idx} className="ws-media-card">
                      <div className="ws-media-card__img-wrap">
                        <img src={item.url} alt={item.title || 'Fotoğraf'} />
                        <button
                          type="button"
                          className="ws-media-card__delete"
                          onClick={() => handleRemovePhoto(item.id)}
                          title="Fotoğrafı Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="ws-media-card__details">
                        {item.category && (
                          <span className="ws-media-card__category">{item.category}</span>
                        )}
                        <span className="ws-media-card__title">
                          {item.title || `Fotoğraf #${idx + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Contact & Social */}
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
