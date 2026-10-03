/* =============================================
   TeknikPro Canlı Mesajlaşma Tipleri
   ============================================= */

export type ConversationType = 'customer_tenant' | 'tenant_superadmin';
export type ConversationStatus = 'active' | 'resolved' | 'archived';
export type SenderType = 'customer' | 'tenant' | 'superadmin';

export interface CustomerInfo {
  sessionId: string;      // localStorage'da tutulan tekil ziyaretçi kimliği
  name: string;           // Ziyaretçi adı
  phone?: string;         // Telefon numarası
  serviceCode?: string;   // Varsa ilgilendiği servis takip kodu
}

export interface Conversation {
  id: string;
  type: ConversationType;
  tenantId: string;
  tenantName: string;
  customer?: CustomerInfo;
  lastMessage: string;
  lastMessageAt: any;
  lastSenderType: SenderType;
  unreadCountTenant: number;
  unreadCountCustomer: number;
  unreadCountSuperAdmin: number;
  status: ConversationStatus;
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  tenantId: string;
  senderType: SenderType;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  isRead: boolean;
  createdAt: any;
}
