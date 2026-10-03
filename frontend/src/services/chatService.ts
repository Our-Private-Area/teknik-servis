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
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebase';
import { Conversation, ChatMessage, SenderType, CustomerInfo } from '../types/chat';

// Local storage keys
const LOCAL_MSG_KEY_PREFIX = 'tp_chat_local_msgs_';
const LOCAL_ALL_CONVS_KEY = 'tp_all_conversations';
const LOCAL_SYNC_PING_KEY = 'tp_chat_sync_ping';

// BroadcastChannel for instant cross-tab real-time sync in the browser
let chatBus: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    chatBus = new BroadcastChannel('tp_live_chat_bus');
  }
} catch (e) {
  console.debug('BroadcastChannel not supported:', e);
}

function broadcastChatEvent(event: any) {
  try {
    chatBus?.postMessage(event);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    // Same-window event
    window.dispatchEvent(new CustomEvent('tp_live_chat_event', { detail: event }));
    // Cross-tab storage event trigger
    try {
      localStorage.setItem(LOCAL_SYNC_PING_KEY, Date.now().toString());
    } catch {}
  }
}

/**
 * Ziyaretçi müşterinin Firestore kurallarını geçebilmesi için sessizce Firebase Auth başlat
 */
async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.debug('Anonymous auth note:', e);
    }
  }
}

/**
 * Tenant ID veya Slug eşleştirme yardımcısı
 * örn: 'tenant-kadikoy' ve 'kadikoy-cep' aynı işletmeyi temsil eder
 */
export function normalizeTenantKey(key: string): string {
  if (!key) return '';
  return key.toLowerCase().replace('tenant-', '').replace(/[^a-z0-9]/g, '');
}

export function matchesTenant(convTenantId: string, targetTenantId: string): boolean {
  if (!convTenantId || !targetTenantId) return false;
  if (convTenantId === targetTenantId) return true;
  return normalizeTenantKey(convTenantId) === normalizeTenantKey(targetTenantId);
}

// =============================================
// Local Cache Helpers
// =============================================

export function getLocalConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LOCAL_ALL_CONVS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalConversation(conv: Conversation) {
  try {
    const list = getLocalConversations();
    const idx = list.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...conv };
    } else {
      list.unshift(conv);
    }
    localStorage.setItem(LOCAL_ALL_CONVS_KEY, JSON.stringify(list));
    broadcastChatEvent({ type: 'CONV_UPDATED', conversation: conv });
  } catch (e) {}
}

export function getLocalMessages(conversationId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_MSG_KEY_PREFIX + conversationId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMessage(msg: ChatMessage) {
  try {
    const key = LOCAL_MSG_KEY_PREFIX + msg.conversationId;
    const list = getLocalMessages(msg.conversationId);
    if (!list.some((m) => m.id === msg.id)) {
      list.push(msg);
      localStorage.setItem(key, JSON.stringify(list));
    }

    // Üst konuşmayı da yerel olarak güncelle
    const convs = getLocalConversations();
    const conv = convs.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessage = msg.text;
      conv.lastMessageAt = msg.createdAt;
      conv.lastSenderType = msg.senderType;
      if (conv.type === 'tenant_superadmin') {
        if (msg.senderType === 'tenant') {
          conv.unreadCountSuperAdmin = (conv.unreadCountSuperAdmin || 0) + 1;
        } else if (msg.senderType === 'superadmin') {
          conv.unreadCountTenant = (conv.unreadCountTenant || 0) + 1;
        }
      } else {
        if (msg.senderType === 'customer') {
          conv.unreadCountTenant = (conv.unreadCountTenant || 0) + 1;
        } else if (msg.senderType === 'tenant') {
          conv.unreadCountCustomer = (conv.unreadCountCustomer || 0) + 1;
        }
      }
      localStorage.setItem(LOCAL_ALL_CONVS_KEY, JSON.stringify(convs));
      broadcastChatEvent({ type: 'CONV_UPDATED', conversation: conv });
    }

    broadcastChatEvent({ type: 'MSG_ADDED', conversationId: msg.conversationId, message: msg });
  } catch (e) {}
}

// =============================================
// Core Chat API
// =============================================

/**
 * Ziyaretçi/müşteri için tekil konuşma odasını getir veya yeni oluştur.
 */
