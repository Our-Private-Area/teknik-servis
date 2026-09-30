import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

export function TenantProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !toastShown.current) {
      toast.error('Yönetim paneline erişmek için lütfen giriş yapın.');
      toastShown.current = true;
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function SuperAdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if ((!isAuthenticated || currentUser?.role !== 'superadmin') && !toastShown.current) {
      toast.error('Bu alana yalnızca Süper Admin erişebilir.');
      toastShown.current = true;
    }
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated || currentUser?.role !== 'superadmin') {
    return <Navigate to="/admin-giris" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
