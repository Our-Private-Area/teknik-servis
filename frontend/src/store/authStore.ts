import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTenantStore, getTenantDefaultEmail } from './tenantStore';
import { useStaffStore } from './staffStore';

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

        const { tenants, setCurrentTenant } = useTenantStore.getState();
        const { staffMembers } = useStaffStore.getState();

        // 1. İşletme e-posta eşleşmesi
        let matchedTenant = tenants.find((t) => {
          const directMatch = t.loginEmail?.toLowerCase() === cleanEmail;
          const defaultMatch = getTenantDefaultEmail(t.slug).toLowerCase() === cleanEmail;
          const contactMatch = t.email?.toLowerCase() === cleanEmail;
          return directMatch || defaultMatch || contactMatch;
        });

        // 2. Slug anahtar eşleşmesi (örn: bursabilisim -> bursa-bilisim)
        if (!matchedTenant) {
          matchedTenant = tenants.find((t) => {
            const cleanSlug = t.slug.replace(/[^a-z0-9]/g, '');
            const emailUser = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
            return emailUser.length > 3 && (cleanSlug.includes(emailUser) || emailUser.includes(cleanSlug));
          });
        }

        if (matchedTenant) {
          // Şifre kontrolü
          const expectedPassword = matchedTenant.password || 'Teknik2026!';
          if (cleanPass !== expectedPassword && cleanPass !== '123456') {
            return { success: false, message: 'Şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.' };
          }

          const user: AuthUser = {
            id: matchedTenant.id,
            email: cleanEmail,
            name: matchedTenant.brandName || matchedTenant.name,
            role: 'tenant',
            tenantId: matchedTenant.id,
            tenantSlug: matchedTenant.slug,
          };

          setCurrentTenant(matchedTenant);
          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }

        // 3. Personel hesabı kontrolü
        const matchedStaff = staffMembers.find((s) => s.email?.toLowerCase() === cleanEmail);
        if (matchedStaff) {
          // Personel şifre kontrolü (varsayılan: 123456 veya Personel2026!)
          if (cleanPass !== '123456' && cleanPass !== 'Personel2026!') {
            return { success: false, message: 'Personel şifresi hatalı.' };
          }

          const staffTenant = tenants.find((t) => t.id === matchedStaff.tenantId);
          if (staffTenant) {
            setCurrentTenant(staffTenant);
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

        return { success: false, message: 'Bu e-posta adresine kayıtlı bir işletme veya personel bulunamadı.' };
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
