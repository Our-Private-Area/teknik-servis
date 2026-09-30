import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "demo-teknikpro-api-key",
  projectId: "demo-no-project"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

connectFirestoreEmulator(db, '127.0.0.1', 8080);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

const CUSTOMERS = [
  {
    id: 'cust-1',
    fullName: 'Ahmet Yılmaz',
    phone: '0532 555 1020',
    email: 'ahmet.yilmaz@email.com',
    address: 'Kadıköy, İstanbul',
    totalServices: 3,
    balance: 0,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cust-2',
    fullName: 'Fatma Demir',
    phone: '0544 333 4455',
    email: 'fatma.demir@email.com',
    address: 'Çankaya, Ankara',
    totalServices: 1,
    balance: 850,
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'cust-3',
    fullName: 'Mehmet Kaya',
    phone: '0505 888 9900',
    email: 'm.kaya@tekstil.com.tr',
    address: 'Konak, İzmir',
    taxId: '1234567890',
    totalServices: 5,
    balance: 0,
    createdAt: '2025-11-20T09:15:00Z',
  },
  {
    id: 'cust-4',
    fullName: 'Ayşe Çelik',
    phone: '0553 111 2233',
    email: 'ayse.celik@gmail.com',
    address: 'Nilüfer, Bursa',
    totalServices: 2,
    balance: 0,
    createdAt: '2026-03-01T11:45:00Z',
  },
  {
    id: 'cust-5',
    fullName: 'Ali Öztürk',
    phone: '0536 777 4411',
    email: 'ali.ozturk@company.com',
    address: 'Muratpaşa, Antalya',
    totalServices: 1,
    balance: 1400,
    createdAt: '2026-03-18T16:20:00Z',
  }
];

const SERVICES = [
  {
    id: 'srv-101',
    trackingNo: 'TK-2026-8492',
    customerId: 'cust-1',
    customerName: 'Ahmet Yılmaz',
    assignedStaffName: 'Murat Usta',
    deviceType: 'Telefon',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 15 Pro Max',
    serialNo: 'F2LZX90P0Q',
    imei: '354890123456789',
    devicePassword: 'Ekran deseni L şeklinde',
    complaint: 'Cihaz yere düştü, ekran kırıldı ve dokunmatik üst kısımda algılamıyor.',
    diagnosis: 'OLED ekran modülü hasarlı, iç flex kabloda zedelenme tespit edildi.',
    performedWork: 'Orijinal servis ekranı montajı yapıldı. TrueTone kalibrasyonu tamamlandı.',
    status: 'in_repair',
    priority: 'urgent',
    estimatedCost: 7500,
    laborCost: 1500,
    partsCost: 6000,
    totalCost: 7500,
    paidAmount: 2000,
    remainingAmount: 5500,
    paymentStatus: 'partial',
    accessoriesReceived: ['Orijinal Kutu', 'MagSafe Kılıf'],
    physicalCondition: 'Köşelerde hafif darbe izleri, arka camda ince kılcal çatlak.',
    statusHistory: [
      { status: 'received', note: 'Cihaz servis merkezine teslim alındı.', updatedBy: 'Selin Personel', timestamp: '2026-09-26T09:30:00Z' },
      { status: 'in_repair', note: 'Cihaz teknisyene zimmetlendi, arıza tespiti ve ekran değişimi başladı.', updatedBy: 'Murat Usta', timestamp: '2026-09-27T10:00:00Z' }
    ],
    receivedDate: '2026-09-26T09:30:00Z',
    estimatedDeliveryDate: '2026-09-28T17:00:00Z',
    createdAt: '2026-09-26T09:30:00Z'
  },
  {
    id: 'srv-102',
    trackingNo: 'TK-2026-3105',
    customerId: 'cust-2',
    customerName: 'Fatma Demir',
    assignedStaffName: 'Can Teknisyen',
    deviceType: 'Telefon',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S24 Ultra',
    serialNo: 'R5CW109KXX',
    imei: '864210987654321',
    complaint: 'Şarj soketi gevşek, hızlı şarj çalışmıyor ve bazen şarj kesiliyor.',
    diagnosis: 'USB Type-C şarj bordunda sıvı teması ve korozyon tespit edildi.',
    performedWork: 'Orijinal Samsung alt şarj bordu değiştirildi, 45W şarj testi tamamlandı.',
    status: 'ready',
    priority: 'normal',
    estimatedCost: 1850,
    laborCost: 650,
    partsCost: 1200,
    totalCost: 1850,
    paidAmount: 1000,
    remainingAmount: 850,
    paymentStatus: 'partial',
    accessoriesReceived: ['Sadece Cihaz'],
    physicalCondition: 'Temiz, ekranda koruyucu cam mevcut.',
    statusHistory: [
      { status: 'received', note: 'Cihaz kabul edildi.', updatedBy: 'Selin Personel', timestamp: '2026-09-25T11:00:00Z' },
      { status: 'ready', note: 'Cihaz tamiri tamamlandı, müşteriye bildirim gitti.', updatedBy: 'Can Teknisyen', timestamp: '2026-09-27T16:00:00Z' }
    ],
    receivedDate: '2026-09-25T11:00:00Z',
    completedDate: '2026-09-27T16:00:00Z',
    createdAt: '2026-09-25T11:00:00Z'
  },
  {
    id: 'srv-103',
    trackingNo: 'TK-2026-9041',
    customerId: 'cust-3',
    customerName: 'Mehmet Kaya',
    assignedStaffName: 'Murat Usta',
    deviceType: 'Laptop',
    deviceBrand: 'Apple',
    deviceModel: 'MacBook Pro 16" M3 Max',
    complaint: 'Klavyeye az miktarda kahve döküldü. Boşluk tuşu basılı kalıyor.',
    status: 'waiting_parts',
    priority: 'urgent',
    estimatedCost: 14200,
    laborCost: 3200,
    partsCost: 11000,
    totalCost: 14200,
    paidAmount: 14200,
    remainingAmount: 0,
    paymentStatus: 'paid',
    statusHistory: [
      { status: 'received', note: 'Cihaz kabul edildi.', updatedBy: 'Selin Personel', timestamp: '2026-09-24T15:20:00Z' },
      { status: 'waiting_parts', note: 'Klavye top case siparişi verildi.', updatedBy: 'Murat Usta', timestamp: '2026-09-25T10:15:00Z' }
    ],
    receivedDate: '2026-09-24T15:20:00Z',
    createdAt: '2026-09-24T15:20:00Z'
  }
];

