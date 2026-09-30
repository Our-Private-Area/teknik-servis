import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Printer,
  ChevronRight,
  Smartphone,
  Laptop,
  Tablet,
  Check
} from 'lucide-react';
import { useServiceStore } from '../../../store/serviceStore';
import { useTenantServices } from '../../../hooks/useTenantData';
import { SERVICE_STATUS_MAP, ServiceStatus, Priority, ServiceRecord } from '../../../types';
import toast from 'react-hot-toast';
import './ServiceList.css';

const TABS: { key: string; label: string; countFilter?: (s: ServiceRecord) => boolean }[] = [
  { key: 'all', label: 'Tüm Servisler' },
  { key: 'online_booking', label: '🌐 Online Randevular', countFilter: (s) => !!s.isOnlineBooking },
  { key: 'in_repair', label: 'Tamirde Olanlar', countFilter: (s) => s.status === 'in_repair' },
  { key: 'waiting_parts', label: 'Parça Bekleyenler', countFilter: (s) => s.status === 'waiting_parts' },
  { key: 'waiting_approval', label: 'Onay Bekleyenler', countFilter: (s) => s.status === 'waiting_approval' },
  { key: 'ready', label: 'Teslimata Hazır', countFilter: (s) => s.status === 'ready' },
  { key: 'delivered', label: 'Teslim Edilenler', countFilter: (s) => s.status === 'delivered' },
];

