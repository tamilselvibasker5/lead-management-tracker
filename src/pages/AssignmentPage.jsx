import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { useEmployees } from '../hooks/useEmployees';
import LeadsTable from '../components/leads/LeadsTable';
import AssignLeadModal from '../components/leads/AssignLeadModal';

/**
 * Admin-only page for assigning leads to employees.
 */
export default function AssignmentPage() {
  const { role } = useAuth();
  const { leads, loading, updateStatus, assignLead } = useLeads();
  const { employees } = useEmployees();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const handleAssignClick = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          Assign Leads to Employees
        </h2>
      </div>

      <LeadsTable
        leads={leads}
        loading={loading}
        employees={employees}
        currentUserRole={role}
        onStatusChange={updateStatus}
        onAssignClick={handleAssignClick}
        showAssignAction
      />

      <AssignLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={selectedLead}
        employees={employees}
        onAssign={assignLead}
      />
    </div>
  );
}
