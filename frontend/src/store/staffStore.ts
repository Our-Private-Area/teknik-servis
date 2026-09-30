import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StaffMember } from '../types';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useTenantStore } from './tenantStore';

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    tenantId: 'tenant-default',
    name: 'Murat Usta',
    role: 'Kıdemli Atölye Şefi / Teknisyen',
    phone: '0532 999 1122',
    email: 'murat.usta@teknikpro.com',
    specialty: 'Anakart Onarımı, BGA & Mikrolehim, Apple Uzmanı',
    activeRepairs: 4,
    rating: '4.9/5',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'staff-2',
    tenantId: 'tenant-default',
    name: 'Can Teknisyen',
    role: 'Donanım & Parça Teknisyeni',
    phone: '0544 888 2233',
    email: 'can@teknikpro.com',
    specialty: 'Ekran, Batarya, Şarj Soketi & Kasa Değişimi',
    activeRepairs: 2,
    rating: '4.8/5',
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'staff-3',
    tenantId: 'tenant-default',
    name: 'Selin Personel',
    role: 'Müşteri Kabul & Servis Danışmanı',
    phone: '0555 777 3344',
    email: 'selin@teknikpro.com',
    specialty: 'Cihaz Kabul, Müşteri İletişimi, Ön Teşhis',
    activeRepairs: 0,
    rating: '5.0/5',
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'staff-kadikoy-1',
    tenantId: 'tenant-kadikoy',
    name: 'Burak Demir',
    role: 'Mobil Cihaz Baş Teknisyeni',
    phone: '0530 123 4567',
    email: 'burak@kadikoycep.com',
    specialty: 'iPhone & iPad Onarımları, Ekran Değişimi',
    activeRepairs: 3,
    rating: '4.9/5',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'staff-bursa-1',
    tenantId: 'tenant-bursa',
    name: 'Emre Yıldız',
    role: 'Laptop & Bilgisayar Uzmanı',
    phone: '0542 987 6543',
    email: 'emre@bursabilisim.com',
    specialty: 'Laptop Anakart, Ekran Kartı Reballing',
    activeRepairs: 1,
    rating: '4.7/5',
    createdAt: '2026-02-15T10:00:00Z',
  },
];

interface StaffState {
  staffMembers: StaffMember[];
  addStaff: (data: Omit<StaffMember, 'id' | 'createdAt'>) => Promise<StaffMember>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => {
      try {
        const staffCol = collection(db, 'staff');
        onSnapshot(staffCol, (snapshot) => {
          if (!snapshot.empty) {
            const firebaseStaff: StaffMember[] = [];
            snapshot.forEach((docSnap) => {
              firebaseStaff.push(docSnap.data() as StaffMember);
            });
            set({ staffMembers: firebaseStaff });
          }
        }, (err) => {
          console.debug('Firestore staff listener error:', err);
        });
      } catch (err) {
        console.debug('Firestore staff init error:', err);
      }

      return {
        staffMembers: INITIAL_STAFF,

        addStaff: async (data) => {
          const id = `staff-${Date.now()}`;
          const currentTenantId = (data as any).tenantId || useTenantStore.getState().currentTenant.id;
          const newStaff: StaffMember = {
            ...data,
            id,
            tenantId: currentTenantId,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            staffMembers: [newStaff, ...state.staffMembers],
          }));

          try {
            const sanitized = JSON.parse(JSON.stringify(newStaff, (_, v) => (v === undefined ? null : v)));
            await setDoc(doc(db, 'staff', id), sanitized);
          } catch (e) {
            console.error('Firestore addStaff error:', e);
          }

          return newStaff;
        },

        updateStaff: async (id, updates) => {
          set((state) => ({
            staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          }));

          try {
            const item = get().staffMembers.find((s) => s.id === id);
            if (item) {
              const sanitized = JSON.parse(JSON.stringify(item, (_, v) => (v === undefined ? null : v)));
              await setDoc(doc(db, 'staff', id), sanitized, { merge: true });
            }
          } catch (e) {
            console.error('Firestore updateStaff error:', e);
          }
        },

        deleteStaff: async (id) => {
          set((state) => ({
            staffMembers: state.staffMembers.filter((s) => s.id !== id),
          }));

          try {
            await deleteDoc(doc(db, 'staff', id));
          } catch (e) {
            console.error('Firestore deleteStaff error:', e);
          }
        },
      };
    },
    {
      name: 'teknikpro-staff-storage',
    }
  )
);
