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
      await onUpdate(employee.id, form);
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
