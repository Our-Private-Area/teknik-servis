import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlatformTransaction } from '../types';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const INITIAL_PLATFORM_TRANSACTIONS: PlatformTransaction[] = [
  {
    id: 'ptx-1',
    type: 'income',
    category: 'Abonelik Tahsilatı',
    amount: 2990,
    tenantId: 'demo-servis',
    tenantName: 'TeknikPro Yetkili Servis',
    description: 'Pro Paket - 1 Aylık Yazılım Lisans Bedeli',
    date: '2026-09-01T10:00:00Z',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ptx-2',
    type: 'income',
    category: 'Abonelik Tahsilatı',
    amount: 1490,
    tenantId: 'tenant-kaya',
    tenantName: 'Kaya İletişim & Servis',
    description: 'Starter Paket - 1 Aylık Lisans',
    date: '2026-09-15T14:30:00Z',
    createdAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 'ptx-3',
    type: 'expense',
    category: 'Sunucu / Cloud VPS',
    amount: 450,
    description: 'Hetzner Cloud VPS (API & Veritabanı Sunucusu)',
    date: '2026-09-05T09:00:00Z',
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 'ptx-4',
    type: 'expense',
    category: 'SMS & Bildirim Altyapısı',
    amount: 320,
    description: 'Netgsm SMS API Kredisi (Servis bildirim SMS paketi)',
    date: '2026-09-10T11:00:00Z',
    createdAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'ptx-5',
    type: 'expense',
    category: 'Alan Adı & SSL',
    amount: 180,
    description: 'Cloudflare Pro & Domain Yenileme',
    date: '2026-08-20T16:00:00Z',
    createdAt: '2026-08-20T16:00:00Z',
  },
];

interface PlatformState {
  transactions: PlatformTransaction[];
  addTransaction: (tx: Omit<PlatformTransaction, 'id' | 'createdAt'>) => Promise<PlatformTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => {
      // Canlı Firestore dinleyicisi
      try {
        const ptxCol = collection(db, 'platformTransactions');
        onSnapshot(ptxCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: PlatformTransaction[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as PlatformTransaction);
            });
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            set({ transactions: list });
          }
        }, (err) => {
          console.debug('Firestore platform transactions listener debug:', err);
        });
      } catch (err) {
        console.debug('Firestore platform transactions catch:', err);
      }

      return {
        transactions: INITIAL_PLATFORM_TRANSACTIONS,

        addTransaction: async (data) => {
          const id = `ptx-${Date.now()}`;
          const newTx: PlatformTransaction = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            transactions: [newTx, ...state.transactions],
          }));

          try {
            const sanitized = JSON.parse(JSON.stringify(newTx, (_, v) => (v === undefined ? null : v)));
            await setDoc(doc(db, 'platformTransactions', id), sanitized);
          } catch (err) {
            console.warn('Platform transaction save error:', err);
          }

          return newTx;
        },

        deleteTransaction: async (id) => {
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));

          try {
            await deleteDoc(doc(db, 'platformTransactions', id));
          } catch (err) {
            console.warn('Platform transaction delete error:', err);
          }
        },
      };
    },
    {
      name: 'teknikpro-platform-storage',
    }
  )
);
