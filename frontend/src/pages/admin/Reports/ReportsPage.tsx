import { BarChart3, TrendingUp, CheckCircle, Clock, Smartphone, Laptop, Tablet, DollarSign } from 'lucide-react';
import { useTenantServices, useTenantCash } from '../../../hooks/useTenantData';
import './ReportsPage.css';

export default function ReportsPage() {
  const services = useTenantServices();
  const transactions = useTenantCash();

  const totalServices = services.length;
  const completedServices = services.filter((s) => s.status === 'ready' || s.status === 'delivered').length;
  const inRepairServices = services.filter((s) => s.status === 'in_repair' || s.status === 'waiting_parts').length;
  const completionRate = totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0;

  const totalRevenue = services.reduce((acc, s) => acc + (s.totalCost || s.estimatedCost || 0), 0);
  const totalCollected = services.reduce((acc, s) => acc + (s.paidAmount || 0), 0);

  // Device types distribution
  const phones = services.filter((s) => s.deviceType === 'Telefon').length;
  const laptops = services.filter((s) => s.deviceType === 'Laptop').length;
  const tablets = services.filter((s) => s.deviceType === 'Tablet').length;
  const others = totalServices - (phones + laptops + tablets);

  return (
    <div className="reports-page">
      <div className="reports-page__header">
        <div>
          <h1 className="reports-page__title">Performans & Raporlar</h1>
          <p className="reports-page__subtitle">İşletme istatistikleri, servis başarı oranları ve ciro analizi.</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card__header">
            <span>Servis Başarı & Tamamlama Oranı</span>
            <CheckCircle size={18} className="text-green" />
          </div>
          <div className="report-metric">%{completionRate}</div>
          <div className="report-progress-bar">
            <div className="report-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="report-sub">
            {completedServices} tamamlanan / {totalServices} toplam servis
          </div>
        </div>

        <div className="report-card">
          <div className="report-card__header">
            <span>Toplam Tahakkuk Eden Ciro</span>
            <DollarSign size={18} className="text-blue" />
          </div>
          <div className="report-metric">₺{totalRevenue.toLocaleString('tr-TR')}</div>
          <div className="report-sub">
            Tahsil edilen: ₺{totalCollected.toLocaleString('tr-TR')}
          </div>
        </div>

        <div className="report-card">
          <div className="report-card__header">
            <span>Aktif Onarım Süreci</span>
            <Clock size={18} className="text-orange" />
          </div>
          <div className="report-metric">{inRepairServices} Cihaz</div>
          <div className="report-sub">
            Şu anda atölyede veya parça bekliyor
          </div>
        </div>
      </div>

      {/* Device distribution */}
      <div className="report-card report-card--large">
        <div className="report-card__header">
          <span>Servis Cihaz Türü Dağılımı</span>
          <BarChart3 size={18} />
        </div>

        <div className="device-dist-grid">
          <div className="dist-item">
            <div className="dist-item__icon"><Smartphone size={22} /></div>
            <div className="dist-item__name">Akıllı Telefon</div>
            <div className="dist-item__val">{phones} Adet</div>
            <div className="dist-item__percent">
              %{totalServices ? Math.round((phones / totalServices) * 100) : 0}
            </div>
          </div>

          <div className="dist-item">
            <div className="dist-item__icon"><Laptop size={22} /></div>
            <div className="dist-item__name">Laptop / PC</div>
            <div className="dist-item__val">{laptops} Adet</div>
            <div className="dist-item__percent">
              %{totalServices ? Math.round((laptops / totalServices) * 100) : 0}
            </div>
          </div>

          <div className="dist-item">
            <div className="dist-item__icon"><Tablet size={22} /></div>
            <div className="dist-item__name">Tablet</div>
            <div className="dist-item__val">{tablets} Adet</div>
            <div className="dist-item__percent">
              %{totalServices ? Math.round((tablets / totalServices) * 100) : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
