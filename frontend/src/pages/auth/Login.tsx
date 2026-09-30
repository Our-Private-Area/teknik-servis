import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { useStaffStore } from '../../store/staffStore';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { tenants, setCurrentTenant } = useTenantStore();
  const { staffMembers } = useStaffStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. İşletme e-postası eşleşmesi
    let matchedTenant = tenants.find((t) => t.email?.toLowerCase() === cleanEmail);

    // 2. Personel e-postası eşleşmesi
    if (!matchedTenant) {
      const matchedStaff = staffMembers.find((s) => s.email?.toLowerCase() === cleanEmail);
      if (matchedStaff) {
        matchedTenant = tenants.find((t) => t.id === matchedStaff.tenantId);
      }
    }

    // 3. Domain veya slug eşleşmesi (örn: kadikoycep -> kadikoy-cep)
    if (!matchedTenant) {
      matchedTenant = tenants.find((t) => {
        const slugKey = t.slug.replace(/[^a-z0-9]/g, '');
        return cleanEmail.includes(slugKey);
      });
    }

    if (matchedTenant) {
      setCurrentTenant(matchedTenant);
      toast.success(`Hoş geldiniz! "${matchedTenant.name}" paneline giriş yapıldı.`);
    } else {
      toast.success('Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz.');
    }

    setTimeout(() => {
      setLoading(false);
      navigate('/panel');
    }, 600);
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-page__bg">
        <div className="login-page__bg-orb login-page__bg-orb--1" />
        <div className="login-page__bg-orb login-page__bg-orb--2" />
        <div className="login-page__bg-grid" />
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Brand */}
        <div className="login-card__brand">
          <div className="login-card__logo">
            <Zap size={28} />
          </div>
          <h1 className="login-card__title">TeknikPro</h1>
          <p className="login-card__subtitle">Teknik Servis Yönetim Paneli</p>
        </div>

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit}>
          <div className="login-card__field">
            <label htmlFor="email" className="login-card__label">E-posta</label>
            <input
              id="email"
              type="email"
              className="login-card__input"
              placeholder="ornek@teknikpro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-card__field">
            <div className="login-card__label-row">
              <label htmlFor="password" className="login-card__label">Şifre</label>
              <a href="#" className="login-card__forgot">Şifremi Unuttum</a>
            </div>
            <div className="login-card__input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-card__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-card__eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-card__submit ${loading ? 'login-card__submit--loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="login-card__spinner" />
            ) : (
              <>
                <LogIn size={18} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-card__footer">
          © 2026 TeknikPro. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
