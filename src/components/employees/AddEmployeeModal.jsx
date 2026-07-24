import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ROLES } from '../../utils/roles';
import './AddEmployeeModal.css';

const INITIAL_FORM = { name: '', email: '', phone: '', location: '', language: '', role: ROLES.EMPLOYEE };

/**
 * Modal form for admins to add a new employee.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onAdd: (data: object) => Promise<object>,
 * }} props
 */
export default function AddEmployeeModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      setSubmitting(true);
      await onAdd({
        ...form,
        language: form.language.trim() || 'English',
      });
      setForm({ ...INITIAL_FORM });
      setErrors({});
      onClose();
    } catch {
      // Error surfaced by hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose();
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={handleClose} disabled={submitting}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={submitting}>
        Add Employee
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Employee"
      footer={footer}
    >
      <div className="add-employee__form">
        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-name">
            Full Name
          </label>
          <input
            id="emp-name"
            className="add-employee__input"
            placeholder="e.g. Priya Sharma"
            value={form.name}
            onChange={handleChange('name')}
          />
          {errors.name && (
            <span className="add-employee__error">{errors.name}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-email">
            Email
          </label>
          <input
            id="emp-email"
            type="email"
            className="add-employee__input"
            placeholder="e.g. priya@company.com"
            value={form.email}
            onChange={handleChange('email')}
          />
          {errors.email && (
            <span className="add-employee__error">{errors.email}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-phone">
            Phone
          </label>
          <input
            id="emp-phone"
            type="tel"
            className="add-employee__input"
            placeholder="e.g. +91 98765 43210"
            value={form.phone}
            onChange={handleChange('phone')}
          />
          {errors.phone && (
            <span className="add-employee__error">{errors.phone}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-location">
            Location / Region
          </label>
          <input
            id="emp-location"
            className="add-employee__input"
            placeholder="e.g. Chennai, Tamil Nadu"
            value={form.location}
            onChange={handleChange('location')}
          />
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-language">
            Languages Spoken
          </label>
          <input
            id="emp-language"
            className="add-employee__input"
            placeholder="e.g. English, Hindi, Tamil"
            value={form.language}
            onChange={handleChange('language')}
          />
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
            {['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Malayalam', 'Bengali'].map((lang) => {
              const isSelected = form.language.toLowerCase().includes(lang.toLowerCase());
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    const currentLangs = form.language.split(',').map((s) => s.trim()).filter(Boolean);
                    if (isSelected) {
                      setForm((prev) => ({ ...prev, language: currentLangs.filter((l) => l.toLowerCase() !== lang.toLowerCase()).join(', ') }));
                    } else {
                      setForm((prev) => ({ ...prev, language: currentLangs.length ? `${prev.language}, ${lang}` : lang }));
                    }
                  }}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.725rem',
                    borderRadius: '999px',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="emp-role">
            Role
          </label>
          <select
            id="emp-role"
            className="add-employee__select"
            value={form.role}
            onChange={handleChange('role')}
          >
            <option value={ROLES.EMPLOYEE}>Employee</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
