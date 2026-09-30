import { useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Wrench, Wallet, UserPlus, Eye } from 'lucide-react';
import { useCustomerStore } from '../../../store/customerStore';
import { useTenantCustomers, useTenantServices } from '../../../hooks/useTenantData';
import toast from 'react-hot-toast';
import './CustomerList.css';

export default function CustomerList() {
  const { addCustomer } = useCustomerStore();
  const customers = useTenantCustomers();
  const services = useTenantServices();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New customer form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error('Ad ve telefon zorunludur.');
      return;
    }

    addCustomer({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
    });

    toast.success('Yeni müşteri eklendi.');
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowAddModal(false);
  };

  const getCustomerServiceCount = (customerId: string) => {
    return services.filter((s) => s.customerId === customerId).length;
  };

  return (
    <div className="customer-page">
      <div className="customer-page__header">
        <div>
          <h1 className="customer-page__title">Müşteri Yönetimi</h1>
          <p className="customer-page__subtitle">Müşteri listesi, iletişim bilgileri ve servis geçmişleri.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} />
          <span>Yeni Müşteri Ekle</span>
        </button>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Müşteri adı, telefon veya e-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="customer-grid">
        {filtered.map((cust) => {
          const serviceCount = getCustomerServiceCount(cust.id);
          return (
            <div key={cust.id} className="customer-card">
              <div className="customer-card__top">
                <div className="customer-avatar">
                  {cust.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="customer-name">{cust.fullName}</h3>
                  <span className="customer-services-badge">
                    <Wrench size={12} />
                    {serviceCount} Servis Kaydı
                  </span>
                </div>
              </div>

              <div className="customer-info-list">
                <a href={`tel:${cust.phone}`} className="customer-info-item">
                  <Phone size={14} />
                  <span>{cust.phone}</span>
                </a>
                {cust.email && (
                  <a href={`mailto:${cust.email}`} className="customer-info-item">
                    <Mail size={14} />
                    <span>{cust.email}</span>
                  </a>
                )}
                {cust.address && (
                  <div className="customer-info-item">
                    <MapPin size={14} />
                    <span>{cust.address}</span>
                  </div>
                )}
              </div>

              <div className="customer-card__footer">
                <span className="customer-balance-label">Cari Bakiye:</span>
                <span className={`customer-balance-val ${cust.balance > 0 ? 'text-red' : 'text-green'}`}>
                  ₺{cust.balance.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Müşteri Kaydı</h3>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Adı Soyadı / Firma Adı *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Numarası *</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adres</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-submit">
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
