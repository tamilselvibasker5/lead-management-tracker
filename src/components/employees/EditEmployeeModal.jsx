import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ROLES } from '../../utils/roles';

/**
 * Modal component for editing an existing employee's details.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onUpdate: (id: string, data: object) => Promise<object>,
 *   employee: object|null
 * }} props
 */
export default function EditEmployeeModal({ isOpen, onClose, onUpdate, employee }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    language: '',
    role: ROLES.EMPLOYEE
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        location: employee.location || '',
        language: employee.language !== undefined && employee.language !== null ? employee.language : (employee.languages || ''),
        role: employee.role || ROLES.EMPLOYEE
      });
      setErrors({});
    }
  }, [employee]);

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
      await onUpdate(employee.id || employee._id, form);
      onClose();
    } catch (err) {
      console.error('Failed to update employee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={submitting}>
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee"
      footer={footer}
    >
      <div className="add-employee__form">
        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="edit-emp-name">
            Full Name
          </label>
          <input
            id="edit-emp-name"
            className="add-employee__input"
            value={form.name}
            onChange={handleChange('name')}
          />
          {errors.name && (
            <span className="add-employee__error">{errors.name}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="edit-emp-email">
            Email
          </label>
          <input
            id="edit-emp-email"
            type="email"
            className="add-employee__input"
            value={form.email}
            onChange={handleChange('email')}
          />
          {errors.email && (
            <span className="add-employee__error">{errors.email}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="edit-emp-phone">
            Phone
          </label>
          <input
            id="edit-emp-phone"
            type="tel"
            className="add-employee__input"
            value={form.phone}
            onChange={handleChange('phone')}
          />
          {errors.phone && (
            <span className="add-employee__error">{errors.phone}</span>
          )}
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="edit-emp-location">
            Location / Region
          </label>
          <input
            id="edit-emp-location"
            className="add-employee__input"
            placeholder="e.g. Chennai, Tamil Nadu"
            value={form.location}
            onChange={handleChange('location')}
          />
        </div>

        <div className="add-employee__group">
          <label className="add-employee__label" htmlFor="edit-emp-language">
            Languages Spoken
          </label>
          <input
            id="edit-emp-language"
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
          <label className="add-employee__label" htmlFor="edit-emp-role">
            Role
          </label>
          <select
            id="edit-emp-role"
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
