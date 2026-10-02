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
 * Modern curated accent color presets for admin panel customization
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

export interface AdminBgPreset {
  id: string;
  name: string;
  desc: string;
  dotColor: string;
  primary: string;
  secondary: string;
  card: string;
  cardHover: string;
  tertiary: string;
  input: string;
  borderPrimary: string;
  borderSecondary: string;
}

/**
 * Curated background color presets (replacing the default navy)
 */
export const ADMIN_BG_PRESETS: AdminBgPreset[] = [
  {
    id: 'navy',
    name: 'Gece Mavisi (Lacivert)',
    desc: 'Orijinal klasik koyu lacivert atmosfer',
    dotColor: '#1e293b',
    primary: '#0a0e14',
    secondary: '#111827',
    card: '#141921',
    cardHover: '#1a2030',
    tertiary: '#1a1f2e',
    input: '#0f1319',
    borderPrimary: '#1e2736',
    borderSecondary: '#2a3444',
  },
  {
    id: 'black',
    name: 'Saf Siyah & OLED',
    desc: 'Nötr simsiyah ve antrasit kömür (Lacivertsiz)',
    dotColor: '#09090b',
    primary: '#000000',
    secondary: '#0b0b0e',
    card: '#131317',
    cardHover: '#1a1a20',
    tertiary: '#212129',
    input: '#0d0d11',
    borderPrimary: '#22222a',
    borderSecondary: '#33333f',
  },
  {
    id: 'graphite',
    name: 'Platin Grafit & Füme',
    desc: 'Nötr kurumsal füme koyu gri',
    dotColor: '#1a1e24',
    primary: '#0e1116',
    secondary: '#151921',
    card: '#1c212b',
    cardHover: '#242a37',
    tertiary: '#2b3240',
    input: '#12161d',
    borderPrimary: '#283140',
    borderSecondary: '#3b465b',
  },
  {
    id: 'purple',
    name: 'Obsidyen Gece Moru',
    desc: 'Derin ve asil koyu mor atmosfer',
    dotColor: '#190d2e',
    primary: '#090514',
    secondary: '#120b24',
    card: '#180f30',
    cardHover: '#211542',
    tertiary: '#2a1a52',
    input: '#0e081c',
    borderPrimary: '#2c1954',
    borderSecondary: '#3e2474',
  },
  {
    id: 'emerald',
    name: 'Derin Zümrüt & Orman',
    desc: 'Karanlık botanik koyu yeşil',
    dotColor: '#092419',
    primary: '#030f0a',
    secondary: '#071c14',
    card: '#0c281d',
    cardHover: '#113728',
    tertiary: '#184734',
    input: '#05160f',
    borderPrimary: '#14402e',
    borderSecondary: '#1f5941',
  },
  {
    id: 'espresso',
    name: 'Sıcak Espresso',
    desc: 'Sıcak çikolata ve koyu kahve',
    dotColor: '#261b15',
    primary: '#0e0a08',
    secondary: '#18120e',
    card: '#221914',
    cardHover: '#2d221b',
    tertiary: '#382a21',
    input: '#120c09',
    borderPrimary: '#37271f',
    borderSecondary: '#4d372c',
  },
  {
    id: 'crimson',
    name: 'Yakut & Gece Şarabı',
    desc: 'Derin bordo ve yakut antrasit',
    dotColor: '#290912',
    primary: '#100508',
    secondary: '#1a090e',
    card: '#240d14',
    cardHover: '#30121b',
    tertiary: '#3c1622',
    input: '#13060a',
    borderPrimary: '#3a131f',
    borderSecondary: '#501a2b',
  },
];

export function generateBgFromHex(hex: string): AdminBgPreset {
  return {
    id: 'custom',
    name: 'Özel Arka Plan',
    desc: hex,
    dotColor: hex,
    primary: hex,
    secondary: adjustBrightness(hex, 8),
    card: adjustBrightness(hex, 14),
    cardHover: adjustBrightness(hex, 20),
    tertiary: adjustBrightness(hex, 25),
    input: adjustBrightness(hex, 5),
    borderPrimary: adjustBrightness(hex, 24),
    borderSecondary: adjustBrightness(hex, 34),
  };
}

/**
 * Apply admin theme color & background dynamically to document element
 */
export function applyAdminTheme(theme?: TenantTheme | null, isDarkMode = true): void {
  const root = document.documentElement;

  // 1. Vurgu Rengi (Accent Primary)
  if (!theme || !theme.adminThemeMode || theme.adminThemeMode === 'default') {
    root.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-primary-hover');
    root.style.removeProperty('--accent-primary-light');
    root.style.removeProperty('--accent-primary-text');
    root.style.removeProperty('--border-focus');
  } else {
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

  // 2. Arka Plan Rengi (Background Palette)
  if (isDarkMode) {
    const bgPresetId = theme?.adminBgPreset || 'navy';
    let bgConfig: AdminBgPreset | undefined;

    if (bgPresetId === 'custom' && theme?.adminBgColor) {
      bgConfig = generateBgFromHex(theme.adminBgColor);
    } else {
      bgConfig = ADMIN_BG_PRESETS.find((p) => p.id === bgPresetId);
    }

    if (bgConfig && bgPresetId !== 'navy') {
      root.style.setProperty('--bg-primary', bgConfig.primary);
      root.style.setProperty('--bg-secondary', bgConfig.secondary);
      root.style.setProperty('--bg-card', bgConfig.card);
      root.style.setProperty('--bg-card-hover', bgConfig.cardHover);
      root.style.setProperty('--bg-tertiary', bgConfig.tertiary);
      root.style.setProperty('--bg-input', bgConfig.input);
      root.style.setProperty('--border-primary', bgConfig.borderPrimary);
      root.style.setProperty('--border-secondary', bgConfig.borderSecondary);
    } else {
      // Varsayılan koyu lacivert CSS değişkenlerine geri dön
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--bg-card');
      root.style.removeProperty('--bg-card-hover');
      root.style.removeProperty('--bg-tertiary');
      root.style.removeProperty('--bg-input');
      root.style.removeProperty('--border-primary');
      root.style.removeProperty('--border-secondary');
    }
  } else {
    // Açık temada özel koyu arka planlar devre dışı kalır
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-secondary');
    root.style.removeProperty('--bg-card');
    root.style.removeProperty('--bg-card-hover');
    root.style.removeProperty('--bg-tertiary');
    root.style.removeProperty('--bg-input');
    root.style.removeProperty('--border-primary');
    root.style.removeProperty('--border-secondary');
  }
}
