import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PlusCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useCashStore } from '../../../store/cashStore';
import { useTenantCash } from '../../../hooks/useTenantData';
import toast from 'react-hot-toast';
import './CashManagement.css';

export default function CashManagement() {
  const { addTransaction } = useCashStore();
  const transactions = useTenantCash();

  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Servis Geliri');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [description, setDescription] = useState('');

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Geçerli bir tutar girin.');
      return;
    }

    addTransaction({
      type,
      category,
      amount: Number(amount),
      paymentMethod,
      description: description.trim() || undefined,
      date: new Date().toISOString(),
      recordedBy: 'Admin',
    });

    toast.success(`${type === 'income' ? 'Gelir' : 'Gider'} kaydı eklendi.`);
    setAmount(0);
    setDescription('');
    setShowAddModal(false);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="cash-page">
      <div className="cash-page__header">
        <div>
          <h1 className="cash-page__title">Giderler ve Kasa Yönetimi</h1>
          <p className="cash-page__subtitle">Nakit akışı, servis tahsilatları ve işletme giderleri takibi.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusCircle size={18} />
          <span>Gelir / Gider Ekle</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="cash-kpi-grid">
        <div className="cash-kpi-card cash-kpi-card--balance">
          <div className="kpi-header">
            <span>Net Kasa Bakiyesi</span>
            <Wallet size={20} className="kpi-icon" />
          </div>
          <div className="kpi-value">₺{netBalance.toLocaleString('tr-TR')}</div>
          <div className="kpi-sub">Güncel net nakit mevcudu</div>
        </div>

        <div className="cash-kpi-card cash-kpi-card--income">
          <div className="kpi-header">
            <span>Toplam Gelirler</span>
            <TrendingUp size={20} className="kpi-icon text-green" />
          </div>
          <div className="kpi-value text-green">₺{totalIncome.toLocaleString('tr-TR')}</div>
          <div className="kpi-sub">Servis ve satış tahsilatları</div>
        </div>

        <div className="cash-kpi-card cash-kpi-card--expense">
          <div className="kpi-header">
            <span>Toplam Giderler</span>
            <TrendingDown size={20} className="kpi-icon text-red" />
          </div>
          <div className="kpi-value text-red">₺{totalExpense.toLocaleString('tr-TR')}</div>
          <div className="kpi-sub">Parça alımları ve sabit masraflar</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="cash-table-card">
        <div className="cash-table-header">
          <h3>Son Kasa Hareketleri</h3>
        </div>

        <table className="cash-table">
          <thead>
            <tr>
              <th>İşlem Türü</th>
              <th>Açıklama & Kategori</th>
              <th>Ödeme Yöntemi</th>
              <th>Kayıt Tarihi</th>
              <th>Kayıt Eden</th>
              <th style={{ textAlign: 'right' }}>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <span className={`tx-type-pill tx-type-pill--${tx.type}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {tx.type === 'income' ? 'Gelir' : 'Gider'}
                  </span>
                </td>
                <td>
                  <div className="tx-desc-cell">
                    <strong>{tx.description || tx.category}</strong>
                    <small>{tx.category} {tx.serviceTrackingNo ? `• ${tx.serviceTrackingNo}` : ''}</small>
                  </div>
                </td>
                <td>
                  <span className="payment-method-tag">
                    {tx.paymentMethod === 'cash' ? 'Nakit' : tx.paymentMethod === 'card' ? 'Kredi Kartı' : 'Havale / EFT'}
                  </span>
                </td>
                <td className="text-muted text-sm">{formatDate(tx.date)}</td>
                <td className="text-sm">{tx.recordedBy}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={`tx-amount ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {tx.type === 'income' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Kasa Hareketi Ekle</h3>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">İşlem Türü</label>
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${type === 'income' ? 'type-btn--income-active' : ''}`}
                    onClick={() => { setType('income'); setCategory('Servis Geliri'); }}
                  >
                    + Gelir
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${type === 'expense' ? 'type-btn--expense-active' : ''}`}
                    onClick={() => { setType('expense'); setCategory('Yedek Parça Alımı'); }}
                  >
                    - Gider
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {type === 'income' ? (
                    <>
                      <option value="Servis Geliri">Servis Tamir Geliri</option>
                      <option value="Yedek Parça Satışı">Yedek Parça / Aksesuar Satışı</option>
                      <option value="Diğer Gelir">Diğer Gelir</option>
                    </>
                  ) : (
                    <>
                      <option value="Yedek Parça Alımı">Yedek Parça Alımı</option>
                      <option value="Genel Giderler / Fatura">Fatura & Aidat (Elektrik, İnternet)</option>
                      <option value="Kira">İşyeri Kirası</option>
                      <option value="Personel Maaş & Prim">Personel Maaş & Prim</option>
                      <option value="Kırtasiye & Sarf">Kırtasiye & Atölye Sarf Malzeme</option>
                      <option value="Diğer Gider">Diğer Gider</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tutar (₺) *</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  required
                  placeholder="0.00"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ödeme Yöntemi</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="cash">Nakit (Kasa)</option>
                  <option value="card">Kredi Kartı / POS</option>
                  <option value="transfer">Banka Havalesi / EFT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="İşlem detayı..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-submit">
                  Hareketi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