export async function getOrCreateCustomerConversation(
  tenantId: string,
  tenantName: string,
  customer: CustomerInfo
): Promise<Conversation> {
  await ensureAuth();

  const convId = `conv_${tenantId}_${customer.sessionId}`;
  const nowIso = new Date().toISOString();

  const localConvData: Conversation = {
    id: convId,
    type: 'customer_tenant',
    tenantId,
    tenantName,
    customer,
    lastMessage: 'Sohbet başlatıldı',
    lastMessageAt: nowIso,
    lastSenderType: 'customer',
    unreadCountTenant: 0,
    unreadCountCustomer: 0,
    unreadCountSuperAdmin: 0,
    status: 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Önce anında yerel depoya kaydet ve yayınla (0ms tepki süresi)
  saveLocalConversation(localConvData);

  // 2. Ardından Firestore'a kaydet
  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const remoteData = { id: snap.id, ...snap.data() } as Conversation;
      saveLocalConversation(remoteData);
      return remoteData;
    }

    const firestoreData = {
      type: 'customer_tenant',
      tenantId,
      tenantName,
      customer,
      lastMessage: 'Sohbet başlatıldı',
      lastMessageAt: serverTimestamp(),
      lastSenderType: 'customer',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(convRef, firestoreData);
  } catch (err) {
    console.debug('Firestore save note (local cache will ensure sync):', err);
  }

  return localConvData;
}

/**
 * İşletme ile Süper Admin arasındaki resmi destek odasını getir veya oluştur.
 */
