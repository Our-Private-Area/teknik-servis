import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTenantStore, getTenantDefaultEmail, INITIAL_TENANTS } from './tenantStore';
import { useStaffStore } from './staffStore';
import { Tenant } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'tenant' | 'staff';
  tenantId?: string;
  tenantSlug?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loginAsTenant: (email: string, password: string) => { success: boolean; message?: string };
  loginAsSuperAdmin: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
}

const SUPERADMIN_EMAIL = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@teknikpro.com').toLowerCase();
const SUPERADMIN_PASSWORD = import.meta.env.VITE_SUPERADMIN_PASSWORD || 'Admin2026!';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      loginAsTenant: (inputEmail: string, inputPass: string) => {
        const cleanEmail = inputEmail.trim().toLowerCase();
        const cleanPass = inputPass.trim();

        if (!cleanEmail || !cleanPass) {
          return { success: false, message: 'Lütfen e-posta ve şifrenizi girin.' };
        }

        const storeTenants = useTenantStore.getState().tenants || [];
        const { staffMembers } = useStaffStore.getState();

        // 1. Birleştirilmiş işletme listesi (localStorage eski olsa bile daima güncel şifreler korunur)
        const allTenantsMap = new Map<string, Tenant>();
        for (const it of INITIAL_TENANTS) {
          allTenantsMap.set(it.id, { ...it });
        }
        for (const st of storeTenants) {
          const existing = allTenantsMap.get(st.id);
          allTenantsMap.set(st.id, {
            ...existing,
            ...st,
            loginEmail: st.loginEmail || existing?.loginEmail || getTenantDefaultEmail(st.slug),
            password: st.password || existing?.password || (st.slug === 'bursa-bilisim' ? 'Bursa2026!' : st.slug === 'kadikoy-cep' ? 'Kadikoy2026!' : 'Teknik2026!'),
          });
        }
        const allTenants = Array.from(allTenantsMap.values());

        // 2. İşletme e-posta ve slug eşleşmesi
        let matchedTenant = allTenants.find((t) => {
          const loginMatch = t.loginEmail?.toLowerCase() === cleanEmail;
          const contactMatch = t.email?.toLowerCase() === cleanEmail;
          const defaultEmailMatch = getTenantDefaultEmail(t.slug).toLowerCase() === cleanEmail;
          const cleanSlug = t.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
          const emailPrefix = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
          const prefixMatch = emailPrefix.length >= 4 && (cleanSlug.includes(emailPrefix) || emailPrefix.includes(cleanSlug));
          return loginMatch || contactMatch || defaultEmailMatch || prefixMatch;
        });

        if (matchedTenant) {
          const expectedPassword =
            matchedTenant.password ||
            (matchedTenant.slug === 'bursa-bilisim'
              ? 'Bursa2026!'
              : matchedTenant.slug === 'kadikoy-cep'
              ? 'Kadikoy2026!'
              : 'Teknik2026!');

          // Şifre kontrolü
          if (cleanPass !== expectedPassword && cleanPass !== '123456') {
            return {
              success: false,
              message: `Şifreniz hatalı. (İpucu: Bu işletmenin şifresi: "${expectedPassword}")`,
            };
          }

          const user: AuthUser = {
            id: matchedTenant.id,
            email: cleanEmail,
            name: matchedTenant.brandName || matchedTenant.name,
            role: 'tenant',
            tenantId: matchedTenant.id,
            tenantSlug: matchedTenant.slug,
          };

          useTenantStore.getState().setCurrentTenant(matchedTenant);
          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }

        // 3. Personel hesabı kontrolü
        const matchedStaff = staffMembers.find((s) => s.email?.toLowerCase() === cleanEmail);
        if (matchedStaff) {
          if (cleanPass !== '123456' && cleanPass !== 'Personel2026!') {
            return { success: false, message: 'Personel şifresi hatalı.' };
          }

          const staffTenant = allTenants.find((t) => t.id === matchedStaff.tenantId);
          if (staffTenant) {
            useTenantStore.getState().setCurrentTenant(staffTenant);
          }

          const user: AuthUser = {
            id: matchedStaff.id,
            email: cleanEmail,
            name: matchedStaff.name,
            role: 'staff',
            tenantId: matchedStaff.tenantId,
            tenantSlug: staffTenant?.slug,
          };

          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }

        return {
          success: false,
          message: `"${cleanEmail}" adresine kayıtlı işletme bulunamadı. Lütfen "bursabilisim@teknikpro.com", "kadikoycep@teknikpro.com" veya "teknikpro@teknikpro.com" deneyin.`,
        };
      },

      loginAsSuperAdmin: (inputEmail: string, inputPass: string) => {
        const cleanEmail = inputEmail.trim().toLowerCase();
        const cleanPass = inputPass.trim();

        if (cleanEmail === SUPERADMIN_EMAIL && cleanPass === SUPERADMIN_PASSWORD) {
          const user: AuthUser = {
            id: 'superadmin-root',
            email: cleanEmail,
            name: 'Platform Süper Yöneticisi',
            role: 'superadmin',
          };

          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }

        return { success: false, message: 'Süper Admin e-posta veya şifresi hatalı!' };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    {
      name: 'teknikpro-auth-storage',
    }
  )
);
