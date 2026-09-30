import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAsSuperAdmin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = loginAsSuperAdmin(email, password);

    if (!res.success) {
      toast.error(res.message || 'Giriş başarısız!');
      setLoading(false);
      return;
    }

    toast.success('Süper Admin girişi başarılı! Yönlendiriliyorsunuz...');
    setTimeout(() => {
      setLoading(false);
      navigate('/super-admin');
    }, 500);
  };

  return (
    <div className="admin-login-page">
      {/* Background */}
      <div className="admin-login-page__bg">
        <div className="admin-login-page__bg-orb admin-login-page__bg-orb--1" />
        <div className="admin-login-page__bg-orb admin-login-page__bg-orb--2" />
        <div className="admin-login-page__bg-grid" />
      </div>

      {/* Login Card */}
      <div className="admin-login-card">
        {/* Brand */}
        <div className="admin-login-card__brand">
          <div className="admin-login-card__logo">
            <Crown size={28} />
          </div>
          <h1 className="admin-login-card__title">TeknikPro Admin</h1>
          <p className="admin-login-card__subtitle">Platform Yönetim Paneli</p>
        </div>

        {/* Form */}
        <form className="admin-login-card__form" onSubmit={handleSubmit}>
          <div className="admin-login-card__field">
            <label htmlFor="admin-email" className="admin-login-card__label">E-posta</label>
            <input
              id="admin-email"
              type="email"
              className="admin-login-card__input"
              placeholder="admin@teknikpro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="admin-login-card__field">
            <div className="admin-login-card__label-row">
              <label htmlFor="admin-password" className="admin-login-card__label">Şifre</label>
              <a href="#" className="admin-login-card__forgot">Şifremi Unuttum</a>
            </div>
            <div className="admin-login-card__input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-login-card__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="admin-login-card__eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`admin-login-card__submit ${loading ? 'admin-login-card__submit--loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="admin-login-card__spinner" />
            ) : (
              <>
                <LogIn size={18} />
                Admin Girişi Yap
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="admin-login-card__footer">
          © 2026 TeknikPro Platform. Tüm hakları saklıdır.
        </p>

        <Link to="/" className="admin-login-card__back">
          <ArrowLeft size={14} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