export async function getOrCreateTenantAdminSupportConversation(
  tenantId: string,
  tenantName: string
): Promise<Conversation> {
  await ensureAuth();

  const convId = `conv_support_${tenantId}`;
  const nowIso = new Date().toISOString();

  // Eğer yerel depoda zaten varsa mevcut konuşmayı koru (son mesajını sıfırlama)
  const existingLocal = getLocalConversations().find((c) => c.id === convId);
  if (existingLocal) {
    return existingLocal;
  }

  const localConv: Conversation = {
    id: convId,
    type: 'tenant_superadmin',
    tenantId,
    tenantName,
    lastMessage: 'TeknikPro platform desteğine hoş geldiniz.',
    lastMessageAt: nowIso,
    lastSenderType: 'superadmin',
    unreadCountTenant: 0,
    unreadCountCustomer: 0,
    unreadCountSuperAdmin: 0,
    status: 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  saveLocalConversation(localConv);

  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const remoteData = { id: snap.id, ...snap.data() } as Conversation;
      saveLocalConversation(remoteData);
      return remoteData;
    }

    await setDoc(convRef, {
      type: 'tenant_superadmin',
      tenantId,
      tenantName,
      lastMessage: 'TeknikPro platform desteğine hoş geldiniz.',
      lastMessageAt: serverTimestamp(),
      lastSenderType: 'superadmin',
      unreadCountTenant: 0,
      unreadCountCustomer: 0,
      unreadCountSuperAdmin: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.debug('Support conversation note:', err);
  }

  return localConv;
}

/**
 * Belirtilen odaya canlı mesaj gönderir.
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
  await ensureAuth();

  const { conversationId, tenantId, senderType, senderName, senderId, text, isSupportChannel } = params;
  const nowIso = new Date().toISOString();
  const tempMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const localMsg: ChatMessage = {
    id: tempMsgId,
    conversationId,
    tenantId,
    senderType,
    senderId,
    senderName,
    text: text.trim(),
    isRead: false,
    createdAt: nowIso,
  };

  // 1. Önce anında yerel kaydet ve BroadcastChannel ile diğer sekmelere fırlat!
  saveLocalMessage(localMsg);

  // 2. Ardından Firestore'a yaz
  try {
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    const addedRef = await addDoc(messagesColRef, {
      conversationId,
      tenantId,
      senderType,
      senderId,
      senderName,
      text: text.trim(),
      isRead: false,
      createdAt: serverTimestamp(),
    });

    const updates: Record<string, any> = {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      lastSenderType: senderType,
      updatedAt: serverTimestamp(),
    };

    if (isSupportChannel) {
      if (senderType === 'tenant') updates.unreadCountSuperAdmin = increment(1);
      else if (senderType === 'superadmin') updates.unreadCountTenant = increment(1);
    } else {
      if (senderType === 'customer') updates.unreadCountTenant = increment(1);
      else if (senderType === 'tenant') updates.unreadCountCustomer = increment(1);
    }

    await updateDoc(convRef, updates).catch(() => {});

    localMsg.id = addedRef.id;
  } catch (err) {
    console.debug('Firestore message push note (local sync active):', err);
  }

  return localMsg;
}

/**
 * Belirli bir konuşma odasındaki mesajları canlı dinler (Firestore onSnapshot + BroadcastChannel + LocalStorage)
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  // 1. Hemen yerel mesajları ver (0 ms bekleme)
  const initialLocal = getLocalMessages(conversationId);
  callback(initialLocal);

  // 2. Firestore'u dinle
  let unsubscribeFirestore = () => {};
  try {
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesColRef, orderBy('createdAt', 'asc'), limit(200));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const remoteMsgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          remoteMsgs.push({
            id: docSnap.id,
            conversationId: d.conversationId || conversationId,
            tenantId: d.tenantId,
            senderType: d.senderType,
            senderId: d.senderId,
            senderName: d.senderName,
            text: d.text,
            attachments: d.attachments,
            isRead: d.isRead ?? false,
            createdAt: d.createdAt?.toDate
              ? d.createdAt.toDate().toISOString()
              : d.createdAt || new Date().toISOString(),
          });
        });

        if (remoteMsgs.length > 0) {
          // Yerel önbelleğe de senkronize et
          try {
            const currentLocal = getLocalMessages(conversationId);
            const merged = [...currentLocal];
            remoteMsgs.forEach((rm) => {
              const existIdx = merged.findIndex((m) => m.id === rm.id || (m.text === rm.text && Math.abs(new Date(m.createdAt).getTime() - new Date(rm.createdAt).getTime()) < 3000));
              if (existIdx >= 0) {
                merged[existIdx] = rm;
              } else {
                merged.push(rm);
              }
            });
            localStorage.setItem(LOCAL_MSG_KEY_PREFIX + conversationId, JSON.stringify(merged));
            callback(merged);
          } catch {
            callback(remoteMsgs);
          }
        }
      },
      (err) => {
        console.debug('Firestore message onSnapshot note:', err);
      }
    );
  } catch (err) {
    console.debug('subscribeToMessages catch:', err);
  }

  // 3. Sekmeler arası ve yerel olayları dinle
  const handleBus = (e: any) => {
    const data = e?.data || e?.detail;
    if (data?.conversationId === conversationId || data?.type === 'MSG_ADDED') {
      const refreshed = getLocalMessages(conversationId);
      callback(refreshed);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_MSG_KEY_PREFIX + conversationId || e.key === LOCAL_SYNC_PING_KEY) {
      callback(getLocalMessages(conversationId));
    }
  };

  chatBus?.addEventListener('message', handleBus);
  window.addEventListener('tp_live_chat_event', handleBus as any);
  window.addEventListener('storage', handleStorage);

  return () => {
    unsubscribeFirestore();
    chatBus?.removeEventListener('message', handleBus);
    window.removeEventListener('tp_live_chat_event', handleBus as any);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Bir işletmenin tüm konuşma odalarını dinler (Müşteri mesajları ve platform destek)
 */
export function subscribeToTenantConversations(
  tenantId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const loadFilteredLocal = (): Conversation[] => {
    const all = getLocalConversations();
    return all.filter((c) => matchesTenant(c.tenantId, tenantId)).sort((a, b) => {
      const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
      const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
      return tB - tA;
    });
  };

  // 1. İlk olarak anında yereldeki konuşmaları sun
  callback(loadFilteredLocal());

  // 2. Firestore'u dinle
  let unsubscribeFirestore = () => {};
  try {
    const convColRef = collection(db, 'conversations');
    // Doğrudan veya normalize query
    const q = query(convColRef);

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const firestoreList: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (matchesTenant(d.tenantId, tenantId)) {
            firestoreList.push({
              id: docSnap.id,
              type: d.type || 'customer_tenant',
              tenantId: d.tenantId,
              tenantName: d.tenantName,
              customer: d.customer,
              lastMessage: d.lastMessage || '',
              lastMessageAt: d.lastMessageAt?.toDate
                ? d.lastMessageAt.toDate().toISOString()
                : d.lastMessageAt || '',
              lastSenderType: d.lastSenderType || 'customer',
              unreadCountTenant: d.unreadCountTenant || 0,
              unreadCountCustomer: d.unreadCountCustomer || 0,
              unreadCountSuperAdmin: d.unreadCountSuperAdmin || 0,
              status: d.status || 'active',
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            });
          }
        });

        // Yerel konuşmalarla birleştir (Firestore'da henüz olmayan yerel odaları kaybetme)
        const localList = loadFilteredLocal();
        const mergedMap = new Map<string, Conversation>();

        localList.forEach((c) => mergedMap.set(c.id, c));
        firestoreList.forEach((c) => mergedMap.set(c.id, c));

        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
          const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
          return tB - tA;
        });

        // Birleşmiş listeyi yerel depoya yaz
        try {
          const allLocal = getLocalConversations();
          merged.forEach((m) => {
            const idx = allLocal.findIndex((x) => x.id === m.id);
            if (idx >= 0) allLocal[idx] = m;
            else allLocal.unshift(m);
          });
          localStorage.setItem(LOCAL_ALL_CONVS_KEY, JSON.stringify(allLocal));
        } catch {}

        callback(merged);
      },
      (err) => {
        console.debug('Firestore tenant conversations note:', err);
      }
    );
  } catch (err) {
    console.debug('subscribeToTenantConversations catch:', err);
  }

  // 3. Sekmeler arası olay dinleyicisi
  const handleBus = () => {
    callback(loadFilteredLocal());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_ALL_CONVS_KEY || e.key === LOCAL_SYNC_PING_KEY) {
      callback(loadFilteredLocal());
    }
  };

  chatBus?.addEventListener('message', handleBus);
  window.addEventListener('tp_live_chat_event', handleBus);
  window.addEventListener('storage', handleStorage);

  return () => {
    unsubscribeFirestore();
    chatBus?.removeEventListener('message', handleBus);
    window.removeEventListener('tp_live_chat_event', handleBus);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Süper Admin için tüm platform destek konuşmalarını dinler
 */
export function subscribeToSuperAdminConversations(
  callback: (conversations: Conversation[]) => void
): () => void {
  const loadLocalSupport = (): Conversation[] => {
    return getLocalConversations()
      .filter((c) => c.type === 'tenant_superadmin')
      .sort((a, b) => {
        const tA = new Date(a.lastMessageAt || 0).getTime();
        const tB = new Date(b.lastMessageAt || 0).getTime();
        return tB - tA;
      });
  };

  callback(loadLocalSupport());

  let unsubscribeFirestore = () => {};
  try {
    const convColRef = collection(db, 'conversations');
    const q = query(convColRef, where('type', '==', 'tenant_superadmin'));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            type: 'tenant_superadmin',
            tenantId: d.tenantId,
            tenantName: d.tenantName,
            lastMessage: d.lastMessage || '',
            lastMessageAt: d.lastMessageAt?.toDate
              ? d.lastMessageAt.toDate().toISOString()
              : d.lastMessageAt || '',
            lastSenderType: d.lastSenderType || 'tenant',
            unreadCountTenant: d.unreadCountTenant || 0,
            unreadCountCustomer: d.unreadCountCustomer || 0,
            unreadCountSuperAdmin: d.unreadCountSuperAdmin || 0,
            status: d.status || 'active',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });

        // Yerel konuşmalarla birleştir (Firestore gecikmelerine karşı tam dayanıklılık)
        const localList = loadLocalSupport();
        const mergedMap = new Map<string, Conversation>();
        localList.forEach((c) => mergedMap.set(c.id, c));
        list.forEach((c) => mergedMap.set(c.id, c));

        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
          const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
          return tB - tA;
        });

        // Yerel önbelleğe de güncelle
        try {
          const allLocal = getLocalConversations();
          merged.forEach((m) => {
            const idx = allLocal.findIndex((x) => x.id === m.id);
            if (idx >= 0) allLocal[idx] = m;
            else allLocal.unshift(m);
          });
          localStorage.setItem(LOCAL_ALL_CONVS_KEY, JSON.stringify(allLocal));
        } catch {}

        callback(merged);
      },
      (err) => {
        console.debug('subscribeToSuperAdminConversations note:', err);
      }
    );
  } catch (err) {
    console.debug('subscribeToSuperAdminConversations catch:', err);
  }

  const handleBus = () => callback(loadLocalSupport());
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_ALL_CONVS_KEY || e.key === LOCAL_SYNC_PING_KEY) {
      callback(loadLocalSupport());
    }
  };

  chatBus?.addEventListener('message', handleBus);
  window.addEventListener('tp_live_chat_event', handleBus);
  window.addEventListener('storage', handleStorage);

  return () => {
    unsubscribeFirestore();
    chatBus?.removeEventListener('message', handleBus);
    window.removeEventListener('tp_live_chat_event', handleBus);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Konuşmayı okundu olarak işaretle
 */
export async function markConversationAsRead(
  conversationId: string,
  reader: 'customer' | 'tenant' | 'superadmin'
): Promise<void> {
  // 1. Yerel depoyu güncelle
  try {
    const list = getLocalConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (conv) {
      if (reader === 'tenant') conv.unreadCountTenant = 0;
      if (reader === 'customer') conv.unreadCountCustomer = 0;
      if (reader === 'superadmin') conv.unreadCountSuperAdmin = 0;
      localStorage.setItem(LOCAL_ALL_CONVS_KEY, JSON.stringify(list));
      broadcastChatEvent({ type: 'CONV_UPDATED', conversation: conv });
    }
  } catch {}

  // 2. Firestore'u güncelle
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const updates: Record<string, any> = {};
    if (reader === 'tenant') updates.unreadCountTenant = 0;
    if (reader === 'customer') updates.unreadCountCustomer = 0;
    if (reader === 'superadmin') updates.unreadCountSuperAdmin = 0;
    await updateDoc(convRef, updates);
  } catch {}
}
