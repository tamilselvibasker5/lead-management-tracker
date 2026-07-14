import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { useEmployees } from '../hooks/useEmployees';
import LeadsTable from '../components/leads/LeadsTable';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import AddLeadModal from '../components/leads/AddLeadModal';
import Button from '../components/common/Button';
import { ROLES } from '../utils/roles';

/**
 * Full leads page — just the LeadsTable in a standalone view.
 */
export default function LeadsPage() {
  const { role } = useAuth();
  const { leads, loading, updateStatus, updateLeadDetails, deleteLead, deleteAllLeads, addLead, addLeadActivity } = useLeads();
  const { employees } = useEmployees();

  const isAdminOrAbove = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [leadToView, setLeadToView] = useState(null);

  const handleViewClick = (lead) => {
    setLeadToView(lead);
    setDetailsModalOpen(true);
  };

  const handleDeleteClick = async (lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      try {
        await deleteLead(lead.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteAllClick = async () => {
    if (window.confirm('Are you ABSOLUTELY sure you want to delete ALL leads? This cannot be undone.')) {
      try {
        await deleteAllLeads();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
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
          {role === ROLES.EMPLOYEE ? 'My Leads' : 'All Leads'}
        </h2>
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>
          + Add Lead
        </Button>
      </div>

      <LeadsTable
        leads={leads}
        loading={loading}
        employees={employees}
        currentUserRole={role}
        onStatusChange={updateStatus}
        onEditClick={handleViewClick}
        onDeleteClick={handleDeleteClick}
        onDeleteAllClick={isAdminOrAbove ? handleDeleteAllClick : undefined}
      />

      <LeadDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setLeadToView(null);
        }}
        lead={leadToView}
        onSave={updateLeadDetails}
        onAddActivity={addLeadActivity}
      />
      
      <AddLeadModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={addLead}
      />
    </div>
  );
}
