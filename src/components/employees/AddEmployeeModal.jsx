import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ROLES } from '../../utils/roles';
import './AddEmployeeModal.css';

const INITIAL_FORM = { name: '', email: '', phone: '', role: ROLES.EMPLOYEE };

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
      await onAdd(form);
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
