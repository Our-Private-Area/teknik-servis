import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Headphones,
  Users,
  CheckCheck,
  PlusCircle,
  ExternalLink,
  Phone,
  Sparkles,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { useTenantStore } from '../../../store/tenantStore';
import { useAuthStore } from '../../../store/authStore';
import { Conversation, ChatMessage } from '../../../types/chat';
import {
  subscribeToTenantConversations,
  subscribeToMessages,
  sendChatMessage,
  markConversationAsRead,
  getOrCreateTenantAdminSupportConversation,
} from '../../../services/chatService';
import './MessagesPage.css';

export default function MessagesPage() {
  const { currentTenant, tenants, setCurrentTenant } = useTenantStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'customers' | 'support'>('customers');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Mobil & Tablet görünüm durumu: 'list' (sohbet listesi) veya 'chat' (aktif mesajlaşma penceresi)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. İşletmenin tüm konuşma odalarını canlı dinle
  useEffect(() => {
    if (!currentTenant?.id) return;

    const unsubscribe = subscribeToTenantConversations(currentTenant.id, (list) => {
      setConversations(list);

      // Masaüstü ekranlarda (>= 992px) henüz seçili konuşma yoksa ilkini otomatik seç
      if (!selectedConv && list.length > 0 && activeTab === 'customers') {
        const firstCust = list.find((c) => c.type === 'customer_tenant');
        if (firstCust) {
          setSelectedConv(firstCust);
          if (window.innerWidth >= 992) {
            setMobileView('chat');
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentTenant?.id]);

  // 2. Sekme değiştiğinde
  useEffect(() => {
    if (activeTab === 'support') {
      // Platform Destek Kanalını getir/oluştur
      getOrCreateTenantAdminSupportConversation(currentTenant.id, currentTenant.name).then((supportConv) => {
        setSelectedConv(supportConv);
        if (window.innerWidth >= 992) {
          setMobileView('chat');
        }
      });
    } else {
      const firstCust = conversations.find((c) => c.type === 'customer_tenant');
      if (window.innerWidth >= 992) {
        setSelectedConv(firstCust || null);
      }
    }
  }, [activeTab, currentTenant?.id]);

  // 3. Seçili konuşmanın mesajlarını canlı dinle
  useEffect(() => {
    if (!selectedConv?.id) {
      setMessages([]);
      return;
    }

    // Okundu olarak işaretle
    markConversationAsRead(selectedConv.id, 'tenant');

    const unsubscribe = subscribeToMessages(selectedConv.id, (newMsgs) => {
      setMessages(newMsgs);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedConv?.id]);

  // Mesajlar değiştikçe en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mesaj Gönder
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend || !selectedConv || isSending) return;

    setIsSending(true);
    if (!textOverride) setInputText('');

    try {
      await sendChatMessage({
        conversationId: selectedConv.id,
        tenantId: currentTenant.id,
        senderType: 'tenant',
        senderId: currentUser?.id || 'tenant_admin',
        senderName: currentTenant.brandName || currentTenant.name,
        text: textToSend,
        isSupportChannel: activeTab === 'support',
      });
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Müşteri konuşmalarını filtrele
  const customerConversations = conversations.filter((c) => c.type === 'customer_tenant');
  const filteredCustomers = customerConversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = c.customer?.name?.toLowerCase().includes(q);
    const phoneMatch = c.customer?.phone?.includes(q);
    const msgMatch = c.lastMessage?.toLowerCase().includes(q);
    return nameMatch || phoneMatch || msgMatch;
  });

  const totalUnreadCustomers = customerConversations.reduce(
    (acc, curr) => acc + (curr.unreadCountTenant || 0),
    0
  );

  // Destek kanalı okunmadı kontrolü
  const supportConv = conversations.find((c) => c.type === 'tenant_superadmin');
  const unreadSupportCount = supportConv?.unreadCountTenant || 0;

  const quickReplies = [
    'Cihazınızı servisimize getirebilirsiniz, ücretsiz arıza tespiti yapalım.',
    'Parça stok durumunu kontrol edip size en kısa sürede fiyat bilgisi ileteceğiz.',
    'Cihazınızın onarımı tamamlandığında SMS ve sistem üzerinden bilgilendirileceksiniz.',
    'İşlem ortalama 1-2 iş günü içerisinde tamamlanmaktadır.',
  ];

  return (
    <div className={`tp-messages-page tp-messages-page--view-${mobileView}`}>
      {/* Sol Sütun: Konuşmalar Listesi */}
      <aside className="tp-messages-sidebar">
        <div className="tp-messages-sidebar__header">
          <div className="tp-messages-sidebar__title-row">
            <h2 className="tp-messages-sidebar__title">
              <MessageSquare size={18} color="var(--accent-primary, #3b82f6)" />
              <span>Canlı Mesajlar</span>
            </h2>
          </div>

          {/* Aktif İşletme Göstergesi & Hızlı Seçici */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={12} color="var(--accent-primary, #3b82f6)" />
              İşletme:
            </span>
            <select
              value={currentTenant.id}
              onChange={(e) => {
                const found = tenants.find((t) => t.id === e.target.value);
                if (found) setCurrentTenant(found);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '180px',
              }}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a', color: 'white' }}>
                  {t.brandName || t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sekmeler: Müşteriler vs TeknikPro Destek */}
          <div className="tp-messages-tabs">
            <button
              type="button"
              className={`tp-messages-tab ${activeTab === 'customers' ? 'tp-messages-tab--active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={14} />
              <span>Müşteriler</span>
              {totalUnreadCustomers > 0 && (
                <span className="tp-messages-tab__badge">{totalUnreadCustomers}</span>
              )}
            </button>

            <button
              type="button"
              className={`tp-messages-tab ${activeTab === 'support' ? 'tp-messages-tab--active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <Headphones size={14} />
              <span>TeknikPro Destek</span>
              {unreadSupportCount > 0 && (
                <span className="tp-messages-tab__badge">{unreadSupportCount}</span>
              )}
            </button>
          </div>

          {/* Arama Alanı (Sadece müşteri sekmesinde) */}
          {activeTab === 'customers' && (
            <div className="tp-messages-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Müşteri adı, tel veya mesaj ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Konuşma Kartları */}
        <div className="tp-conv-list">
          {activeTab === 'customers' ? (
            filteredCustomers.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: 13 }}>
                Henüz müşteri mesajı bulunmuyor. Web sayfanızdaki Canlı Destek butonundan müşteriler yazdıkça buraya anlık düşer.
              </div>
            ) : (
              filteredCustomers.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const timeStr = conv.lastMessageAt
                  ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={conv.id}
                    className={`tp-conv-item ${isSelected ? 'tp-conv-item--active' : ''}`}
                    onClick={() => {
                      setSelectedConv(conv);
                      setMobileView('chat');
                    }}
                  >
                    <div className="tp-conv-item__avatar">
                      {conv.customer?.name?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div className="tp-conv-item__content">
                      <div className="tp-conv-item__top">
                        <span className="tp-conv-item__name">
                          {conv.customer?.name || 'Ziyaretçi'}
                        </span>
                        <span className="tp-conv-item__time">{timeStr}</span>
                      </div>
                      <div className="tp-conv-item__bottom">
                        <p className="tp-conv-item__preview">
                          {conv.lastMessage || 'Yeni sohbet'}
                        </p>
                        {conv.unreadCountTenant > 0 && (
                          <span className="tp-conv-item__badge">{conv.unreadCountTenant}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Platform Destek Sekmesi */
            <div
              className={`tp-conv-item ${selectedConv?.type === 'tenant_superadmin' ? 'tp-conv-item--active' : ''}`}
              onClick={() => {
                if (supportConv) setSelectedConv(supportConv);
                setMobileView('chat');
              }}
            >
              <div className="tp-conv-item__avatar" style={{ color: '#10b981' }}>
                <Headphones size={20} />
              </div>
              <div className="tp-conv-item__content">
                <div className="tp-conv-item__top">
                  <span className="tp-conv-item__name" style={{ color: '#10b981' }}>
                    TeknikPro Yönetim Masası
                  </span>
                </div>
                <div className="tp-conv-item__bottom">
                  <p className="tp-conv-item__preview">
                    {supportConv?.lastMessage || 'SaaS platform ekibine doğrudan mesaj gönderin'}
                  </p>
                  {unreadSupportCount > 0 && (
                    <span className="tp-conv-item__badge">{unreadSupportCount}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Sağ Sütun: Aktif Mesaj Akışı */}
      <main className="tp-messages-main">
        {selectedConv ? (
          <>
            {/* Header Bar */}
            <div className="tp-chat-header-bar">
              <div className="tp-chat-header-bar__left">
                {/* Mobil & Tablette Geri Dön Butonu */}
                <button
                  type="button"
                  className="tp-chat-back-btn"
                  onClick={() => setMobileView('list')}
                  title="Konuşmalara Dön"
                  aria-label="Konuşmalara Dön"
                >
                  <ArrowLeft size={18} />
                  <span>Sohbetler</span>
                </button>

                <div className="tp-chat-header-bar__user">
                  <div className="tp-chat-header-bar__avatar">
                    {activeTab === 'support' ? (
                      <Headphones size={18} color="#10b981" />
                    ) : (
                      selectedConv.customer?.name?.charAt(0).toUpperCase() || 'M'
                    )}
                  </div>
                  <div className="tp-chat-header-bar__info">
                    <h3 className="tp-chat-header-bar__name">
                      {activeTab === 'support'
                        ? 'TeknikPro Süper Admin & Platform Desteği'
                        : selectedConv.customer?.name || 'Ziyaretçi'}
                    </h3>
                    <div className="tp-chat-header-bar__sub">
                      {activeTab === 'customers' ? (
                        <>
                          {selectedConv.customer?.phone && (
                            <span className="tp-chat-header-phone">
                              <Phone size={11} />
                              <a
                                href={`tel:${selectedConv.customer.phone}`}
                                style={{ color: 'inherit', textDecoration: 'none' }}
                              >
                                {selectedConv.customer.phone}
                              </a>
                            </span>
                          )}
                          {selectedConv.customer?.phone && <span className="tp-chat-header-sep">•</span>}
                          <span className="tp-chat-header-room">
                            Oda: <code>{selectedConv.customer?.sessionId?.substring(0, 8)}</code>
                          </span>
                        </>
                      ) : (
                        <span>Resmi platform destek kanalı</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="tp-chat-header-bar__actions">
                {activeTab === 'customers' && (
                  <Link
                    to={`/panel/servisler/yeni?musteri=${encodeURIComponent(
                      selectedConv.customer?.name || ''
                    )}&telefon=${encodeURIComponent(selectedConv.customer?.phone || '')}`}
                    className="tp-chat-action-btn tp-chat-action-btn--primary"
                    title="Bu müşteriye hemen servis kaydı aç"
                  >
                    <PlusCircle size={15} />
                    <span className="tp-chat-btn-text">Servis Kaydı Aç</span>
                  </Link>
                )}

                <a
                  href={`/${currentTenant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tp-chat-action-btn"
                  title="Web sitenizdeki canlı widget'ı test edin"
                >
                  <ExternalLink size={15} />
                  <span className="tp-chat-btn-text">Sitede Test Et</span>
                </a>
              </div>
            </div>

            {/* Mesaj Akışı */}
            <div className="tp-chat-stream">
              {messages.length === 0 ? (
                <div className="tp-chat-empty">
                  <Sparkles size={28} color="var(--accent-primary, #3b82f6)" />
                  <h3>Henüz bir mesaj gönderilmedi</h3>
                  <p>
                    {activeTab === 'support'
                      ? 'Platform ekibimizle görüşmek için aşağıdan ilk sorunuzu yazabilirsiniz.'
                      : 'Müşterinize ilk karşılama veya bilgi mesajını yazarak iletişimi başlatabilirsiniz.'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderType === 'tenant';
                  const timeFormatted = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={msg.id}
                      className={`tp-chat-row ${isMe ? 'tp-chat-row--me' : 'tp-chat-row--other'}`}
                    >
                      <div className="tp-chat-bubble">{msg.text}</div>
                      <div className="tp-chat-meta">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{timeFormatted}</span>
                        {isMe && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hızlı Cevap Şablonları (Müşteri sekmesinde) */}
            {activeTab === 'customers' && (
              <div className="tp-chat-quick-replies">
                <span className="tp-quick-reply-label">
                  Hızlı:
                </span>
                {quickReplies.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="tp-quick-reply-btn"
                    onClick={() => handleSendMessage(r)}
                    title={r}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Mesaj Giriş Çubuğu */}
            <div className="tp-chat-input-bar">
              <input
                type="text"
                placeholder={
                  activeTab === 'support'
                    ? 'TeknikPro Süper Admin ekibine mesaj yazın... (Enter)'
                    : 'Müşteriye yanıt yazın... (Enter)'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                title="Gönder"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="tp-chat-empty">
            <MessageSquare size={40} color="var(--accent-primary, #3b82f6)" />
            <h3>Bir Konuşma Seçin</h3>
            <p>
              Müşterileriniz web sayfanızdan yazdıkça sol listede belirecektir. Ya da TeknikPro Destek sekmesinden platform yöneticileriyle iletişime geçebilirsiniz.
            </p>
            <button
              type="button"
              className="tp-chat-back-btn"
              style={{ display: 'inline-flex', marginTop: 12 }}
              onClick={() => setMobileView('list')}
            >
              <ArrowLeft size={16} />
              <span>Konuşma Listesini Göster</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
