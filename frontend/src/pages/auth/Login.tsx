import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { useStaffStore } from '../../store/staffStore';
import toast from 'react-hot-toast';
import './Login.css';

import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { loginAsTenant } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await loginAsTenant(email, password);

    if (!res.success) {
      toast.error(res.message || 'Giriş yapılamadı. Lütfen e-posta ve şifrenizi kontrol edin.');
      setLoading(false);
      return;
    }

    toast.success('Giriş başarılı! Yönetim paneline aktarılıyorsunuz.');
    setTimeout(() => {
      setLoading(false);
      navigate('/panel');
    }, 500);
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
              placeholder="bursabilisim@teknikpro.com"
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

          {/* Hızlı Test Girişleri */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
              Hızlı Giriş Seçenekleri:
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setEmail('bursabilisim@teknikpro.com'); setPassword('Bursa2026!'); }}
                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.35)', cursor: 'pointer', fontWeight: 600 }}
              >
                🏢 Bursa Bilişim
              </button>
              <button
                type="button"
                onClick={() => { setEmail('kadikoycep@teknikpro.com'); setPassword('Kadikoy2026!'); }}
                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.35)', cursor: 'pointer', fontWeight: 600 }}
              >
                📱 Kadıköy Cep
              </button>
              <button
                type="button"
                onClick={() => { setEmail('teknikpro@teknikpro.com'); setPassword('Teknik2026!'); }}
                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(0, 113, 227, 0.15)', color: '#7dd3fc', border: '1px solid rgba(0, 113, 227, 0.35)', cursor: 'pointer', fontWeight: 600 }}
              >
                ⚡ TeknikPro
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <p className="login-card__footer">
          © 2026 TeknikPro. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
