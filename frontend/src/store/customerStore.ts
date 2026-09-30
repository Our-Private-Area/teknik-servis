import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../services/seedData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

import { useTenantStore } from './tenantStore';

interface CustomerState {
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'totalServices' | 'balance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  getCustomerById: (id: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => {
      // Firebase Firestore'dan canlı dinleyici başlat
      try {
        const custCol = collection(db, 'customers');
        onSnapshot(custCol, (snapshot) => {
          if (!snapshot.empty) {
            const firebaseCust: Customer[] = [];
            snapshot.forEach((docSnap) => {
              firebaseCust.push(docSnap.data() as Customer);
            });
            set({ customers: firebaseCust });
          }
        }, (err) => {
          console.debug('Firestore customers listener error:', err);
        });
      } catch (err) {
        console.debug('Firestore init error:', err);
      }

      return {
        customers: INITIAL_CUSTOMERS,

        addCustomer: (data) => {
          const id = `cust-${Date.now()}`;
          const currentTenantId = (data as any).tenantId || useTenantStore.getState().currentTenant.id;
          const newCustomer: Customer = {
            ...data,
            id,
            tenantId: currentTenantId,
            totalServices: 0,
            balance: 0,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            customers: [newCustomer, ...state.customers],
          }));

          // Firestore'a güvenli kaydet
          try {
            const sanitized = JSON.parse(JSON.stringify(newCustomer, (_, v) => (v === undefined ? null : v)));
            setDoc(doc(db, 'customers', id), sanitized).catch((err) => {
              console.warn('Firestore customer save error:', err);
            });
          } catch (err) {
            console.warn('Firestore customer setDoc catch:', err);
          }

          return newCustomer;
        },

        updateCustomer: (id, updates) => {
          const existing = get().customers.find((c) => c.id === id);
          if (!existing) return;

          const updated = { ...existing, ...updates };

          set((state) => ({
            customers: state.customers.map((c) => (c.id === id ? updated : c)),
          }));

          setDoc(doc(db, 'customers', id), updated).catch((err) => {
            console.error('Firestore customer update error:', err);
          });
        },

        getCustomerById: (id) => {
          return get().customers.find((c) => c.id === id);
        },
      };
    },
    {
      name: 'teknikpro-customers-storage',
    }
  )
);
