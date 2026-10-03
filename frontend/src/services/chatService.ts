import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Conversation, ChatMessage, SenderType, CustomerInfo } from '../types/chat';

// Local storage fallback cache key prefix
const LOCAL_MSG_KEY_PREFIX = 'tp_chat_local_msgs_';
const LOCAL_CONV_KEY_PREFIX = 'tp_chat_local_conv_';

/**
 * Ziyaretçi/müşteri için tekil konuşma odasını getir veya yeni oluştur.
 * Oda ID formatı: conv_{tenantId}_{sessionId}
 */
export async function getOrCreateCustomerConversation(
  tenantId: string,
  tenantName: string,
  customer: CustomerInfo
): Promise<Conversation> {
  const convId = `conv_${tenantId}_${customer.sessionId}`;
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Conversation;
    }

    const newConv: Omit<Conversation, 'id'> = {
      type: 'customer_tenant',
      tenantId,
      tenantName,
      customer,
      lastMessage: 'Sohbet başlatıldı',
      lastMessageAt: new Date().toISOString(),
      lastSenderType: 'customer',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(convRef, newConv);
    return { id: convId, ...newConv } as Conversation;
  } catch (err) {
    console.warn('Firestore fallback to local cache:', err);
    const cached = localStorage.getItem(LOCAL_CONV_KEY_PREFIX + convId);
    if (cached) {
      return JSON.parse(cached);
    }
    const fallbackConv: Conversation = {
      id: convId,
      type: 'customer_tenant',
      tenantId,
      tenantName,
      customer,
      lastMessage: 'Sohbet başlatıldı',
      lastMessageAt: new Date().toISOString(),
      lastSenderType: 'customer',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_CONV_KEY_PREFIX + convId, JSON.stringify(fallbackConv));
    return fallbackConv;
  }
}

/**
 * İşletme ile Süper Admin (TeknikPro Destek) arasındaki resmi destek odasını getir veya oluştur.
 * Oda ID formatı: conv_support_{tenantId}
 */
