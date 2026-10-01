import { useState } from 'react';
import { Users, Phone, Mail, Plus, Trash2, X, Wrench, Star } from 'lucide-react';
import { useStaffStore } from '../../../store/staffStore';
import { useTenantStaff } from '../../../hooks/useTenantData';
import { useTenantStore } from '../../../store/tenantStore';
import toast from 'react-hot-toast';

export default function StaffList() {
  const { addStaff, deleteStaff } = useStaffStore();
  const { currentTenant } = useTenantStore();
  const staffMembers = useTenantStaff();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Teknisyen');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Ad ve telefon zorunludur.');
      return;
    }

    await addStaff({
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@${currentTenant.slug || 'teknikpro'}.com`,
      specialty: specialty.trim() || 'Genel Cihaz Onarımı',
      activeRepairs: 0,
      rating: '5.0/5',
    });

    toast.success(`${name} ekibe eklendi.`);
    setName('');
    setPhone('');
    setEmail('');
    setSpecialty('');
    setShowModal(false);
  };

  const handleDelete = async (id: string, staffName: string) => {
    if (window.confirm(`"${staffName}" isimli personeli silmek istediğinize emin misiniz?`)) {
      await deleteStaff(id);
      toast.success(`${staffName} silindi.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Personel & Teknisyenler ({staffMembers.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
            <strong>{currentTenant.name}</strong> bünyesindeki teknik servis ekibi ve teknisyenler.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--brand-primary, #0071e3)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>Yeni Personel Ekle</span>
        </button>
      </div>

      {staffMembers.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--bg-card, #111827)',
            borderRadius: 12,
            border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))',
            color: '#94a3b8',
          }}
        >
          <Users size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Bu işletmeye kayıtlı personel bulunamadı.</p>
          <p style={{ fontSize: 13 }}>Yukarıdaki butona tıklayarak dükkanınız için yeni teknisyen veya personel ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {staffMembers.map((staff) => (
            <div
              key={staff.id}
              style={{
                background: 'var(--bg-card, #111827)',
                border: '1px solid var(--border-primary, rgba(255, 255, 255, 0.08))',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{staff.name}</h3>
                    <span style={{ fontSize: '12px', color: '#60a5fa' }}>{staff.role}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(staff.id, staff.name)}
                  title="Personeli Sil"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
                <strong>Uzmanlık:</strong> {staff.specialty}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} />
                  <span>{staff.phone}</span>
                </div>
                {staff.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} />
                    <span>{staff.email}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '12px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
                  <Wrench size={14} />
                  <span>Aktif: <strong>{staff.activeRepairs || 0} Cihaz</strong></span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 600 }}>
                  <Star size={14} fill="#f59e0b" />
                  <span>{staff.rating || '5.0/5'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: 20,
              width: '100%',
              maxWidth: 'min(94vw, 480px)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Yeni Personel / Teknisyen</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Personel Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Serkan Demir"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Görevi / Pozisyonu</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: 4 }}
                >
                  <option value="Kıdemli Atölye Şefi">Kıdemli Atölye Şefi</option>
                  <option value="Donanım & Parça Teknisyeni">Donanım & Parça Teknisyeni</option>
                  <option value="Anakart & BGA Uzmanı">Anakart & BGA Uzmanı</option>
                  <option value="Müşteri Kabul & Servis Danışmanı">Müşteri Kabul & Servis Danışmanı</option>
                  <option value="Stajyer Teknisyen">Stajyer Teknisyen</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>E-Posta (Opsiyonel)</label>
                  <input
                    type="email"
                    placeholder="personel@firma.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Uzmanlık Alanı</label>
                <input
                  type="text"
                  placeholder="Örn: Apple Ekran, Sıvı Teması, Şarj Bordu Onarımı"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, background: '#0071e3', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Personeli Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
