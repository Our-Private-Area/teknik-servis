import { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowUpDown, ChevronDown, Trash2 } from 'lucide-react';
import { useStockStore } from '../../../store/stockStore';
import { useTenantStock } from '../../../hooks/useTenantData';
import toast from 'react-hot-toast';
import './StockList.css';

export default function StockList() {
  const { addItem, deleteItem, adjustQuantity } = useStockStore();
  const items = useTenantStock();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Ekran & Dokunmatik');
  const [brand, setBrand] = useState('Apple');
  const [quantity, setQuantity] = useState(1);
  const [criticalLevel, setCriticalLevel] = useState(2);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [shelfLocation, setShelfLocation] = useState('');

  const filtered = items.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.shelfLocation?.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItem({
      name: name.trim(),
      code: code.trim() || `STK-${Date.now().toString().slice(-6)}`,
      category,
      brand,
      quantity: Number(quantity),
      criticalLevel: Number(criticalLevel),
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      shelfLocation: shelfLocation.trim() || undefined,
      unit: 'Adet',
    });

    toast.success('Yeni yedek parça stoğa eklendi.');
    setName('');
    setCode('');
    setShelfLocation('');
    setShowAddModal(false);
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">Yedek Parça & Stok Yönetimi</h1>
          <p className="stock-page__subtitle">Parça envanteri, kritik stok uyarıları ve raf konumları.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Yeni Parça / Ürün Ekle</span>
        </button>
      </div>

      <div className="stock-toolbar">
        <div className="stock-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Parça adı, kod veya marka ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="stock-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="stock-table-card">
        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Ürün Kodu</th>
                <th>Parça Adı</th>
                <th>Kategori & Marka</th>
                <th>Raf Konumu</th>
                <th>Stok Adedi</th>
                <th>Alış / Satış</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isCritical = item.quantity <= item.criticalLevel;
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="stock-code-pill font-mono">{item.code}</span>
                    </td>
                    <td>
                      <span className="stock-item-name">{item.name}</span>
                    </td>
                    <td>
                      <span className="stock-cat">{item.category}</span>
                      <small className="stock-brand">{item.brand}</small>
                    </td>
                    <td className="font-mono text-muted text-sm">
                      {item.shelfLocation || '-'}
                    </td>
                    <td>
                      <div className="stock-qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => adjustQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className={`stock-qty-val ${isCritical ? 'stock-qty-val--critical' : ''}`}>
                          {item.quantity} {item.unit || 'Adet'}
                          {isCritical && (
                            <span title="Kritik Stok Uyarısı!">
                              <AlertTriangle size={13} className="critical-icon" />
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => adjustQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="stock-prices">
                        <span className="sale-price">₺{item.salePrice.toLocaleString('tr-TR')}</span>
                        <span className="purchase-price">Alış: ₺{item.purchasePrice}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="action-icon-btn action-icon-btn--danger"
                        onClick={() => {
                          if (window.confirm(`${item.name} parçası silinsin mi?`)) {
                            deleteItem(item.id);
                            toast.success('Parça silindi.');
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Yedek Parça Ekle</h3>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Parça Adı *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Örn: iPhone 14 Pro Batarya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Ürün / Stok Kodu</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="Otomatik"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Marka</label>
                  <input
                    type="text"
                    className="form-control"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Raf Konumu</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="Örn: B-02-04"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Başlangıç Adedi</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kritik Stok Uyarısı</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={criticalLevel}
                    onChange={(e) => setCriticalLevel(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Alış Fiyatı (₺)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Satış Fiyatı (₺)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-submit">
                  Stoğa Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
