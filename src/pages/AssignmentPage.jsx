import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { useEmployees } from '../hooks/useEmployees';
import LeadsTable from '../components/leads/LeadsTable';
import AssignLeadModal from '../components/leads/AssignLeadModal';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import Button from '../components/common/Button';
import { autoAssignLead } from '../utils/assignmentRules';
import { Zap, UserCheck, Users, AlertCircle } from 'lucide-react';

export default function AssignmentPage() {
  const { role } = useAuth();
  const { leads, loading, updateStatus, updateLeadDetails, assignLead, swapLead, deleteLead, deleteAllLeads, addLeadActivity } = useLeads();
  const { employees } = useEmployees();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  /* Workload calculation per employee */
  const employeeWorkloads = useMemo(() => {
    return employees.map((emp) => {
      const assignedCount = leads.filter(
        (l) => l.assignedToRaw === emp.id || l.assignedTo === emp.name
      ).length;
      return {
        ...emp,
        assignedCount,
      };
    });
  }, [employees, leads]);

  const unassignedCount = useMemo(() => {
    return leads.filter(
      (l) =>
        !l.assignedToRaw ||
        l.assignedToRaw === 'Unassigned' ||
        l.assignedTo === 'Unassigned' ||
        l.assignedToRaw === '—'
    ).length;
  }, [leads]);

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
        alert(`⚡ Auto-Assigned ${assignedCount} lead(s) based on location & language matching!`);
      } else {
        alert('All leads are already assigned or no new matching employees were found.');
      }
    } catch (err) {
      console.error('Auto assign error:', err);
      alert('An error occurred during auto-assignment.');
    } finally {
      setAutoAssigning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Lead Assignment & Workload Balancer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dimmed)' }}>
            Distribute incoming leads evenly among sales representatives based on region and capacity.
          </p>
        </div>

        {leads && leads.length > 0 && (
          <Button
            variant="primary"
            onClick={handleAutoAssignAll}
            loading={autoAssigning}
            title="Automatically assign leads based on location & language rules"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Zap size={16} /> Auto Assign All Leads
          </Button>
        )}
      </div>

      {/* Unassigned Warning Banner */}
      {unassignedCount > 0 && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-warning)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={20} />
          <span>There are currently {unassignedCount} unassigned lead(s) awaiting allocation.</span>
        </div>
      )}

      {/* Workload Balancer Widget */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} color="var(--color-primary)" /> Sales Team Workload Capacity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {employeeWorkloads.map((emp) => {
            const maxCap = 20; // Recommended cap
            const pct = Math.min((emp.assignedCount / maxCap) * 100, 100);

            return (
              <div
                key={emp.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>{emp.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {emp.assignedCount} leads
                  </span>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: pct > 85 ? 'var(--color-danger)' : 'var(--color-primary)',
                      borderRadius: '999px',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dimmed)' }}>📍 {emp.location || 'All Regions'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Leads Table with Inline Assignment */}
      <LeadsTable
        leads={leads}
        loading={loading}
        employees={employees}
        currentUserRole={role}
        onStatusChange={updateStatus}
        onEditClick={handleEditClick}
        onAssignLead={assignLead}
        onSwapLead={swapLead}
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
        employees={employees}
        onSave={updateLeadDetails}
        onAddActivity={addLeadActivity}
      />
    </div>
  );
}
