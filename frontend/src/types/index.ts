/* =============================================
   Servis Durumları (Status)
   ============================================= */

export type ServiceStatus =
  | 'received'
  | 'in_repair'
  | 'waiting_parts'
  | 'waiting_approval'
  | 'approved'
  | 'rejected'
  | 'at_another_service'
  | 'ready'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const SERVICE_STATUS_MAP: Record<ServiceStatus, StatusConfig> = {
  received:           { label: 'Teslim Alındı',           color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)',  icon: 'package-check' },
  in_repair:          { label: 'Tamirde',                  color: '#f97316', bgColor: 'rgba(249,115,22,0.12)',  icon: 'wrench' },
  waiting_parts:      { label: 'Parça Bekliyor',           color: '#eab308', bgColor: 'rgba(234,179,8,0.12)',   icon: 'clock' },
  waiting_approval:   { label: 'Müşteri Onayı Bekliyor',   color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.12)',  icon: 'user-check' },
  approved:           { label: 'Müşteri Onayladı',         color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)',   icon: 'check-circle' },
  rejected:           { label: 'Müşteri Reddetti',         color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)',   icon: 'x-circle' },
  at_another_service: { label: 'Başka Serviste',           color: '#6b7280', bgColor: 'rgba(107,114,128,0.12)', icon: 'external-link' },
  ready:              { label: 'Hazır',                    color: '#10b981', bgColor: 'rgba(16,185,129,0.12)',  icon: 'check' },
  delivered:          { label: 'Teslim Edildi',            color: '#059669', bgColor: 'rgba(5,150,105,0.12)',   icon: 'package' },
  returned:           { label: 'İade Edildi',              color: '#a16207', bgColor: 'rgba(161,98,7,0.12)',    icon: 'undo' },
  cancelled:          { label: 'İptal',                    color: '#374151', bgColor: 'rgba(55,65,81,0.12)',    icon: 'ban' },
};

/* =============================================
   User / Auth
   ============================================= */

export type UserRole = 'admin' | 'technician' | 'staff';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

/* =============================================
   Tenant / Multi-Tenancy (İşletme / Kiracı)
   ============================================= */

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  darkMode?: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  brandName?: string;
  phone: string;
  email?: string;
  loginEmail?: string;
  password?: string;
  address?: string;
  cargoCompany?: string;
  cargoCode?: string;
  warrantyDays: number;
  terms?: string;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  monthlyFee?: number;
  subscriptionEndDate?: string;
  createdAt: string;

  // Branding / Görsel Kimlik
  logoUrl?: string;
  faviconUrl?: string;
  coverImageUrl?: string;

  // Tema Renkleri
  theme?: TenantTheme;

  // İşletme Detay Bilgileri
  description?: string;
  shortDescription?: string;
  city?: string;
  district?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  workingHours?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };

  // Hizmet Bilgileri
  services?: string[];
  deviceBrands?: string[];

  // Medya / Galeri Bölümü
  mediaEnabled?: boolean;
  mediaTitle?: string;
  mediaDescription?: string;
  mediaItems?: TenantMediaItem[];
  mediaCategories?: string[];
}

export interface TenantMediaItem {
  id: string;
  url: string;
  title?: string;
  category?: string; // 'Dükkan', 'Ürünler', 'Onarım', 'Atölye', 'Genel'
  createdAt?: string;
}

export interface PlatformTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string; // 'Abonelik Tahsilatı', 'Sunucu / Hosting', 'SMS Sağlayıcı', 'Pazarlama', 'Yazılım Altyapı'
  amount: number;
  tenantId?: string;
  tenantName?: string;
  description: string;
  date: string;
  createdAt: string;
}

/* =============================================
   Customer
   ============================================= */

export interface Customer {
  id: string;
  tenantId?: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  totalServices: number;
  balance: number;
  createdAt: string;
}

/* =============================================
   Service Record & History
   ============================================= */

export type Priority = 'normal' | 'urgent' | 'critical';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface StatusHistoryItem {
  status: ServiceStatus | string;
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface ServiceNote {
  id: string;
  serviceId?: string;
  author: string;
  authorRole?: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  tenantId?: string;
  trackingNo: string;
  customerId: string;
  customerName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;

  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  serialNo?: string;
  imei?: string;
  devicePassword?: string;

  complaint: string;
  diagnosis?: string;
  performedWork?: string;
  status: ServiceStatus;
  priority: Priority;

  estimatedCost?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost: number;
  paidAmount: number;
  remainingAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  isWarranty?: boolean;

  accessoriesReceived?: string[];
  physicalCondition?: string;

  notes?: ServiceNote[];
  statusHistory: StatusHistoryItem[];

  estimatedDeliveryDate?: string;
  estimatedDelivery?: string;
  receivedDate?: string;
  receivedAt?: string;
  completedDate?: string;
  completedAt?: string;
  deliveredDate?: string;
  deliveredAt?: string;
  isOnlineBooking?: boolean;
  deliveryMethod?: 'store' | 'cargo';
  preferredAppointmentDate?: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
  updatedAt: string;
}

/* =============================================
   Stock
   ============================================= */

export interface StockItem {
  id: string;
  tenantId?: string;
  name: string;
  code?: string;
  barcode?: string;
  category: string;
  brand?: string;
  compatibleModels?: string[];
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  criticalLevel?: number;
  minStock?: number;
  unit?: string;
  supplier?: string;
  shelfLocation?: string;
  shelf?: string;
  createdAt: string;
}

/* =============================================
   Cash / Finance
   ============================================= */

export type TransactionType = 'income' | 'expense';

export interface CashTransaction {
  id: string;
  tenantId?: string;
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  serviceId?: string;
  serviceTrackingNo?: string;
  customerName?: string;
  recordedBy?: string;
  createdBy?: string;
  date: string;
  createdAt?: string;
}

/* =============================================
   Settings
   ============================================= */

export interface CompanySettings {
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo?: string;
}

/* =============================================
   Staff / Team
   ============================================= */

export interface StaffMember {
  id: string;
  tenantId?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  specialty: string;
  activeRepairs?: number;
  rating?: string;
  createdAt?: string;
}
