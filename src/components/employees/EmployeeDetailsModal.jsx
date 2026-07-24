import { useMemo } from 'react';
import Button from '../common/Button';
import { X, User, Mail, Phone, MapPin, Shield, Trophy, Users, CheckCircle2, Globe } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/roles';

export default function EmployeeDetailsModal({ isOpen, onClose, employee, leads = [], onEditEmployee }) {
  if (!isOpen || !employee) return null;

  const empLeads = useMemo(() => {
    return leads.filter(
      (l) => l.assignedToRaw === employee.id || l.assignedTo === employee.name
    );
  }, [leads, employee]);

  const wonLeads = empLeads.filter((l) => l.status === 'Won');
  const conversionRate = empLeads.length > 0 ? ((wonLeads.length / empLeads.length) * 100).toFixed(1) : '0';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--color-primary)" /> Employee Profile & Performance
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-dimmed)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {employee.name ? employee.name.slice(0, 2).toUpperCase() : 'EMP'}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>{employee.name}</h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              <span><Mail size={13} style={{ display: 'inline', marginRight: '3px' }} /> {employee.email}</span>
              <span><Phone size={13} style={{ display: 'inline', marginRight: '3px' }} /> {employee.phone || 'N/A'}</span>
              <span><MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} /> {employee.location || 'Unassigned Region'}</span>
              <span><Globe size={13} style={{ display: 'inline', marginRight: '3px' }} /> {employee.language || employee.languages || 'English'}</span>
            </div>
          </div>
          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
            {ROLE_LABELS[employee.role] || employee.role}
          </span>
        </div>

        {/* Performance Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <Users size={18} color="var(--color-primary)" style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>{empLeads.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dimmed)' }}>Assigned Leads</div>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <Trophy size={18} color="#10b981" style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{wonLeads.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dimmed)' }}>Deals Won</div>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <CheckCircle2 size={18} color="#8b5cf6" style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8b5cf6' }}>{conversionRate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dimmed)' }}>Conversion Rate</div>
          </div>
        </div>

        {/* Assigned Leads Table */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            Assigned Leads ({empLeads.length})
          </h4>
          {empLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-dimmed)', fontSize: '0.85rem' }}>
              No leads currently assigned to this employee.
            </div>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <table className="leads-table" style={{ width: '100%', fontSize: '0.825rem' }}>
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {empLeads.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{l.name}</td>
                      <td>{l.phone}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: l.status === 'Won' ? 'var(--color-success)' : l.status === 'Lost' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                          {l.status || 'New'}
                        </span>
                      </td>
                      <td>{l.location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          {onEditEmployee ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEditEmployee(employee);
              }}
            >
              Edit Profile & Language
            </Button>
          ) : <div />}
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