export default function ServiceList() {
  const navigate = useNavigate();
  const services = useTenantServices();
  const { deleteService, updateServiceStatus } = useServiceStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      // Tab filter
      if (activeTab === 'online_booking' && !srv.isOnlineBooking) return false;
      if (activeTab === 'in_repair' && srv.status !== 'in_repair') return false;
      if (activeTab === 'waiting_parts' && srv.status !== 'waiting_parts') return false;
      if (activeTab === 'waiting_approval' && srv.status !== 'waiting_approval') return false;
      if (activeTab === 'ready' && srv.status !== 'ready') return false;
      if (activeTab === 'delivered' && srv.status !== 'delivered') return false;

      // Type filter
      if (selectedDeviceType !== 'all' && srv.deviceType !== selectedDeviceType) return false;

      // Priority filter
      if (selectedPriority !== 'all' && srv.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          srv.trackingNo.toLowerCase().includes(q) ||
          srv.customerName?.toLowerCase().includes(q) ||
          srv.deviceBrand.toLowerCase().includes(q) ||
          srv.deviceModel.toLowerCase().includes(q) ||
          srv.serialNo?.toLowerCase().includes(q) ||
          srv.imei?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [services, activeTab, selectedDeviceType, selectedPriority, searchQuery]);

  const handleDelete = (id: string, trackingNo: string) => {
    if (window.confirm(`${trackingNo} numaralı servis kaydını silmek istediğinize emin misiniz?`)) {
      deleteService(id);
      toast.success(`${trackingNo} servis kaydı silindi.`);
    }
  };

  const handleQuickStatusChange = (id: string, trackingNo: string, newStatus: ServiceStatus) => {
    updateServiceStatus(id, newStatus, `Hızlı durum güncellemesi yapıldı: ${SERVICE_STATUS_MAP[newStatus].label}`, 'Admin');
    toast.success(`${trackingNo} durumu "${SERVICE_STATUS_MAP[newStatus].label}" olarak güncellendi.`);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type === 'Laptop') return <Laptop size={16} />;
    if (type === 'Tablet') return <Tablet size={16} />;
    return <Smartphone size={16} />;
  };

  return (
    <div className="service-list-page">
      {/* Top Bar */}
      <div className="service-list-page__header">
        <div>
          <h1 className="service-list-page__title">Servis Kayıtları</h1>
          <p className="service-list-page__subtitle">
            Toplam {services.length} servis kaydı yönetiliyor.
          </p>
        </div>

        <div className="service-list-page__header-actions">
          <Link to="/panel/servisler/yeni" className="btn-primary">
            <Plus size={18} />
            <span>Yeni Servis Kaydı</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="service-tabs">
        {TABS.map((tab) => {
          const count = tab.countFilter
            ? services.filter((s) => tab.countFilter!(s)).length
            : services.length;
          return (
            <button
              key={tab.key}
              type="button"
              className={`service-tab ${activeTab === tab.key ? 'service-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="service-tab__badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="service-toolbar">
        <div className="service-toolbar__search">
          <Search size={18} className="service-toolbar__search-icon" />
          <input
            type="text"
            className="service-toolbar__input"
            placeholder="Takip no, müşteri, cihaz, seri no veya IMEI ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="service-toolbar__filters">
          <select
            className="service-toolbar__select"
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
          >
            <option value="all">Tüm Cihazlar</option>
            <option value="Telefon">Telefon</option>
            <option value="Laptop">Laptop / Notebook</option>
            <option value="Tablet">Tablet</option>
            <option value="Diğer">Diğer</option>
          </select>

          <select
            className="service-toolbar__select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="normal">Normal</option>
            <option value="urgent">Acil</option>
            <option value="critical">Kritik</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="service-table-card">
        {filteredServices.length === 0 ? (
          <div className="service-table-empty">
            <Wrench size={40} />
            <h3>Aramanıza uygun servis kaydı bulunamadı</h3>
            <p>Filtreleri sıfırlayabilir veya yeni bir servis kaydı oluşturabilirsiniz.</p>
          </div>
        ) : (
          <div className="service-table-wrapper">
            <table className="service-table">
              <thead>
                <tr>
                  <th>Takip No</th>
                  <th>Müşteri</th>
                  <th>Cihaz</th>
                  <th>Kayıt Tarihi</th>
                  <th>Durum</th>
                  <th>Öncelik</th>
                  <th>Teknisyen</th>
                  <th>Tutar / Bakiye</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((srv) => {
                  const statusConf = SERVICE_STATUS_MAP[srv.status];
                  return (
                    <tr key={srv.id} onClick={() => navigate(`/panel/servisler/${srv.id}`)}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span className="service-tracking-badge">{srv.trackingNo}</span>
                          {srv.isOnlineBooking && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(0, 113, 227, 0.12)',
                                color: '#0071e3',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Online Randevu {srv.deliveryMethod === 'cargo' ? '📦 Kargo' : '🏢 Elden'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="service-cell-customer">
                          <span className="customer-name">{srv.customerName || 'Müşteri'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="service-cell-device">
                          <span className="device-icon">{getDeviceIcon(srv.deviceType)}</span>
                          <div>
                            <span className="device-name">{srv.deviceBrand} {srv.deviceModel}</span>
                            <span className="device-complaint">{srv.complaint.substring(0, 35)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted text-sm">
                        {formatDate(srv.receivedDate)}
                      </td>
                      <td>
                        <select
                          className="status-dropdown-pill"
                          value={srv.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(srv.id, srv.trackingNo, e.target.value as ServiceStatus);
                          }}
                          style={{
                            color: statusConf?.color,
                            backgroundColor: statusConf?.bgColor,
                            borderColor: statusConf?.color,
                          }}
                        >
                          {Object.entries(SERVICE_STATUS_MAP).map(([key, conf]) => (
                            <option key={key} value={key} style={{ background: '#1e293b', color: '#f8fafc' }}>
                              {conf.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`priority-tag priority-tag--${srv.priority}`}>
                          {srv.priority === 'urgent' ? 'Acil' : srv.priority === 'critical' ? 'Kritik' : 'Normal'}
                        </span>
                      </td>
                      <td className="text-sm">
                        {srv.assignedStaffName ? srv.assignedStaffName.split(' ')[0] : 'Atanmadı'}
                      </td>
                      <td>
                        <div className="service-cell-price">
                          <span className="total-price">₺{(srv.totalCost || srv.estimatedCost || 0).toLocaleString('tr-TR')}</span>
                          {(srv.remainingAmount || 0) > 0 && (
                            <span className="remaining-price">Kalan: ₺{srv.remainingAmount}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="service-actions">
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Detay Görüntüle"
                            onClick={() => navigate(`/panel/servisler/${srv.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <a
                            href={`/takip/${srv.trackingNo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="action-icon-btn"
                            title="Müşteri Takip Ekranında Aç"
                          >
                            <CheckCircle size={16} />
                          </a>
                          <button
                            type="button"
                            className="action-icon-btn action-icon-btn--danger"
                            title="Servis Kaydını Sil"
                            onClick={() => handleDelete(srv.id, srv.trackingNo)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
