import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StockItem } from '../types';
import { INITIAL_STOCK } from '../services/seedData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import { useTenantStore } from './tenantStore';

interface StockState {
  items: StockItem[];
  addItem: (item: Omit<StockItem, 'id' | 'createdAt'>) => StockItem;
  updateItem: (id: string, updates: Partial<StockItem>) => void;
  deleteItem: (id: string) => void;
  adjustQuantity: (id: string, delta: number) => void;
}

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => {
      // Firebase Firestore dinleyici
      try {
        const stockCol = collection(db, 'stock');
        onSnapshot(stockCol, (snapshot) => {
          if (!snapshot.empty) {
            const firebaseItems: StockItem[] = [];
            snapshot.forEach((docSnap) => {
              firebaseItems.push(docSnap.data() as StockItem);
            });
            set({ items: firebaseItems });
          }
        }, (err) => {
          console.debug('Firestore stock listener error:', err);
        });
      } catch (err) {
        console.debug('Firestore init error:', err);
      }

      return {
        items: INITIAL_STOCK,

        addItem: (data) => {
          const id = `stk-${Date.now()}`;
          const currentTenantId = (data as any).tenantId || useTenantStore.getState().currentTenant.id;
          const newItem: StockItem = {
            ...data,
            id,
            tenantId: currentTenantId,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            items: [newItem, ...state.items],
          }));

          try {
            const sanitized = JSON.parse(JSON.stringify(newItem, (_, v) => (v === undefined ? null : v)));
            setDoc(doc(db, 'stock', id), sanitized).catch((err) => {
              console.warn('Firestore stock save error:', err);
            });
          } catch (err) {
            console.warn('Firestore stock setDoc catch:', err);
          }

          return newItem;
        },

        updateItem: (id, updates) => {
          const existing = get().items.find((i) => i.id === id);
          if (!existing) return;
          const updated = { ...existing, ...updates };

          set((state) => ({
            items: state.items.map((i) => (i.id === id ? updated : i)),
          }));

          setDoc(doc(db, 'stock', id), updated).catch((err) => {
            console.error('Firestore stock update error:', err);
          });
        },

        deleteItem: (id) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          }));

          deleteDoc(doc(db, 'stock', id)).catch((err) => {
            console.error('Firestore stock delete error:', err);
          });
        },

        adjustQuantity: (id, delta) => {
          const existing = get().items.find((i) => i.id === id);
          if (!existing) return;
          const newQty = Math.max(0, existing.quantity + delta);
          const updated = { ...existing, quantity: newQty };

          set((state) => ({
            items: state.items.map((i) => (i.id === id ? updated : i)),
          }));

          setDoc(doc(db, 'stock', id), updated).catch((err) => {
            console.error('Firestore stock quantity adjust error:', err);
          });
        },
      };
    },
    {
      name: 'teknikpro-stock-storage',
    }
  )
);
