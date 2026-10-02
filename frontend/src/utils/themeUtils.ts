import { TenantTheme } from '../types';

export function hexToRgba(hex: string, alpha = 1): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function adjustBrightness(hex: string, percent: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round((255 * percent) / 100);
  let g = ((num >> 8) & 255) + Math.round((255 * percent) / 100);
  let b = (num & 255) + Math.round((255 * percent) / 100);

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Modern curated color presets for admin panel customization
 */
export const ADMIN_PRESET_COLORS = [
  { name: 'Orijinal Safir', hex: '#3b82f6', desc: 'Klasik TeknikPro Mavisi' },
  { name: 'Zümrüt Yeşil', hex: '#10b981', desc: 'Canlı & Kurumsal Servis Yeşili' },
  { name: 'Ametist Mor', hex: '#8b5cf6', desc: 'Modern & Şık Mor Vurgu' },
  { name: 'Amber & Altın', hex: '#f59e0b', desc: 'Sıcak & Dinamik Kehribar' },
  { name: 'Ateş Turuncusu', hex: '#f97316', desc: 'Enerjik & Canlı Donanım Teması' },
  { name: 'Okyanus Camgöbeği', hex: '#06b6d4', desc: 'Ferah & Berrak Turkuaz' },
  { name: 'Derin İndigo', hex: '#6366f1', desc: 'Asil & Karizmatik Lacivert Tonu' },
  { name: 'Yakut Kırmızı', hex: '#f43f5e', desc: 'Çarpıcı & Güçlü Pembe-Kırmızı' },
];

/**
 * Apply admin theme color dynamically to document element
 */
export function applyAdminTheme(theme?: TenantTheme | null, isDarkMode = true): void {
  const root = document.documentElement;

  if (!theme || !theme.adminThemeMode || theme.adminThemeMode === 'default') {
    // Reset to default CSS variables
    root.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-primary-hover');
    root.style.removeProperty('--accent-primary-light');
    root.style.removeProperty('--accent-primary-text');
    root.style.removeProperty('--border-focus');
    return;
  }

  let activeColor = '#3b82f6';
  if (theme.adminThemeMode === 'website_colors') {
    activeColor = theme.primaryColor || '#0071e3';
  } else if (theme.adminThemeMode === 'custom') {
    activeColor = theme.adminPrimaryColor || theme.primaryColor || '#3b82f6';
  }

  const hoverColor = isDarkMode ? adjustBrightness(activeColor, -12) : adjustBrightness(activeColor, -18);
  const lightColor = hexToRgba(activeColor, isDarkMode ? 0.15 : 0.09);
  const textColor = isDarkMode ? adjustBrightness(activeColor, 35) : adjustBrightness(activeColor, -30);

  root.style.setProperty('--accent-primary', activeColor);
  root.style.setProperty('--accent-primary-hover', hoverColor);
  root.style.setProperty('--accent-primary-light', lightColor);
  root.style.setProperty('--accent-primary-text', textColor);
  root.style.setProperty('--border-focus', activeColor);
}
