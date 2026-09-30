import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServiceRecord, ServiceStatus, ServiceNote } from '../types';
import { INITIAL_SERVICES } from '../services/seedData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import { useTenantStore } from './tenantStore';

interface ServiceState {
  services: ServiceRecord[];
  getServiceById: (id: string) => ServiceRecord | undefined;
  getServiceByTrackingNo: (trackingNo: string) => ServiceRecord | undefined;
  addService: (service: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt' | 'trackingNo' | 'statusHistory' | 'notes' | 'status'> & { status?: ServiceStatus }) => ServiceRecord;
  updateServiceStatus: (id: string, newStatus: ServiceStatus, note?: string, updatedBy?: string) => void;
  addServiceNote: (serviceId: string, note: Omit<ServiceNote, 'id' | 'createdAt'>) => void;
  updateService: (id: string, updates: Partial<ServiceRecord>) => void;
  deleteService: (id: string) => void;
  searchServices: (query: string) => ServiceRecord[];
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => {
      // Firebase Firestore'dan canlı dinleyici başlat
      try {
        const servicesCol = collection(db, 'services');
        onSnapshot(servicesCol, (snapshot) => {
          if (!snapshot.empty) {
            const firebaseServices: ServiceRecord[] = [];
            snapshot.forEach((docSnap) => {
              firebaseServices.push(docSnap.data() as ServiceRecord);
            });
            // Tarihe göre sıralı
            firebaseServices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            set({ services: firebaseServices });
          }
        }, (err) => {
          console.debug('Firestore services listener offline or connecting:', err);
        });
      } catch (err) {
        console.debug('Firestore initialization catch:', err);
      }

      return {
        services: INITIAL_SERVICES,

        getServiceById: (id) => {
          return get().services.find((s) => s.id === id);
        },

        getServiceByTrackingNo: (trackingNo) => {
          const clean = trackingNo.trim().toUpperCase();
          return get().services.find(
            (s) => s.trackingNo.toUpperCase() === clean || s.trackingNo.replace(/-/g, '').toUpperCase() === clean.replace(/-/g, '')
          );
        },

        addService: (newServiceData) => {
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const trackingNo = (newServiceData as any).trackingNo || `TK-2026-${randomNum}`;
          const now = new Date().toISOString();
          const id = `srv-${Date.now()}`;

          const initialNote = newServiceData.isOnlineBooking
            ? `Online randevu talebi oluşturuldu. Teslimat: ${newServiceData.deliveryMethod === 'cargo' ? 'Kargo ile Gönderim' : 'Elden Teslim'}${newServiceData.preferredAppointmentDate ? ` (Tercih: ${newServiceData.preferredAppointmentDate})` : ''}`
            : 'Cihaz servise teslim alındı ve kaydı açıldı.';

          const currentTenantId = (newServiceData as any).tenantId || useTenantStore.getState().currentTenant.id;

          const newService: ServiceRecord = {
            ...newServiceData,
            id,
            tenantId: currentTenantId,
            trackingNo,
            status: newServiceData.status || 'received',
            notes: [],
            statusHistory: [
              {
                status: newServiceData.status || 'received',
                note: initialNote,
                updatedBy: newServiceData.isOnlineBooking ? 'Müşteri (Web)' : 'Sistem',
                timestamp: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
          };

          // Yerel state güncelle
          set((state) => ({
            services: [newService, ...state.services],
          }));

          // Firestore'a güvenli ve undefined içermeyen veri yaz
          try {
            const sanitized = JSON.parse(JSON.stringify(newService, (_, v) => (v === undefined ? null : v)));
            setDoc(doc(db, 'services', id), sanitized).catch((err) => {
              console.warn('Firestore service sync error:', err);
            });
          } catch (err) {
            console.warn('Firestore setDoc catch:', err);
          }

          return newService;
        },

        updateServiceStatus: (id, newStatus, note, updatedBy = 'Teknisyen') => {
          const now = new Date().toISOString();
          const currentService = get().services.find((s) => s.id === id);
          if (!currentService) return;

          const newHistoryItem = {
            status: newStatus,
            note: note || `Durum güncellendi: ${newStatus}`,
            updatedBy,
            timestamp: now,
          };

          const updatedService: ServiceRecord = {
            ...currentService,
            status: newStatus,
            statusHistory: [...(currentService.statusHistory || []), newHistoryItem],
            updatedAt: now,
          };

          if (newStatus === 'ready' && !currentService.completedDate) {
            updatedService.completedDate = now;
          }
          if (newStatus === 'delivered' && !currentService.deliveredDate) {
            updatedService.deliveredDate = now;
          }

          set((state) => ({
            services: state.services.map((s) => (s.id === id ? updatedService : s)),
          }));

          // Firestore güncelle
          setDoc(doc(db, 'services', id), updatedService).catch((err) => {
            console.error('Firestore status update error:', err);
          });
        },

        addServiceNote: (serviceId, noteData) => {
          const now = new Date().toISOString();
          const currentService = get().services.find((s) => s.id === serviceId);
          if (!currentService) return;

          const newNote: ServiceNote = {
            id: `note-${Date.now()}`,
            ...noteData,
            createdAt: now,
          };

          const updatedService: ServiceRecord = {
            ...currentService,
            notes: [...(currentService.notes || []), newNote],
            updatedAt: now,
          };

          set((state) => ({
            services: state.services.map((s) => (s.id === serviceId ? updatedService : s)),
          }));

          setDoc(doc(db, 'services', serviceId), updatedService).catch((err) => {
            console.error('Firestore note update error:', err);
          });
        },

        updateService: (id, updates) => {
          const now = new Date().toISOString();
          const currentService = get().services.find((s) => s.id === id);
          if (!currentService) return;

          const updatedService: ServiceRecord = {
            ...currentService,
            ...updates,
            updatedAt: now,
          };

          set((state) => ({
            services: state.services.map((s) => (s.id === id ? updatedService : s)),
          }));

          setDoc(doc(db, 'services', id), updatedService).catch((err) => {
            console.error('Firestore service update error:', err);
          });
        },

        deleteService: (id) => {
          set((state) => ({
            services: state.services.filter((s) => s.id !== id),
          }));

          deleteDoc(doc(db, 'services', id)).catch((err) => {
            console.error('Firestore service delete error:', err);
          });
        },

        searchServices: (query) => {
          if (!query.trim()) return get().services;
          const q = query.toLowerCase();
          return get().services.filter(
            (s) =>
              s.trackingNo.toLowerCase().includes(q) ||
              s.customerName?.toLowerCase().includes(q) ||
              s.deviceBrand.toLowerCase().includes(q) ||
              s.deviceModel.toLowerCase().includes(q) ||
              s.imei?.toLowerCase().includes(q) ||
              s.serialNo?.toLowerCase().includes(q)
          );
        },
      };
    },
    {
      name: 'teknikpro-services-storage',
    }
  )
);