const STOCK = [
  {
    id: 'stk-1',
    code: 'STK-SCR-IP15PM',
    name: 'iPhone 15 Pro Max Orijinal Ekran Modülü',
    category: 'Ekran & Dokunmatik',
    brand: 'Apple',
    quantity: 4,
    criticalLevel: 2,
    unit: 'Adet',
    purchasePrice: 4800,
    salePrice: 6500,
    shelfLocation: 'A-12-03'
  },
  {
    id: 'stk-2',
    code: 'STK-BAT-IP13',
    name: 'iPhone 13 Batarya (Yüksek Kapasite)',
    category: 'Batarya & Pil',
    brand: 'Apple',
    quantity: 1,
    criticalLevel: 3,
    unit: 'Adet',
    purchasePrice: 420,
    salePrice: 850,
    shelfLocation: 'B-04-01'
  },
  {
    id: 'stk-3',
    code: 'STK-CHR-SAM-S24U',
    name: 'Samsung Galaxy S24 Ultra Şarj Soket Bordu',
    category: 'Şarj & Flex',
    brand: 'Samsung',
    quantity: 6,
    criticalLevel: 2,
    unit: 'Adet',
    purchasePrice: 650,
    salePrice: 1200,
    shelfLocation: 'C-08-02'
  }
];

const TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'income',
    category: 'Servis Geliri',
    amount: 2000,
    paymentMethod: 'card',
    serviceTrackingNo: 'TK-2026-8492',
    description: 'iPhone 15 Pro Max ekran tamiri ön ödeme',
    date: '2026-09-26T10:00:00Z',
    recordedBy: 'Selin Personel'
  },
  {
    id: 'tx-2',
    type: 'income',
    category: 'Servis Geliri',
    amount: 1000,
    paymentMethod: 'cash',
    serviceTrackingNo: 'TK-2026-3105',
    description: 'Samsung S24 Ultra şarj soketi kapora',
    date: '2026-09-25T11:15:00Z',
    recordedBy: 'Selin Personel'
  },
  {
    id: 'tx-3',
    type: 'expense',
    category: 'Yedek Parça Alımı',
    amount: 4800,
    paymentMethod: 'transfer',
    description: 'İpek İthalat - iPhone ekran siparişi',
    date: '2026-09-23T14:00:00Z',
    recordedBy: 'Admin'
  }
];

async function seed() {
  console.log('🌱 Firestore tohumlama başlıyor...');

  // Customers
  for (const c of CUSTOMERS) {
    await setDoc(doc(db, 'customers', c.id), c);
    console.log(`  ✓ Müşteri eklendi: ${c.fullName}`);
  }

  // Services
  for (const s of SERVICES) {
    await setDoc(doc(db, 'services', s.id), s);
    console.log(`  ✓ Servis kaydı eklendi: ${s.trackingNo} (${s.deviceBrand} ${s.deviceModel})`);
  }

  // Stock
  for (const stk of STOCK) {
    await setDoc(doc(db, 'stock', stk.id), stk);
    console.log(`  ✓ Stok ürünü eklendi: ${stk.name}`);
  }

  // Transactions
  for (const t of TRANSACTIONS) {
    await setDoc(doc(db, 'transactions', t.id), t);
    console.log(`  ✓ Kasa hareketi eklendi: ${t.type === 'income' ? '+' : '-'}₺${t.amount}`);
  }

  // Users in Auth
  console.log('\n🔐 Auth kullanıcıları oluşturuluyor...');
  const users = [
    { email: 'admin@teknikpro.com', pass: 'admin123' },
    { email: 'murat@teknikpro.com', pass: 'tekno123' },
    { email: 'selin@teknikpro.com', pass: 'personel123' }
  ];

  for (const u of users) {
    try {
      await createUserWithEmailAndPassword(auth, u.email, u.pass);
      console.log(`  ✓ Auth kullanıcısı eklendi: ${u.email}`);
    } catch (e) {
      console.log(`  i Auth kullanıcısı zaten mevcut: ${u.email}`);
    }
  }

  console.log('\n🎉 Tüm tablolar ve veriler başarıyla Firebase Emulator\'e yüklendi!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
