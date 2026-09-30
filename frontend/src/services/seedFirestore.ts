import { doc, getDocs, collection, writeBatch, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  INITIAL_SERVICES,
  INITIAL_CUSTOMERS,
  INITIAL_STOCK,
  INITIAL_TRANSACTIONS,
} from './seedData';
import { DEFAULT_TENANT, INITIAL_TENANTS } from '../store/tenantStore';

// Helper to remove undefined for Firestore compatibility
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Firestore emülatör veya veritabanı boş ise
 * seed verilerini (önceki servisler, müşteriler, stok, kasa, tenant) Firestore'a yazar.
 */
export async function seedFirestoreIfEmpty() {
  try {
    // 0. Tenant kontrolü
    const tenantsSnap = await getDocs(collection(db, 'tenants'));
    if (tenantsSnap.empty) {
      for (const t of INITIAL_TENANTS) {
        await setDoc(doc(db, 'tenants', t.id), sanitize(t));
      }
    }

    const servicesSnap = await getDocs(collection(db, 'services'));
    
    // Eğer Firestore'da hiç servis yoksa veya seed kayıtları eksikse yükle
    if (servicesSnap.empty) {
      console.log('🌱 Firestore boş tespit edildi, başlangıç verileri Firestore\'a yükleniyor...');
      
      const batch = writeBatch(db);

      // 1. Müşteriler
      for (const cust of INITIAL_CUSTOMERS) {
        const custRef = doc(db, 'customers', cust.id);
        batch.set(custRef, sanitize(cust));
      }

      // 2. Servis Kayıtları
      for (const srv of INITIAL_SERVICES) {
        const srvRef = doc(db, 'services', srv.id);
        batch.set(srvRef, sanitize(srv));
      }

      // 3. Stok Öğeleri
      for (const item of INITIAL_STOCK) {
        const stockRef = doc(db, 'stock', item.id);
        batch.set(stockRef, sanitize(item));
      }

      // 4. Kasa Hareketleri
      for (const tx of INITIAL_TRANSACTIONS) {
        const txRef = doc(db, 'cashTransactions', tx.id);
        batch.set(txRef, sanitize(tx));
      }

      await batch.commit();
      console.log('✅ Firestore seed verileri başarıyla Firestore\'a kaydedildi!');
    } else {
      console.log(`ℹ️ Firestore'da zaten ${servicesSnap.size} servis kaydı mevcut.`);
    }
  } catch (err) {
    console.warn('Firestore seed işlemi esnasında hata/bağlantı uyarısı:', err);
  }
}
