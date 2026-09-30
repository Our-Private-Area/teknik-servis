import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Smartphone,
  Wrench,
  CreditCard,
  CheckSquare,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { useServiceStore } from '../../../store/serviceStore';
import { useCustomerStore } from '../../../store/customerStore';
import { useTenantCustomers } from '../../../hooks/useTenantData';
import { Priority } from '../../../types';
import toast from 'react-hot-toast';
import './NewService.css';

const ACCESSORY_OPTIONS = [
  'Orijinal Şarj Cihazı / Adaptör',
  'Şarj Kablosu',
  'Cihaz Kutusu',
  'Koruyucu Kılıf',
  'SIM Kart / Hafıza Kartı',
  'Laptop Çantası',
  'Mouse / Klavye',
];

export default function NewService() {
  const navigate = useNavigate();
  const { addService } = useServiceStore();
  const { addCustomer } = useCustomerStore();
  const customers = useTenantCustomers();

  // Mode: existing vs new customer
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Customer form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Device fields
  const [deviceType, setDeviceType] = useState('Telefon');
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [imei, setImei] = useState('');
  const [devicePassword, setDevicePassword] = useState('');

  // Service details
  const [complaint, setComplaint] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>('normal');
  const [assignedStaffName, setAssignedStaffName] = useState('Murat Usta');

  // Costs
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = customerName;

    if (customerMode === 'new') {
      if (!customerName.trim() || !customerPhone.trim()) {
        toast.error('Lütfen müşteri adı ve telefon numarasını giriniz.');
        return;
      }
      const newCust = addCustomer({
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        address: customerAddress.trim() || undefined,
      });
      finalCustomerId = newCust.id;
      finalCustomerName = newCust.fullName;
    } else {
      const existing = customers.find((c) => c.id === selectedCustomerId);
      if (!existing) {
        toast.error('Lütfen listeden bir müşteri seçiniz.');
        return;
      }
      finalCustomerId = existing.id;
      finalCustomerName = existing.fullName;
    }

    if (!deviceBrand.trim() || !deviceModel.trim()) {
      toast.error('Lütfen cihaz marka ve modelini belirtiniz.');
      return;
    }

    if (!complaint.trim()) {
      toast.error('Lütfen arıza şikayetini giriniz.');
      return;
    }

    const newRecord = addService({
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      assignedStaffName,
      deviceType,
      deviceBrand,
      deviceModel,
      serialNo: serialNo.trim() || undefined,
      imei: imei.trim() || undefined,
      devicePassword: devicePassword.trim() || undefined,
      complaint: complaint.trim(),
      priority,
      estimatedCost: Number(estimatedCost) || 0,
      laborCost: 0,
      partsCost: 0,
      totalCost: Number(estimatedCost) || 0,
      paidAmount: Number(paidAmount) || 0,
      remainingAmount: Math.max(0, (Number(estimatedCost) || 0) - (Number(paidAmount) || 0)),
      paymentStatus: (Number(paidAmount) || 0) >= (Number(estimatedCost) || 0) && Number(estimatedCost) > 0 ? 'paid' : (Number(paidAmount) || 0) > 0 ? 'partial' : 'pending',
      accessoriesReceived: selectedAccessories,
      physicalCondition: physicalCondition.trim() || 'Hasar kaydı yok, normal kullanım.',
      receivedDate: new Date().toISOString(),
    });

    toast.success(`Yeni servis kaydı oluşturuldu! Takip No: ${newRecord.trackingNo}`);
    navigate(`/panel/servisler/${newRecord.id}`);
  };

  return (
    <div className="new-service-page">
      {/* Header */}
      <div className="new-service-page__header">
        <Link to="/panel/servisler" className="btn-back">
          <ArrowLeft size={16} />
          <span>Servis Listesine Dön</span>
        </Link>
        <h1 className="new-service-page__title">Yeni Servis Kabul Kaydı</h1>
        <p className="new-service-page__subtitle">
          Müşteri teslim formu ve teknik servis kabul belgesi oluşturun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="new-service-form">
        {/* Step 1: Customer Information */}
        <div className="form-card">
          <div className="form-card__header">
            <User size={18} className="form-card__icon" />
            <h2 className="form-card__title">1. Müşteri Bilgileri</h2>
          </div>

          <div className="customer-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${customerMode === 'new' ? 'mode-btn--active' : ''}`}
              onClick={() => setCustomerMode('new')}
            >
              + Yeni Müşteri Oluştur
            </button>
            <button
              type="button"
              className={`mode-btn ${customerMode === 'existing' ? 'mode-btn--active' : ''}`}
              onClick={() => setCustomerMode('existing')}
            >
              Kayıtlı Müşterilerden Seç
            </button>
          </div>

          {customerMode === 'existing' ? (
            <div className="form-group">
              <label className="form-label">Kayıtlı Müşteri Seçin *</label>
              <select
                className="form-control"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                <option value="">-- Müşteri Seçin --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Müşteri Adı Soyadı / Firma *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Numarası *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Örn: 0532 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-posta Adresi</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ornek@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adres / Semt</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Kadıköy / İstanbul"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Device Information */}
        <div className="form-card">
          <div className="form-card__header">
            <Smartphone size={18} className="form-card__icon" />
            <h2 className="form-card__title">2. Cihaz Bilgileri</h2>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Cihaz Türü *</label>
              <select
                className="form-control"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              >
                <option value="Telefon">Akıllı Telefon</option>
                <option value="Laptop">Laptop / Notebook</option>
                <option value="Tablet">Tablet</option>
                <option value="Masaüstü">Masaüstü PC</option>
                <option value="Konsol">Oyun Konsolu</option>
                <option value="Akıllı Saat">Akıllı Saat</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marka *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Apple, Samsung, ASUS"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: iPhone 15 Pro, S24, ROG Strix"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seri Numarası</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="Örn: C02ZX..."
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IMEI Numarası</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="Örn: 3548..."
                value={imei}
                onChange={(e) => setImei(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kilit Şifresi / Deseni</label>
              <input
                type="text"
                className="form-control"
                placeholder="Test için gerekli şifre"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Arıza & Teslim Alınanlar */}
        <div className="form-card">
          <div className="form-card__header">
            <Wrench size={18} className="form-card__icon" />
            <h2 className="form-card__title">3. Arıza Bildirimi ve Fiziksel Kontrol</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Müşteri Şikayeti / Arıza Tanımı *</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Cihazda görülen arıza, darbe, sıvı teması veya müşterinin bildirdiği problem..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cihazın Fiziksel Durumu</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: Ekranda derin çizikler, sol köşede ezilme, arka kapak sağlam..."
              value={physicalCondition}
              onChange={(e) => setPhysicalCondition(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teslim Alınan Aksesuarlar</label>
            <div className="accessory-chips">
              {ACCESSORY_OPTIONS.map((acc) => {
                const isSelected = selectedAccessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    className={`accessory-chip ${isSelected ? 'accessory-chip--selected' : ''}`}
                    onClick={() => toggleAccessory(acc)}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}</span>
                    {acc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Servis Ataması ve Ücret */}
        <div className="form-card">
          <div className="form-card__header">
            <CreditCard size={18} className="form-card__icon" />
            <h2 className="form-card__title">4. Atama ve Finansal Detaylar</h2>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label className="form-label">İşlem Önceliği</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Acil (Hızlı Tamir)</option>
                <option value="critical">Kritik (Aynı Gün)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Atanan Teknisyen</label>
              <select
                className="form-control"
                value={assignedStaffName}
                onChange={(e) => setAssignedStaffName(e.target.value)}
              >
                <option value="Murat Usta">Murat Usta (Kıdemli)</option>
                <option value="Can Teknisyen">Can Teknisyen (Donanım)</option>
                <option value="Selin Personel">Selin Personel (Yazılım)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tahmini / Anlaşılan Ücret (₺)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="0"
                value={estimatedCost || ''}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alınan Kapora / Ön Ödeme (₺)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="0"
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          <Link to="/panel/servisler" className="btn-cancel">
            İptal
          </Link>
          <button type="submit" className="btn-submit">
            <Save size={18} />
            <span>Servis Kaydını Aç ve Fiş Üret</span>
          </button>
        </div>
      </form>
    </div>
  );
}
