import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { useEmployees } from '../hooks/useEmployees';
import LeadsTable from '../components/leads/LeadsTable';
import AssignLeadModal from '../components/leads/AssignLeadModal';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import Button from '../components/common/Button';
import { autoAssignLead } from '../utils/assignmentRules';
import { Zap } from 'lucide-react';

/**
 * Admin-only page for assigning leads to employees.
 */
export default function AssignmentPage() {
  const { role } = useAuth();
  const { leads, loading, updateStatus, updateLeadDetails, assignLead, deleteLead, deleteAllLeads, addLeadActivity } = useLeads();
  const { employees } = useEmployees();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const handleEditClick = (lead) => {
    setLeadToEdit(lead);
    setDetailsModalOpen(true);
  };

  const handleAutoAssignAll = async () => {
    if (!leads || leads.length === 0) {
      alert('No leads available to auto-assign.');
      return;
    }

    try {
      setAutoAssigning(true);
      let assignedCount = 0;

      for (const lead of leads) {
        const matchedEmpId = autoAssignLead(lead, '', employees);

        if (matchedEmpId && matchedEmpId !== 'Unassigned' && matchedEmpId !== lead.assignedToRaw && matchedEmpId !== lead.assignedTo) {
          await assignLead(lead.id, matchedEmpId);
          assignedCount++;
        }
      }

      if (assignedCount > 0) {
        alert(`Successfully Auto-Assigned ${assignedCount} lead(s) to employees matching Location & Language!`);
      } else {
        alert('All leads are already assigned or no new location/language matches were found.');
      }
    } catch (err) {
      console.error('Auto assign error:', err);
      alert('An error occurred during auto-assignment.');
    } finally {
      setAutoAssigning(false);
    }
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

        {leads && leads.length > 0 && (
          <Button
            variant="primary"
            onClick={handleAutoAssignAll}
            loading={autoAssigning}
            title="Automatically assign leads to employees matching location & language"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Zap size={16} /> Auto Assign Leads
          </Button>
        )}
      </div>

      <LeadsTable
        leads={leads}
        loading={loading}
        employees={employees}
        currentUserRole={role}
        onStatusChange={updateStatus}
        onEditClick={handleEditClick}
        onAssignLead={assignLead}
        onUpdateLeadDetails={updateLeadDetails}
        onAddActivity={addLeadActivity}
        onDeleteClick={deleteLead}
        onDeleteAllClick={deleteAllLeads}
        showAssignAction
        hideImportExcel
      />

      <AssignLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={selectedLead}
        employees={employees}
        onAssign={assignLead}
      />

      <LeadDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setLeadToEdit(null);
        }}
        lead={leadToEdit}
        onSave={updateLeadDetails}
        onAddActivity={addLeadActivity}
      />
    </div>
  );
}
