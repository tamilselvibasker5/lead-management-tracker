import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { LEAD_STATUSES } from '../../mocks/leads';

export default function AddLeadModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    platform: '',
    notes: '',
    status: LEAD_STATUSES.NEW,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        platform: '',
        notes: '',
        status: LEAD_STATUSES.NEW,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lead">
      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Platform</label>
            <input
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            {Object.values(LEAD_STATUSES).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            Add Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}
