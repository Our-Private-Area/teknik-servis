import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  ExternalLink,
  Save,
  Clock,
  Wrench,
  User,
  CreditCard,
  Plus,
  CheckCircle2,
  FileText,
  Smartphone,
  Shield,
  Send,
  MessageSquare
} from 'lucide-react';
import { useServiceStore } from '../../../store/serviceStore';
import { SERVICE_STATUS_MAP, ServiceStatus } from '../../../types';
import toast from 'react-hot-toast';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getServiceById, updateServiceStatus, addServiceNote, updateService } = useServiceStore();

  const service = getServiceById(id || '');

  // Form states for editable fields
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus>(service?.status || 'received');
  const [statusNote, setStatusNote] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);

  // Financials editable
  const [partsCost, setPartsCost] = useState(service?.partsCost ?? 0);
  const [laborCost, setLaborCost] = useState(service?.laborCost ?? 0);
  const [paidAmount, setPaidAmount] = useState(service?.paidAmount ?? 0);
  const [diagnosis, setDiagnosis] = useState(service?.diagnosis || '');
  const [performedWork, setPerformedWork] = useState(service?.performedWork || '');

  // Print voucher modal state
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!service) {
    return (
      <div className="service-not-found">
        <h2>Servis Kaydı Bulunamadı</h2>
        <p>Aradığınız kayıt silinmiş veya mevcut değil.</p>
        <Link to="/panel/servisler" className="btn-primary">Servis Listesine Dön</Link>
      </div>
    );
  }

  const statusConfig = SERVICE_STATUS_MAP[service.status];

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === service.status && !statusNote.trim()) {
      toast('Durumda bir değişiklik yapılmadı.');
      return;
    }

    updateServiceStatus(
      service.id,
      selectedStatus,
      statusNote.trim() || `Durum "${SERVICE_STATUS_MAP[selectedStatus].label}" olarak güncellendi.`,
      'Admin'
    );
    setStatusNote('');
    toast.success('Servis durumu güncellendi.');
  };

  const handleSaveDetails = () => {
    const total = Number(partsCost) + Number(laborCost);
    const remaining = Math.max(0, total - Number(paidAmount));
    const paymentStatus = remaining === 0 && total > 0 ? 'paid' : Number(paidAmount) > 0 ? 'partial' : 'pending';

    updateService(service.id, {
      partsCost: Number(partsCost),
      laborCost: Number(laborCost),
      totalCost: total,
      paidAmount: Number(paidAmount),
      remainingAmount: remaining,
      paymentStatus,
      diagnosis,
      performedWork,
    });

    toast.success('Servis detayları ve tutarlar kaydedildi.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    addServiceNote(service.id, {
      author: 'Admin',
      authorRole: 'admin',
      content: newNoteContent.trim(),
      isInternal: isInternalNote,
    });

    setNewNoteContent('');
    toast.success(isInternalNote ? 'Dahili servis notu eklendi.' : 'Müşteriye açık servis notu eklendi.');
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="service-detail-page">
      {/* Top Breadcrumb & Action Bar */}
      <div className="service-detail-header">
        <div className="service-detail-header__left">
          <Link to="/panel/servisler" className="btn-back">
            <ArrowLeft size={16} />
            <span>Servisler</span>
          </Link>
          <div className="service-title-row">
            <h1 className="service-title font-mono">{service.trackingNo}</h1>
            <div
              className="status-pill"
              style={{
                color: statusConfig?.color,
                backgroundColor: statusConfig?.bgColor,
                borderColor: statusConfig?.color,
              }}
            >
              <span>{statusConfig?.label}</span>
            </div>
            <span className={`priority-badge priority-badge--${service.priority}`}>
              {service.priority === 'urgent' ? 'Acil' : service.priority === 'critical' ? 'Kritik' : 'Normal'}
            </span>
            {service.isOnlineBooking && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(0, 113, 227, 0.12)',
                  color: '#0071e3',
                }}
              >
                🌐 Online Randevu ({service.deliveryMethod === 'cargo' ? '📦 Kargo' : '🏢 Elden'})
              </span>
            )}
          </div>
          <p className="service-subtitle">
            {service.deviceBrand} {service.deviceModel} • {service.customerName}
          </p>
        </div>

        <div className="service-detail-header__actions">
          <a
            href={`/servis-sorgulama/${service.trackingNo}`}
            target="_blank"
            rel="noreferrer"
            className="btn-header-action"
          >
            <ExternalLink size={16} />
            <span>Müşteri Ekranı</span>
          </a>
          <button
            type="button"
            className="btn-header-action"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer size={16} />
            <span>Servis Fişi Yazdır</span>
          </button>
          <button
            type="button"
            className="btn-header-save"
            onClick={handleSaveDetails}
          >
            <Save size={16} />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="service-detail-grid">
        {/* Left Column: Device Info & Operations */}
        <div className="service-detail-col">
          {/* Status Change Card */}
          <div className="detail-card detail-card--highlight">
            <h3 className="detail-card__title">Durum Güncelle</h3>
            <form onSubmit={handleStatusUpdate} className="status-update-form">
              <div className="status-form-row">
                <select
                  className="detail-input status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ServiceStatus)}
                >
                  {Object.entries(SERVICE_STATUS_MAP).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="detail-input status-note-input"
                  placeholder="İşlem notu (örn: Ekran takıldı, test aşamasına geçildi)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />

                <button type="submit" className="btn-update-status">
                  Güncelle
                </button>
              </div>
            </form>
          </div>

          {/* Device & Diagnostic Card */}
          <div className="detail-card">
            <div className="detail-card__header">
              <Wrench size={18} className="detail-card__icon" />
              <h3 className="detail-card__title">Cihaz & Arıza Teşhisi</h3>
            </div>

            <div className="detail-info-grid">
              <div>
                <span className="info-label">Cihaz Türü & Model:</span>
                <span className="info-val">{service.deviceType} — {service.deviceBrand} {service.deviceModel}</span>
              </div>
              <div>
                <span className="info-label">Seri No / IMEI:</span>
                <span className="info-val font-mono">{service.serialNo || service.imei || 'Belirtilmedi'}</span>
              </div>
              <div>
                <span className="info-label">Kilit Şifresi:</span>
                <span className="info-val font-mono">{service.devicePassword || 'Şifre Yok'}</span>
              </div>
              <div>
                <span className="info-label">Aksesuarlar:</span>
                <span className="info-val">
                  {service.accessoriesReceived?.length ? service.accessoriesReceived.join(', ') : 'Yok'}
                </span>
              </div>
            </div>

            <div className="detail-field">
              <label className="field-label">Müşteri Şikayeti:</label>
              <div className="complaint-quote">{service.complaint}</div>
            </div>

            <div className="detail-field">
              <label className="field-label">Fiziksel Durum:</label>
              <div className="info-val">{service.physicalCondition || 'Normal kullanım'}</div>
            </div>

            <div className="detail-field">
              <label className="field-label">Teknik Teşhis & İnceleme:</label>
              <textarea
                rows={2}
                className="detail-textarea"
                placeholder="Arıza tespiti ve hasarlı bileşenler..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div className="detail-field">
              <label className="field-label">Yapılan İşlemler (Müşteri Görebilir):</label>
              <textarea
                rows={2}
                className="detail-textarea"
                placeholder="Montaj, onarım, temizlik, kalibrasyon vb. yapılan işlemler..."
                value={performedWork}
                onChange={(e) => setPerformedWork(e.target.value)}
              />
            </div>
          </div>

          {/* Service Notes & Log */}
          <div className="detail-card">
            <div className="detail-card__header">
              <MessageSquare size={18} className="detail-card__icon" />
              <h3 className="detail-card__title">Servis Notları ({service.notes?.length || 0})</h3>
            </div>

            <form onSubmit={handleAddNote} className="note-input-box">
              <textarea
                rows={2}
                className="detail-textarea"
                placeholder="Yeni not ekleyin..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="note-input-bar">
                <label className="note-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <span>Dahili Not (Sadece Personel Görür)</span>
                </label>
                <button type="submit" className="btn-add-note">
                  <Send size={14} />
                  <span>Not Ekle</span>
                </button>
              </div>
            </form>

            <div className="notes-stream">
              {service.notes && service.notes.length > 0 ? (
                service.notes.map((note) => (
                  <div key={note.id} className={`note-bubble ${note.isInternal ? 'note-bubble--internal' : 'note-bubble--public'}`}>
                    <div className="note-bubble__header">
                      <span className="note-author">{note.author}</span>
                      <span className={`note-type ${note.isInternal ? 'note-type--internal' : 'note-type--public'}`}>
                        {note.isInternal ? 'Dahili Not' : 'Müşteriye Açık'}
                      </span>
                      <span className="note-date">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="note-text">{note.content}</p>
                  </div>
                ))
              ) : (
                <span className="text-muted text-sm">Henüz not eklenmemiş.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer, Financials, Timeline */}
        <div className="service-detail-col">
          {/* Customer Card */}
          <div className="detail-card">
            <div className="detail-card__header">
              <User size={18} className="detail-card__icon" />
              <h3 className="detail-card__title">Müşteri Bilgileri</h3>
            </div>
            <div className="customer-info-box">
              <div className="customer-info-name">{service.customerName}</div>
              {service.customerPhone && (
                <div style={{ fontSize: '13px', color: '#10b981', marginTop: '3px', fontWeight: 500 }}>
                  📞 {service.customerPhone}
                </div>
              )}
              {service.customerAddress && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  📍 Teslimat Adresi: {service.customerAddress}
                </div>
              )}
              {service.preferredAppointmentDate && (
                <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>
                  🗓️ Tercih Edilen Randevu: {service.preferredAppointmentDate}
                </div>
              )}
              <div className="customer-info-sub" style={{ marginTop: '6px' }}>Atanan Personel: {service.assignedStaffName || 'Atanmadı'}</div>
              <div className="customer-actions">
                <a
                  href={`https://wa.me/${service.customerPhone ? service.customerPhone.replace(/\D/g, '') : ''}?text=Sayın%20Müşterimiz,%20${service.trackingNo}%20numaralı%20cihazınızın%20durumu:%20${statusConfig?.label}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp-notify"
                >
                  WhatsApp Bilgilendirme Gönder
                </a>
              </div>
            </div>
          </div>

          {/* Pricing & Cash */}
          <div className="detail-card">
            <div className="detail-card__header">
              <CreditCard size={18} className="detail-card__icon" />
              <h3 className="detail-card__title">Hesap ve Ödeme</h3>
            </div>

            <div className="pricing-edit-table">
              <div className="pricing-edit-row">
                <span>Yedek Parça Tutarı:</span>
                <div className="currency-input-wrap">
                  <span>₺</span>
                  <input
                    type="number"
                    min="0"
                    className="detail-input number-input"
                    value={partsCost}
                    onChange={(e) => setPartsCost(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pricing-edit-row">
                <span>İşçilik Bedeli:</span>
                <div className="currency-input-wrap">
                  <span>₺</span>
                  <input
                    type="number"
                    min="0"
                    className="detail-input number-input"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pricing-divider" />

              <div className="pricing-edit-row pricing-edit-row--total">
                <span>Toplam Servis Ücreti:</span>
                <span className="total-highlight">₺{(Number(partsCost) + Number(laborCost)).toLocaleString('tr-TR')}</span>
              </div>

              <div className="pricing-edit-row">
                <span>Alınan / Tahsil Edilen:</span>
                <div className="currency-input-wrap">
                  <span>₺</span>
                  <input
                    type="number"
                    min="0"
                    className="detail-input number-input text-green"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pricing-edit-row pricing-edit-row--remaining">
                <span>Kalan Alacak / Bakiye:</span>
                <span className="remaining-highlight">
                  ₺{Math.max(0, (Number(partsCost) + Number(laborCost)) - Number(paidAmount)).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="detail-card">
            <div className="detail-card__header">
              <Clock size={18} className="detail-card__icon" />
              <h3 className="detail-card__title">İşlem Tarihçesi</h3>
            </div>

            <div className="history-timeline">
              {service.statusHistory.map((item, idx) => {
                const sConf = SERVICE_STATUS_MAP[item.status as ServiceStatus];
                return (
                  <div key={idx} className="timeline-node">
                    <div className="timeline-dot" style={{ borderColor: sConf?.color || '#3b82f6' }} />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status" style={{ color: sConf?.color }}>
                          {sConf?.label || item.status}
                        </span>
                        <span className="timeline-date">{formatDate(item.timestamp)}</span>
                      </div>
                      <p className="timeline-note">{item.note}</p>
                      <span className="timeline-user">İşlem: {item.updatedBy || 'Sistem'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Service Voucher Modal */}
      {showPrintModal && (
        <div className="print-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="print-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <h2>TeknikPro Servis</h2>
                <p>Teknik Servis ve Bilişim Hizmetleri</p>
                <small>Tel: 0850 300 40 50 • www.teknikpro.com</small>
              </div>
              <div className="voucher-qr font-mono">
                <div className="barcode-mock">||| | |||| | ||||| |||</div>
                <span>{service.trackingNo}</span>
              </div>
            </div>

            <div className="voucher-divider" />

            <div className="voucher-grid">
              <div>
                <strong>Müşteri:</strong> {service.customerName}
              </div>
              <div>
                <strong>Tarih:</strong> {formatDate(service.receivedDate)}
              </div>
              <div>
                <strong>Cihaz:</strong> {service.deviceBrand} {service.deviceModel}
              </div>
              <div>
                <strong>Seri/IMEI:</strong> {service.serialNo || service.imei || '-'}
              </div>
            </div>

            <div className="voucher-field">
              <strong>Arıza Şikayeti:</strong> {service.complaint}
            </div>

            <div className="voucher-field">
              <strong>Alınan Aksesuarlar:</strong> {service.accessoriesReceived?.join(', ') || 'Yok'}
            </div>

            <div className="voucher-pricing">
              <div>Toplam Tahmini Tutar: <strong>₺{(service.totalCost || service.estimatedCost || 0).toLocaleString('tr-TR')}</strong></div>
              <div>Alınan Ön Ödeme: <strong>₺{(service.paidAmount || 0).toLocaleString('tr-TR')}</strong></div>
              <div>Kalan Bakiye: <strong>₺{(service.remainingAmount || 0).toLocaleString('tr-TR')}</strong></div>
            </div>

            <div className="voucher-terms">
              <strong>Servis Şartları:</strong>
              <p>
                1. 30 gün içerisinde teslim alınmayan cihazlardan firmamız sorumlu değildir.<br />
                2. Sıvı temaslı cihazlarda garanti verilmemektedir.<br />
                3. Onarım durumunu www.teknikpro.com/takip adresinden <strong>{service.trackingNo}</strong> takip numarasıyla sorgulayabilirsiniz.
              </p>
            </div>

            <div className="voucher-signatures">
              <div>Teslim Eden (Müşteri)</div>
              <div>Teslim Alan (TeknikPro)</div>
            </div>

            <div className="voucher-modal-actions">
              <button
                type="button"
                className="btn-print-now"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Yazdır / PDF Kaydet
              </button>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowPrintModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
