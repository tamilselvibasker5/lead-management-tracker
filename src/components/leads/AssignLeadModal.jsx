import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import './AssignLeadModal.css';

/**
 * Modal for admins to assign a lead to a specific employee.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   lead: object | null,
 *   employees: object[],
 *   onAssign: (leadId: string, employeeId: string) => Promise<void>,
 * }} props
 */
export default function AssignLeadModal({
  isOpen,
  onClose,
  lead,
  employees,
  onAssign,
}) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedEmployee || !lead) return;
    try {
      setSubmitting(true);
      await onAssign(lead.id, selectedEmployee);
      setSelectedEmployee('');
      onClose();
    } catch {
      // Error is surfaced by the hook
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!selectedEmployee}
        loading={submitting}
      >
        Assign Lead
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead"
      footer={footer}
    >
      {lead && (
        <>
          <div className="assign-modal__form-group">
            <label className="assign-modal__label">Lead</label>
            <div className="assign-modal__value">{lead.name}</div>
          </div>

          <div className="assign-modal__form-group">
            <label className="assign-modal__label">Email</label>
            <div className="assign-modal__value">{lead.email}</div>
          </div>

          <div className="assign-modal__form-group">
            <label className="assign-modal__label" htmlFor="assign-employee">
              Assign To Employee
            </label>
            <select
              id="assign-employee"
              className="assign-modal__select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </Modal>
  );
}
