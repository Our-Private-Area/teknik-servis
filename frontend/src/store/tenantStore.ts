import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '../types';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

export const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || 'teknikpro.com';

export const getTenantDefaultEmail = (slug: string, domain = PLATFORM_DOMAIN) => {
  const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}@${domain}`;
};

export const DEFAULT_TENANT: Tenant = {
  id: 'tenant-default',
  slug: 'teknikpro',
  name: 'TeknikPro Yetkili Servis Hizmetleri',
  brandName: 'TeknikPro',
  phone: '0850 300 40 50',
  email: 'destek@teknikpro.com',
  loginEmail: 'teknikpro@teknikpro.com',
  password: 'Teknik2026!',
  address: 'Kadıköy Rıhtım Cad. No: 42, İstanbul',
  cargoCompany: 'Yurtiçi Kargo',
  cargoCode: 'YK-482910',
  warrantyDays: 90,
  monthlyFee: 2990,
  terms: '1. 30 gün içinde teslim alınmayan cihazlardan firmamız sorumlu değildir.\n2. Sıvı temaslı cihazlarda anakart garantisi verilmemektedir.\n3. Değiştirilen parçalar 90 gün garantilidir.',
  subscriptionStatus: 'active',
  subscriptionPlan: 'pro',
  subscriptionEndDate: '2027-12-31',
  createdAt: '2026-01-01T00:00:00Z',
  description: 'İstanbul Kadıköy\'de 10 yılı aşkın tecrübesiyle telefon, tablet ve bilgisayar onarımında uzmanlaşmış yetkili teknik servis merkeziyiz. Apple, Samsung, Huawei ve tüm markalarda profesyonel onarım hizmeti sunuyoruz.',
  shortDescription: 'Profesyonel Cihaz Onarım & Teknik Servis',
  city: 'İstanbul',
  district: 'Kadıköy',
  workingHours: 'Pzt-Cum: 09:00-19:00, Cmt: 10:00-17:00',
  theme: {
    primaryColor: '#0071e3',
    secondaryColor: '#34c759',
    accentColor: '#5e5ce6',
    gradientFrom: '#0071e3',
    gradientTo: '#5e5ce6',
    darkMode: true,
  },
  services: ['Telefon Ekran Değişimi', 'Batarya Değişimi', 'Anakart Tamiri', 'Yazılım Güncelleme', 'Tablet Onarımı', 'Laptop Tamiri'],
  deviceBrands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo'],
  socialMedia: {
    instagram: 'teknikpro_servis',
    whatsapp: '905001234567',
  },
  mediaEnabled: true,
  mediaTitle: 'Atölyemiz & Dükkanımızdan Kareler',
  mediaDescription: 'Modern laboratuvar ekipmanlarımız, temiz çalışma ortamımız ve orijinal yedek parça stoğumuz ile hizmetinizdeyiz.',
  mediaItems: [
    {
      id: 'media-1',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
      title: 'Teknik Servis Laboratuvarımız',
      category: 'Dükkan & Atölye',
    },
    {
      id: 'media-2',
      url: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=900&q=80',
      title: 'Mikroskop Altında Hassas Anakart Onarımı',
      category: 'Onarım',
    },
    {
      id: 'media-3',
      url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=900&q=80',
      title: 'Ekran ve Batarya Değişim İstasyonu',
      category: 'Onarım',
    },
    {
      id: 'media-4',
      url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=900&q=80',
      title: 'Uzman Teknisyen Ekibimiz',
      category: 'Dükkan & Atölye',
    },
    {
      id: 'media-5',
      url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
      title: 'Geniş Orijinal Yedek Parça Stoğu',
      category: 'Ürünler',
    },
    {
      id: 'media-6',
      url: 'https://images.unsplash.com/photo-1517430816045-df4b7de81a30?auto=format&fit=crop&w=900&q=80',
      title: 'Hızlı Test ve Müşteri Teslimat Alanı',
      category: 'Dükkan & Atölye',
    },
  ],
};

export const INITIAL_TENANTS: Tenant[] = [
  DEFAULT_TENANT,
  {
    id: 'tenant-kadikoy',
    slug: 'kadikoy-cep',
    name: 'Kadıköy Cep Servisi',
    brandName: 'Kadıköy Cep',
    phone: '0216 333 4455',
    email: 'info@kadikoycep.com',
    loginEmail: 'kadikoycep@teknikpro.com',
    password: 'Kadikoy2026!',
    address: 'Moda Cad. No: 18, Kadıköy, İstanbul',
    cargoCompany: 'Aras Kargo',
    cargoCode: 'AR-9921',
    warrantyDays: 90,
    monthlyFee: 2990,
    subscriptionStatus: 'active',
    subscriptionPlan: 'pro',
    subscriptionEndDate: '2027-06-30',
    createdAt: '2026-02-01T00:00:00Z',
    description: 'Kadıköy Moda\'da hizmet veren cep telefonu ve tablet onarım merkezi. Hızlı ve güvenilir servis anlayışımızla müşterilerimize en iyi deneyimi sunuyoruz.',
    shortDescription: 'Hızlı & Güvenilir Cep Telefonu Servisi',
    city: 'İstanbul',
    district: 'Kadıköy',
    workingHours: 'Pzt-Cum: 09:30-19:00, Cmt: 10:00-16:00',
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#fb923c',
      accentColor: '#ea580c',
      gradientFrom: '#f97316',
      gradientTo: '#ef4444',
      darkMode: true,
    },
    services: ['Ekran Değişimi', 'Batarya Değişimi', 'Şarj Soketi Tamiri', 'Kamera Değişimi', 'Su Hasarı Onarımı'],
    deviceBrands: ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Realme'],
    socialMedia: {
      instagram: 'kadikoycep',
      whatsapp: '902163334455',
    },
  },
  {
    id: 'tenant-bursa',
    slug: 'bursa-bilisim',
    name: 'Bursa Bilişim & Donanım',
    brandName: 'Bursa Bilişim',
    phone: '0224 444 8899',
    email: 'destek@bursabilisim.com',
    loginEmail: 'bursabilisim@teknikpro.com',
    password: 'Bursa2026!',
    address: 'FSM Bulvarı No: 55, Nilüfer, Bursa',
    cargoCompany: 'MNG Kargo',
    cargoCode: 'MNG-7731',
    warrantyDays: 180,
    monthlyFee: 4990,
    subscriptionStatus: 'active',
    subscriptionPlan: 'enterprise',
    subscriptionEndDate: '2027-09-15',
    createdAt: '2026-02-15T00:00:00Z',
    description: 'Bursa Nilüfer\'de bilişim ve donanım alanında 15 yıllık deneyimiyle hizmet veren kurumsal teknik servis merkezi. Bireysel ve kurumsal müşterilerimize bilgisayar, sunucu ve ağ altyapısı desteği sunuyoruz.',
    shortDescription: 'Kurumsal Bilişim & Donanım Çözümleri',
    city: 'Bursa',
    district: 'Nilüfer',
    workingHours: 'Pzt-Cum: 08:30-18:30, Cmt: 09:00-14:00',
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#a78bfa',
      accentColor: '#7c3aed',
      gradientFrom: '#8b5cf6',
      gradientTo: '#ec4899',
      darkMode: true,
    },
    services: ['Bilgisayar Tamiri', 'Sunucu Kurulumu', 'Ağ Altyapısı', 'Veri Kurtarma', 'Yazılım Desteği', 'Güvenlik Kamerası'],
    deviceBrands: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'MSI'],
    socialMedia: {
      instagram: 'bursabilisim',
      facebook: 'bursabilisim',
      whatsapp: '902244448899',
    },
  },
];

interface TenantState {
  currentTenant: Tenant;
  tenants: Tenant[];
  setCurrentTenant: (tenant: Tenant) => void;
  updateCurrentTenant: (updates: Partial<Tenant>) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  switchTenantBySlug: (slug: string) => boolean;
  createTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => Promise<Tenant>;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => {
      // Canlı Firestore dinleyicisi
      try {
        const tenantsCol = collection(db, 'tenants');
        onSnapshot(tenantsCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Tenant[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as Tenant);
            });
            set({ tenants: list });

            // Mevcut tenant güncellenmişse senkronize et
            const cur = get().currentTenant;
            const updatedCur = list.find((t) => t.id === cur.id || t.slug === cur.slug);
            if (updatedCur) {
              set({ currentTenant: updatedCur });
            }
          }
        }, (err) => {
          console.debug('Firestore tenants listener debug:', err);
        });
      } catch (err) {
        console.debug('Firestore tenants init catch:', err);
      }

      return {
        currentTenant: DEFAULT_TENANT,
        tenants: INITIAL_TENANTS,

        setCurrentTenant: (tenant) => {
          set({ currentTenant: tenant });
        },

        updateCurrentTenant: async (updates) => {
          const current = get().currentTenant;
          const updatedTenant: Tenant = {
            ...current,
            ...updates,
          };

          // Yerel state güncelle
          set({
            currentTenant: updatedTenant,
            tenants: get().tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)),
          });

          // Firestore'a güvenli kaydet
          try {
            const sanitized = JSON.parse(JSON.stringify(updatedTenant, (_, v) => (v === undefined ? null : v)));
            await setDoc(doc(db, 'tenants', updatedTenant.id), sanitized);
          } catch (err) {
            console.warn('Tenant Firestore save error:', err);
          }
        },

        updateTenant: async (id, updates) => {
          const target = get().tenants.find((t) => t.id === id);
          if (!target) return;
          const updatedTenant: Tenant = { ...target, ...updates };

          set({
            currentTenant: get().currentTenant.id === id ? updatedTenant : get().currentTenant,
            tenants: get().tenants.map((t) => (t.id === id ? updatedTenant : t)),
          });

          try {
            const sanitized = JSON.parse(JSON.stringify(updatedTenant, (_, v) => (v === undefined ? null : v)));
            await setDoc(doc(db, 'tenants', id), sanitized);
          } catch (err) {
            console.warn('Tenant Firestore save error:', err);
          }
        },

        switchTenantBySlug: (slug) => {
          const clean = slug.trim().toLowerCase();
          const found = get().tenants.find((t) => t.slug.toLowerCase() === clean);
          if (found) {
            set({ currentTenant: found });
            return true;
          }
          return false;
        },

        createTenant: async (data) => {
          const id = `tenant-${Date.now()}`;
          const newTenant: Tenant = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            tenants: [...state.tenants, newTenant],
          }));

          try {
            const sanitized = JSON.parse(JSON.stringify(newTenant, (_, v) => (v === undefined ? null : v)));
            await setDoc(doc(db, 'tenants', id), sanitized);
          } catch (err) {
            console.warn('New tenant Firestore save error:', err);
          }

          return newTenant;
        },
      };
    },
    {
      name: 'teknikpro-tenant-storage',
    }
  )
);