export async function getOrCreateTenantAdminSupportConversation(
  tenantId: string,
  tenantName: string
): Promise<Conversation> {
  const convId = `conv_support_${tenantId}`;
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Conversation;
    }

    const newConv: Omit<Conversation, 'id'> = {
      type: 'tenant_superadmin',
      tenantId,
      tenantName,
      lastMessage: 'TeknikPro platform desteğine hoş geldiniz.',
      lastMessageAt: new Date().toISOString(),
      lastSenderType: 'superadmin',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(convRef, newConv);
    return { id: convId, ...newConv } as Conversation;
  } catch (err) {
    console.warn('Firestore support conversation fallback:', err);
    return {
      id: convId,
      type: 'tenant_superadmin',
      tenantId,
      tenantName,
      lastMessage: 'TeknikPro platform desteğine hoş geldiniz.',
      lastMessageAt: new Date().toISOString(),
      lastSenderType: 'superadmin',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Belirtilen konuşma odasına canlı mesaj gönderir.
 */
export async function sendChatMessage(params: {
  conversationId: string;
  tenantId: string;
  senderType: SenderType;
  senderId: string;
  senderName: string;
  text: string;
  isSupportChannel?: boolean;
}): Promise<ChatMessage> {
  const { conversationId, tenantId, senderType, senderName, senderId, text, isSupportChannel } = params;

  const nowIso = new Date().toISOString();
  const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
  const convRef = doc(db, 'conversations', conversationId);

  const newMsgData = {
    conversationId,
    tenantId,
    senderType,
    senderId,
    senderName,
    text: text.trim(),
    isRead: false,
    createdAt: serverTimestamp(),
  };

  try {
    const addedRef = await addDoc(messagesColRef, newMsgData);

    // Üst konuşma kartını ve okunmamış sayaçlarını güncelle
    const updates: Record<string, any> = {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      lastSenderType: senderType,
      updatedAt: serverTimestamp(),
    };

    if (isSupportChannel) {
      if (senderType === 'tenant') {
        updates.unreadCountSuperAdmin = increment(1);
      } else if (senderType === 'superadmin') {
        updates.unreadCountTenant = increment(1);
      }
    } else {
      if (senderType === 'customer') {
        updates.unreadCountTenant = increment(1);
      } else if (senderType === 'tenant') {
        updates.unreadCountCustomer = increment(1);
      }
    }

    await updateDoc(convRef, updates).catch(() => {});

    return {
      id: addedRef.id,
      ...newMsgData,
      createdAt: nowIso,
    };
  } catch (err) {
    console.warn('Firestore send message fallback to local storage:', err);
    // Local fallback
    const localId = 'loc_' + Date.now();
    const fallbackMsg: ChatMessage = {
      id: localId,
      conversationId,
      tenantId,
      senderType,
      senderId,
      senderName,
      text: text.trim(),
      isRead: false,
      createdAt: nowIso,
    };

    const existingJson = localStorage.getItem(LOCAL_MSG_KEY_PREFIX + conversationId);
    const existingList: ChatMessage[] = existingJson ? JSON.parse(existingJson) : [];
    existingList.push(fallbackMsg);
    localStorage.setItem(LOCAL_MSG_KEY_PREFIX + conversationId, JSON.stringify(existingList));

    // Dispatch custom event for local reactive UI update
    window.dispatchEvent(
      new CustomEvent('tp_chat_new_message', { detail: { conversationId, message: fallbackMsg } })
    );

    return fallbackMsg;
  }
}

/**
 * Belirli bir konuşma odasındaki mesajları gerçek zamanlı dinler (onSnapshot)
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesColRef, orderBy('createdAt', 'asc'), limit(200));

  let unsubscribeFirestore = () => {};

  try {
    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          msgs.push({
            id: doc.id,
            conversationId: data.conversationId || conversationId,
            tenantId: data.tenantId,
            senderType: data.senderType,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            attachments: data.attachments,
            isRead: data.isRead ?? false,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });
        callback(msgs);
      },
      (error) => {
        console.warn('onSnapshot messages error, using local fallback:', error);
        loadLocalMessages(conversationId, callback);
      }
    );
  } catch (err) {
    console.warn('subscribeToMessages catch:', err);
    loadLocalMessages(conversationId, callback);
  }

  // Listen also to local window events for immediate feedback
  const handleLocalMsg = (e: any) => {
    if (e.detail?.conversationId === conversationId) {
      loadLocalMessages(conversationId, callback);
    }
  };
  window.addEventListener('tp_chat_new_message', handleLocalMsg);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener('tp_chat_new_message', handleLocalMsg);
  };
}

function loadLocalMessages(conversationId: string, callback: (msgs: ChatMessage[]) => void) {
  const existingJson = localStorage.getItem(LOCAL_MSG_KEY_PREFIX + conversationId);
  if (existingJson) {
    try {
      callback(JSON.parse(existingJson));
    } catch {}
  }
}

/**
 * Bir işletmenin tüm konuşma odalarını (müşteri mesajları ve platform destek) dinler.
 */
export function subscribeToTenantConversations(
  tenantId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const convColRef = collection(db, 'conversations');
  const q = query(convColRef, where('tenantId', '==', tenantId));

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            type: data.type || 'customer_tenant',
            tenantId: data.tenantId,
            tenantName: data.tenantName,
            customer: data.customer,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt?.toDate
              ? data.lastMessageAt.toDate().toISOString()
              : data.lastMessageAt || '',
            lastSenderType: data.lastSenderType || 'customer',
            unreadCountTenant: data.unreadCountTenant || 0,
            unreadCountCustomer: data.unreadCountCustomer || 0,
            unreadCountSuperAdmin: data.unreadCountSuperAdmin || 0,
            status: data.status || 'active',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        // En son mesaj atılana göre sırala
        list.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });

        callback(list);
      },
      (err) => {
        console.warn('subscribeToTenantConversations error:', err);
      }
    );
  } catch (err) {
    console.warn('subscribeToTenantConversations catch:', err);
    return () => {};
  }
}

/**
 * Süper Admin için tüm platform destek konuşmalarını dinler (type === 'tenant_superadmin')
 */
export function subscribeToSuperAdminConversations(
  callback: (conversations: Conversation[]) => void
): () => void {
  const convColRef = collection(db, 'conversations');
  const q = query(convColRef, where('type', '==', 'tenant_superadmin'));

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            type: 'tenant_superadmin',
            tenantId: data.tenantId,
            tenantName: data.tenantName,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt?.toDate
              ? data.lastMessageAt.toDate().toISOString()
              : data.lastMessageAt || '',
            lastSenderType: data.lastSenderType || 'tenant',
            unreadCountTenant: data.unreadCountTenant || 0,
            unreadCountCustomer: data.unreadCountCustomer || 0,
            unreadCountSuperAdmin: data.unreadCountSuperAdmin || 0,
            status: data.status || 'active',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        list.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });

        callback(list);
      },
      (err) => {
        console.warn('subscribeToSuperAdminConversations error:', err);
      }
    );
  } catch (err) {
    console.warn('subscribeToSuperAdminConversations catch:', err);
    return () => {};
  }
}

/**
 * Konuşmayı okundu olarak işaretle ve ilgili unreadCount sayacını sıfırla.
 */
export async function markConversationAsRead(
  conversationId: string,
  reader: 'customer' | 'tenant' | 'superadmin'
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  const updates: Record<string, any> = {};

  if (reader === 'tenant') updates.unreadCountTenant = 0;
  if (reader === 'customer') updates.unreadCountCustomer = 0;
  if (reader === 'superadmin') updates.unreadCountSuperAdmin = 0;

  try {
    await updateDoc(convRef, updates);
  } catch (err) {
    // silently ignore if offline/cache
  }
}
