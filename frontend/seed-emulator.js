import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, writeBatch } from 'firebase/firestore';
import { readFile } from 'fs/promises';

const firebaseConfig = {
  apiKey: "demo-teknikpro-api-key",
  authDomain: "demo-no-project.firebaseapp.com",
  projectId: "demo-no-project",
  storageBucket: "demo-no-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

console.log('Connecting to Firestore emulator at localhost:8080...');

// Helper to remove undefined
function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

async function run() {
  // Read seedData.ts as text and extract JSON or use hardcoded minimal list
  // Let's create the batch
  const batch = writeBatch(db);

  // Seed customers
  const customers = [
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
    },
  ];

  for (const c of customers) {
    batch.set(doc(db, 'customers', c.id), sanitize(c));
  }

  // Seed services
  const services = [
    {
      id: 'srv-101',
      trackingNo: 'TK-2026-8492',
      customerId: 'cust-1',
      customerName: 'Ahmet Yılmaz',
      assignedStaffId: 'staff-1',
      assignedStaffName: 'Murat Usta (Kıdemli Teknisyen)',
      deviceType: 'Telefon',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 15 Pro Max',
      serialNo: 'F2LZX90P0Q',
      imei: '354890123456789',
      complaint: 'Cihaz yere düştü, ekran kırıldı ve dokunmatik üst kısımda algılamıyor. Arka camda da çatlak var.',
      diagnosis: 'OLED ekran modülü hasarlı, iç flex kabloda zedelenme tespit edildi. FaceID sensörü sağlam. Batarya sağlığı %91.',
      performedWork: 'Orijinal servis ekranı montajı yapıldı. TrueTone ve FaceID kalibrasyonu tamamlandı. Kasa temizliği ve su geçirmezlik contası yenilendi.',
      status: 'in_repair',
      priority: 'urgent',
      estimatedCost: 7500,
      laborCost: 1500,
      partsCost: 6000,
      totalCost: 7500,
      paidAmount: 2000,
      remainingAmount: 5500,
      paymentStatus: 'partial',
      isWarranty: false,
      accessoriesReceived: ['Orijinal Kutu', 'MagSafe Kılıf'],
      physicalCondition: 'Köşelerde hafif darbe izleri, arka camda ince kılcal çatlak.',
      notes: [],
      statusHistory: [
        {
          status: 'received',
          note: 'Cihaz teslim alındı.',
          updatedBy: 'Sistem',
          timestamp: '2026-09-26T10:00:00Z',
        },
      ],
      receivedDate: '2026-09-26T10:00:00Z',
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    },
    {
      id: 'srv-102',
      trackingNo: 'TK-2026-3105',
      customerId: 'cust-2',
      customerName: 'Fatma Demir',
      assignedStaffId: 'staff-2',
      assignedStaffName: 'Can Teknisyen',
      deviceType: 'Telefon',
      deviceBrand: 'Samsung',
      deviceModel: 'Galaxy S24 Ultra',
      serialNo: 'R5CW30AB12X',
      complaint: 'Cihaz şarj almıyor, kablo oynayınca temassızlık yapıyor.',
      diagnosis: 'Type-C şarj soketinde nem ve toz birikmesi sonucu pinlerde oksitlenme.',
      performedWork: 'Orijinal sub-board şarj soketi modülü değiştirildi. Hızlı şarj (45W) testi başarılı.',
      status: 'ready',
      priority: 'normal',
      estimatedCost: 1850,
      laborCost: 650,
      partsCost: 1200,
      totalCost: 1850,
      paidAmount: 1000,
      remainingAmount: 850,
      paymentStatus: 'partial',
      isWarranty: true,
      accessoriesReceived: ['S-Pen'],
      physicalCondition: 'Kusursuz, kılıf ve ekran koruyucu ile kullanılmış.',
      notes: [],
      statusHistory: [
        {
          status: 'received',
          note: 'Cihaz teslim alındı.',
          updatedBy: 'Sistem',
          timestamp: '2026-09-25T11:00:00Z',
        },
      ],
      receivedDate: '2026-09-25T11:00:00Z',
      createdAt: '2026-09-25T11:00:00Z',
      updatedAt: '2026-09-27T16:00:00Z',
    },
    {
      id: 'srv-103',
      trackingNo: 'TK-2026-9041',
      customerId: 'cust-3',
      customerName: 'Mehmet Kaya',
      assignedStaffId: 'staff-1',
      assignedStaffName: 'Murat Usta',
      deviceType: 'Laptop',
      deviceBrand: 'Apple',
      deviceModel: 'MacBook Pro 16" M3 Max',
      serialNo: 'C02ZX119M3M',
      complaint: 'Klavyeye az miktarda kahve döküldü. Boşluk tuşu ve N tuşu basılı kalıyor.',
      diagnosis: 'Anakartta klavye flexi çevresinde korozyon başlangıcı.',
      performedWork: 'Ultrasonik anakart kimyasal temizliği ve fırınlama yapıldı.',
      status: 'waiting_parts',
      priority: 'urgent',
      estimatedCost: 14200,
      laborCost: 3200,
      partsCost: 11000,
      totalCost: 14200,
      paidAmount: 14200,
      remainingAmount: 0,
      paymentStatus: 'paid',
      isWarranty: false,
      accessoriesReceived: ['Orijinal 140W Şarj Adaptörü', 'Magsafe 3 Kablo'],
      notes: [],
      statusHistory: [
        {
          status: 'received',
          note: 'Cihaz kabul edildi.',
          updatedBy: 'Selin Personel',
          timestamp: '2026-09-24T15:20:00Z',
        },
      ],
      receivedDate: '2026-09-24T15:20:00Z',
      createdAt: '2026-09-24T15:20:00Z',
      updatedAt: '2026-09-25T10:15:00Z',
    },
    {
      id: 'srv-104',
      trackingNo: 'TK-2026-5520',
      customerId: 'cust-4',
      customerName: 'Ayşe Çelik',
      assignedStaffId: 'staff-2',
      assignedStaffName: 'Can Teknisyen',
      deviceType: 'Tablet',
      deviceBrand: 'Apple',
      deviceModel: 'iPad Air 5. Nesil (M1)',
      serialNo: 'DMPY55449A',
      complaint: 'Batarya çok çabuk bitiyor, %30 seviyesinde aniden kapanıyor.',
      diagnosis: 'Batarya sağlığı %62, hücrelerden birinde aşırı voltaj dalgalanması var.',
      performedWork: 'Orijinal pil değişimi yapıldı, şarj döngüsü ve stres testleri uygulandı.',
      status: 'delivered',
      priority: 'normal',
      estimatedCost: 2600,
      laborCost: 800,
      partsCost: 1800,
      totalCost: 2600,
      paidAmount: 2600,
      remainingAmount: 0,
      paymentStatus: 'paid',
      isWarranty: true,
      accessoriesReceived: ['Smart Folio Kılıf'],
      notes: [],
      statusHistory: [
        {
          status: 'delivered',
          note: 'Cihaz test edilerek müşteriye elden teslim edildi.',
          updatedBy: 'Can Teknisyen',
          timestamp: '2026-09-23T17:45:00Z',
        },
      ],
      receivedDate: '2026-09-21T13:30:00Z',
      createdAt: '2026-09-21T13:30:00Z',
      updatedAt: '2026-09-23T17:45:00Z',
    },
  ];

  for (const s of services) {
    batch.set(doc(db, 'services', s.id), sanitize(s));
  }

  // Seed stock
  const stock = [
    {
      id: 'stk-1',
      code: 'EKR-IP15PM-ORG',
      name: 'iPhone 15 Pro Max Orijinal Servis Ekranı',
      category: 'Ekran',
      brand: 'Apple',
      compatibleModels: ['iPhone 15 Pro Max'],
      quantity: 4,
      criticalLevel: 2,
      unit: 'Adet',
      purchasePrice: 4800,
      salePrice: 6000,
      supplier: 'İpek İthalat A.Ş.',
      shelfLocation: 'A-02-14',
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'stk-2',
      code: 'BAT-IP14-ORG',
      name: 'iPhone 14 Orijinal Batarya (3279 mAh)',
      category: 'Batarya',
      brand: 'Apple',
      compatibleModels: ['iPhone 14'],
      quantity: 1,
      criticalLevel: 3,
      unit: 'Adet',
      purchasePrice: 850,
      salePrice: 1500,
      supplier: 'İpek İthalat A.Ş.',
      shelfLocation: 'B-01-05',
      createdAt: '2026-02-01T09:00:00Z',
    },
  ];

  for (const st of stock) {
    batch.set(doc(db, 'stock', st.id), sanitize(st));
  }

  await batch.commit();
  console.log('✅ ALL SEED DATA SUCCESSFULLY WRITTEN TO FIRESTORE EMULATOR!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
