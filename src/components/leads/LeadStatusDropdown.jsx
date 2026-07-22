import Dropdown from '../common/Dropdown';
import { LEAD_STATUSES } from '../../utils/leadStatuses';
import './LeadStatusDropdown.css';

const STATUS_OPTIONS = Object.values(LEAD_STATUSES).map((s) => ({
  value: s,
  label: s,
}));

/**
 * Inline status changer for a lead row.
 * Triggers onStatusChange when the employee selects a new status.
 *
 * @param {{
 *   leadId: string,
 *   currentStatus: string,
 *   onStatusChange: (leadId: string, newStatus: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function LeadStatusDropdown({
  leadId,
  currentStatus,
  onStatusChange,
  disabled = false,
}) {
  const handleChange = (newStatus) => {
    if (newStatus !== currentStatus) {
      onStatusChange(leadId, newStatus);
    }
  };

  return (
    <div className={`lead-status-dropdown lead-status-dropdown--${currentStatus.replace(/\s+/g, '-')}`}>
      <Dropdown
        value={currentStatus}
        onChange={handleChange}
        options={STATUS_OPTIONS}
        disabled={disabled}
        id={`status-${leadId}`}
      />
    </div>
  );
}
