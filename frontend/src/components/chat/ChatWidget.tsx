import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Sparkles,
  CheckCheck,
  User,
  Phone,
} from 'lucide-react';
import { Tenant } from '../../types';
import { ChatMessage, Conversation } from '../../types/chat';
import {
  getOrCreateCustomerConversation,
  sendChatMessage,
  subscribeToMessages,
  markConversationAsRead,
} from '../../services/chatService';
import './ChatWidget.css';

interface ChatWidgetProps {
  tenant: Tenant;
}

export default function ChatWidget({ tenant }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const primaryColor = tenant.theme?.primaryColor || '#0071e3';

  // 1. Session ve Yerel Bilgileri Yükle
  useEffect(() => {
    const sessionKey = `tp_chat_session_${tenant.id}`;
    let sid = localStorage.getItem(sessionKey);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(sessionKey, sid);
    }
    setSessionId(sid);

    const savedName = localStorage.getItem(`tp_chat_name_${tenant.id}`);
    const savedPhone = localStorage.getItem(`tp_chat_phone_${tenant.id}`);
    if (savedName) {
      setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
      // Daha önceden konuşma başlatılmışsa direkt hazırla
      initConversation(sid, savedName, savedPhone || undefined);
    }
  }, [tenant.id]);

  // Konuşma odasını bağla
  const initConversation = async (sid: string, name: string, phone?: string) => {
    try {
      const conv = await getOrCreateCustomerConversation(tenant.id, tenant.name, {
        sessionId: sid,
        name: name.trim(),
        phone: phone ? phone.trim() : undefined,
      });
      setConversation(conv);
      setIsInitialized(true);
      if (conv.unreadCountCustomer > 0) {
        setUnreadCount(conv.unreadCountCustomer);
      }
    } catch (err) {
      console.warn('Chat init error:', err);
    }
  };

  // 2. Canlı Mesajları Dinle (onSnapshot)
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToMessages(conversation.id, (newMsgs) => {
      setMessages(newMsgs);
      // Chat kapalıyken işletmeden mesaj gelirse unreadCount artır
      if (!isOpen) {
        const tenantMsgs = newMsgs.filter((m) => m.senderType === 'tenant' && !m.isRead);
        setUnreadCount(tenantMsgs.length);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversation?.id, isOpen]);

  // Chat açıldığında okundu işaretle
  useEffect(() => {
    if (isOpen && conversation?.id) {
      setUnreadCount(0);
      markConversationAsRead(conversation.id, 'customer');
    }
  }, [isOpen, conversation?.id]);

  // Yeni mesaj geldiğinde alta kaydır
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // İlk Başlangıç Formu Gönderimi
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    localStorage.setItem(`tp_chat_name_${tenant.id}`, customerName.trim());
    if (customerPhone.trim()) {
      localStorage.setItem(`tp_chat_phone_${tenant.id}`, customerPhone.trim());
    }

    await initConversation(sessionId, customerName, customerPhone);
  };

  // Mesaj Gönder
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    if (!customText) setInputText('');

    try {
      let activeConv = conversation;
      if (!activeConv) {
        activeConv = await getOrCreateCustomerConversation(tenant.id, tenant.name, {
          sessionId,
          name: customerName || 'Ziyaretçi',
          phone: customerPhone || undefined,
        });
        setConversation(activeConv);
        setIsInitialized(true);
      }

      await sendChatMessage({
        conversationId: activeConv.id,
        tenantId: tenant.id,
        senderType: 'customer',
        senderId: sessionId,
        senderName: customerName || 'Ziyaretçi',
        text: textToSend,
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

  const quickQuestions = [
    'Ekran / batarya değişimi fiyatı alabilir miyim?',
    'Cihazımı ne zaman teslim alabilirim?',
    'Servis adresiniz ve mesai saatleriniz nedir?',
  ];

  return (
    <div
      className="tp-chat-widget-root"
      style={{ '--chat-primary': primaryColor } as React.CSSProperties}
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="tp-chat-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Canlı Destek Başlat"
        >
          <MessageCircle size={20} />
          <span>Canlı Destek</span>
          {unreadCount > 0 && <span className="tp-chat-trigger__badge">{unreadCount}</span>}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="tp-chat-window">
          {/* Header */}
          <div className="tp-chat-header">
            <div className="tp-chat-header__info">
              <div className="tp-chat-header__avatar">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="tp-chat-header__title">
                  <span>{tenant.brandName || tenant.name}</span>
                </h3>
                <div className="tp-chat-header__status">
                  <span className="tp-chat-header__status-dot" />
                  <span>Çevrimiçi • Canlı Destek</span>
                </div>
              </div>
            </div>

            <div className="tp-chat-header__actions">
              <button
                type="button"
                className="tp-chat-header__btn"
                onClick={() => setIsOpen(false)}
                title="Simge Durumuna Küçült"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                className="tp-chat-header__btn"
                onClick={() => setIsOpen(false)}
                title="Kapat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="tp-chat-body">
            {!isInitialized ? (
              /* Ziyaretçi Karşılama ve Bilgi Formu */
              <div className="tp-chat-welcome">
                <Sparkles size={24} color={primaryColor} style={{ marginBottom: 6 }} />
                <h4>{tenant.brandName || tenant.name} Canlı Destek</h4>
                <p style={{ margin: 0 }}>
                  Teknik servis ekibimizle anında yazışmak için lütfen adınızı belirtin.
                </p>

                <form onSubmit={handleStartChat} className="tp-chat-init-form">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="tp-chat-init-input"
                      placeholder="Adınız ve Soyadınız *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="tp-chat-init-input"
                      placeholder="Telefon Numaranız (İsteğe bağlı)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="tp-chat-init-btn">
                    Sohbete Başla
                  </button>
                </form>
              </div>
            ) : (
              /* Canlı Mesaj Listesi */
              <>
                {/* İlk karşılama mesajı */}
                <div className="tp-chat-msg-row tp-chat-msg-row--tenant">
                  <div className="tp-chat-msg-bubble">
                    Merhaba <strong>{customerName}</strong>! {tenant.brandName || tenant.name} servisine hoş geldiniz. Size nasıl yardımcı olabiliriz?
                  </div>
                  <div className="tp-chat-msg-meta">
                    <span>{tenant.brandName || tenant.name}</span>
                  </div>
                </div>

                {/* Hızlı soru önerileri (Henüz mesaj az ise) */}
                {messages.length < 2 && (
                  <div className="tp-chat-chips">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="tp-chat-chip"
                        onClick={() => handleSendMessage(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Gerçek zamanlı mesajlar */}
                {messages.map((msg) => {
                  const isMe = msg.senderType === 'customer';
                  const timeFormatted = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={msg.id}
                      className={`tp-chat-msg-row ${
                        isMe ? 'tp-chat-msg-row--customer' : 'tp-chat-msg-row--tenant'
                      }`}
                    >
                      <div className="tp-chat-msg-bubble">{msg.text}</div>
                      <div className="tp-chat-msg-meta">
                        <span>{timeFormatted}</span>
                        {isMe && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Input Bar */}
          {isInitialized && (
            <div className="tp-chat-footer">
              <input
                type="text"
                className="tp-chat-input"
                placeholder="Mesajınızı yazın... (Enter)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <button
                type="button"
                className="tp-chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                title="Gönder"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
