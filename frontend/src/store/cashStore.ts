import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CashTransaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../services/seedData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useTenantStore } from './tenantStore';

interface CashState {
  transactions: CashTransaction[];
  addTransaction: (tx: Omit<CashTransaction, 'id'>) => CashTransaction;
}

export const useCashStore = create<CashState>()(
  persist(
    (set, get) => {
      // Firebase Firestore dinleyici
      try {
        const txCol = collection(db, 'transactions');
        onSnapshot(txCol, (snapshot) => {
          if (!snapshot.empty) {
            const firebaseTx: CashTransaction[] = [];
            snapshot.forEach((docSnap) => {
              firebaseTx.push(docSnap.data() as CashTransaction);
            });
            firebaseTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            set({ transactions: firebaseTx });
          }
        }, (err) => {
          console.debug('Firestore cash listener error:', err);
        });
      } catch (err) {
        console.debug('Firestore init error:', err);
      }

      return {
        transactions: INITIAL_TRANSACTIONS,

        addTransaction: (data) => {
          const id = `tx-${Date.now()}`;
          const currentTenantId = (data as any).tenantId || useTenantStore.getState().currentTenant.id;
          const newTx: CashTransaction = {
            ...data,
            id,
            tenantId: currentTenantId,
          };

          set((state) => ({
            transactions: [newTx, ...state.transactions],
          }));

          try {
            const sanitized = JSON.parse(JSON.stringify(newTx, (_, v) => (v === undefined ? null : v)));
            setDoc(doc(db, 'transactions', id), sanitized).catch((err) => {
              console.error('Firestore transaction save error:', err);
            });
          } catch (e) {
            console.error('Sanitize error:', e);
          }

          return newTx;
        },
      };
    },
    {
      name: 'teknikpro-cash-storage',
    }
  )
);
