import {
  Wrench,
  ClipboardList,
  Users,
  Package,
  BarChart3,
  Wallet,
  Settings,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantServices, useTenantStock } from '../../../hooks/useTenantData';
import { useTenantStore } from '../../../store/tenantStore';
import { SERVICE_STATUS_MAP } from '../../../types';
import './Dashboard.css';

/* Quick actions */
const quickActions = [
  { label: 'Yeni Tamir Kaydet', icon: <Plus size={22} />, path: '/panel/servisler/yeni', color: 'blue' },
  { label: 'Tüm Servisler', icon: <ClipboardList size={22} />, path: '/panel/servisler', color: 'indigo' },
  { label: 'Müşteriler', icon: <Users size={22} />, path: '/panel/musteriler', color: 'emerald' },
  { label: 'Stok Yönetimi', icon: <Package size={22} />, path: '/panel/stok', color: 'amber' },
  { label: 'Raporlar', icon: <BarChart3 size={22} />, path: '/panel/raporlar', color: 'rose' },
  { label: 'Giderler ve Kasa', icon: <Wallet size={22} />, path: '/panel/kasa', color: 'teal' },
  { label: 'Ayarlar', icon: <Settings size={22} />, path: '/panel/ayarlar', color: 'slate' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const services = useTenantServices();
  const stockItems = useTenantStock();

  const totalServices = services.length;
  const inRepairCount = services.filter((s) => s.status === 'in_repair' || s.status === 'waiting_parts').length;
  const completedCount = services.filter((s) => s.status === 'ready' || s.status === 'delivered').length;
  const totalCollected = services.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const criticalStockCount = stockItems.filter((i) => i.quantity <= i.criticalLevel).length;

  const stats = [
    {
      label: "Toplam Servis Kaydı",
      value: totalServices.toString(),
      change: "+3 bu hafta",
      trend: 'up' as const,
      icon: <ClipboardList size={20} />,
      color: 'blue',
    },
    {
      label: "Tamirde / Parça Bekleyen",
      value: inRepairCount.toString(),
      change: "Aktif",
      trend: 'neutral' as const,
      icon: <Clock size={20} />,
      color: 'orange',
    },
    {
      label: "Tamamlanan & Hazır",
      value: completedCount.toString(),
      change: "+5",
      trend: 'up' as const,
      icon: <CheckCircle size={20} />,
      color: 'green',
    },
    {
      label: "Tahsil Edilen Tutar",
      value: `₺${totalCollected.toLocaleString('tr-TR')}`,
      change: "+15%",
      trend: 'up' as const,
      icon: <TrendingUp size={20} />,
      color: 'purple',
    },
  ];

  const recentServices = services.slice(0, 5);

  return (
    <div className="dashboard">
      {/* Stats */}
      <section className="dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-card__header">
              <span className="stat-card__label">{stat.label}</span>
              <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-card__body">
              <span className="stat-card__value">{stat.value}</span>
              {stat.change && (
                <span className={`stat-card__change stat-card__change--${stat.trend}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Critical Stock Alert */}
      {criticalStockCount > 0 && (
        <div className="dashboard__alert">
          <AlertTriangle size={16} />
          <span><strong>{criticalStockCount} ürün</strong> kritik stok seviyesinin altında</span>
          <button onClick={() => navigate('/panel/stok')}>Stoku Görüntüle →</button>
        </div>
      )}

      {/* Quick Actions */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Hızlı İşlemler</h2>
        </div>
        <div className="dashboard__quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`quick-action quick-action--${action.color}`}
              onClick={() => navigate(action.path)}
            >
              <div className={`quick-action__icon quick-action__icon--${action.color}`}>
                {action.icon}
              </div>
              <span className="quick-action__label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Services */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Son Servis Kayıtları</h2>
          <button className="dashboard__view-all" onClick={() => navigate('/panel/servisler')}>
            Tümünü Gör ({services.length}) →
          </button>
        </div>
        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Takip No</th>
                <th>Müşteri</th>
                <th>Cihaz</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {recentServices.map((service) => {
                const sConf = SERVICE_STATUS_MAP[service.status];
                return (
                  <tr key={service.id} onClick={() => navigate(`/panel/servisler/${service.id}`)}>
                    <td className="dashboard__table-id font-mono">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{service.trackingNo}</span>
                        {service.isOnlineBooking && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: 'rgba(0, 113, 227, 0.12)',
                              color: '#0071e3',
                            }}
                          >
                            Online
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{service.customerName}</td>
                    <td className="dashboard__table-device">{service.deviceBrand} {service.deviceModel}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          color: sConf?.color,
                          backgroundColor: sConf?.bgColor,
                        }}
                      >
                        <span className="status-badge__dot" style={{ backgroundColor: sConf?.color }} />
                        {sConf?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
