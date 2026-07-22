import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ArrowRightLeft } from 'lucide-react';

const SWAP_REASONS = [
  'Language Barrier',
  'Region / Location Mismatch',
  'Domain / Technical Expertise Needed',
  'Shift / Availability Conflict',
  'Client Requested Change',
  'Other',
];

export default function SwapLeadModal({
  isOpen,
  onClose,
  lead,
  employees = [],
  currentUserId,
  onSwap,
}) {
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [reasonCategory, setReasonCategory] = useState(SWAP_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!lead) return null;

  // Filter out the current assignee from the employee selection list
  const availableEmployees = employees.filter((emp) => {
    if (lead.assignedToRaw && emp.id === lead.assignedToRaw) return false;
    if (lead.assignedTo && emp.name === lead.assignedTo) return false;
    if (currentUserId && emp.id === currentUserId) return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!targetEmployeeId) {
      setError('Please select an employee to swap the lead to.');
      return;
    }

    const finalReason =
      reasonCategory === 'Other'
        ? customReason.trim()
        : customReason.trim()
        ? `${reasonCategory} - ${customReason.trim()}`
        : reasonCategory;

    if (!finalReason) {
      setError('Please provide a valid reason for swapping.');
      return;
    }

    const selectedEmp = employees.find((e) => e.id === targetEmployeeId);

    try {
      setLoading(true);
      await onSwap(lead.id, targetEmployeeId, selectedEmp?.name || 'Employee', finalReason);
      setTargetEmployeeId('');
      setReasonCategory(SWAP_REASONS[0]);
      setCustomReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to swap lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRightLeft size={18} color="var(--color-primary)" />
          <span>Swap Lead — {lead.name}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Select the colleague you want to reassign this lead to, along with the specific issue or reason for the swap.
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Swap To Employee <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <select
            value={targetEmployeeId}
            onChange={(e) => setTargetEmployeeId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary)',
              background: '#1e2030',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: '#1e2030', color: '#9ca3af' }}>-- Select Employee --</option>
            {availableEmployees.map((emp) => (
              <option key={emp.id} value={emp.id} style={{ background: '#1e2030', color: '#ffffff' }}>
                {emp.name} ({emp.location || emp.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Facing Issue / Reason for Swap <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary)',
              background: '#1e2030',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {SWAP_REASONS.map((reason) => (
              <option key={reason} value={reason} style={{ background: '#1e2030', color: '#ffffff' }}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            {reasonCategory === 'Other' ? 'Specify Reason Details *' : 'Additional Notes (Optional)'}
          </label>
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder={
              reasonCategory === 'Other'
                ? 'Please describe the issue faced with this lead...'
                : 'Add any relevant context for the receiving employee...'
            }
            rows={3}
            required={reasonCategory === 'Other'}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowRightLeft size={16} /> Confirm Swap
          </Button>
        </div>
      </form>
    </Modal>
  );
}
