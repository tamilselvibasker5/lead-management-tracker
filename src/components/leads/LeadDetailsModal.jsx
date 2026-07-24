import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import NotepadModal from './NotepadModal';
import { Phone, Mail, Users, FileText, Plus, MapPin, Tag, UserCheck, MessageSquare } from 'lucide-react';
import './Notepad.css';

export default function LeadDetailsModal({
  isOpen,
  onClose,
  lead,
  employees = [],
  onSave,
  onAddActivity,
}) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'activity'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    platform: '',
    status: 'New',
    assignedTo: '',
    notes: '',
  });

  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [showNotepadModal, setShowNotepadModal] = useState(false);

  // Activity Tab State
  const [activityText, setActivityText] = useState('');
  const [activityType, setActivityType] = useState('note');
  const [savingActivity, setSavingActivity] = useState(false);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        location: lead.location || '',
        platform: lead.platform || lead.source || 'ig',
        status: lead.status || 'New',
        assignedTo: lead.assignedToRaw || lead.assignedTo || '',
        notes: lead.notes || '',
      });
      setActiveTab('info');
    }
  }, [lead]);

  const cleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setSavingInfo(true);
      setInfoError('');

      // Find employee name if assignedTo is an ID
      const emp = employees.find((e) => e.id === formData.assignedTo || e.name === formData.assignedTo);
      const updates = {
        ...formData,
        assignedTo: emp ? emp.name : (formData.assignedTo || 'Unassigned'),
        assignedToRaw: emp ? emp.id : (formData.assignedTo || null),
      };

      await onSave(lead.id, updates);
      onClose();
    } catch (err) {
      setInfoError(err.message || 'Failed to update lead');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!lead || !activityText.trim()) return;
    try {
      setSavingActivity(true);
      setActivityError('');
      await onAddActivity(lead.id, {
        type: activityType,
        note: activityText.trim(),
        text: activityText.trim(),
      });
      setActivityText('');
    } catch (err) {
      setActivityError(err.message || 'Failed to add activity');
    } finally {
      setSavingActivity(false);
    }
  };

  if (!lead) return null;

  const activities = lead.activities || [];
  const calls = activities.filter((a) => a.type === 'call').length;
  const emails = activities.filter((a) => a.type === 'email').length;
  const meetings = activities.filter((a) => a.type === 'meeting').length;
  const totalContacts = calls + emails + meetings;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quick Edit & Action: ${lead.name || 'Lead Details'}`}>
      {/* Header Banner with Platform & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 700 }}>
            Source Platform: <strong style={{ color: 'var(--color-text)' }}>{formData.platform || 'ig'}</strong>
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.15rem' }}>
            {formData.name || 'Unnamed Lead'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {formData.phone && formData.phone !== '—' && (
            <>
              <a
                href={`tel:${cleanPhone(formData.phone)}`}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                }}
                title="Call Lead"
              >
                <Phone size={14} /> Call
              </a>
              <a
                href={`https://wa.me/${cleanPhone(formData.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(37, 211, 102, 0.15)',
                  color: '#25D366',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                }}
                title="WhatsApp Chat"
              >
                <MessageSquare size={14} /> WhatsApp
              </a>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'info' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Quick Action & Edit
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'activity' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'activity' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Activity Timeline ({activities.length})
        </button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {infoError && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{infoError}</div>}

          {/* Status Selection Row */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Lead Stage Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color:
                  formData.status === 'Won'
                    ? 'var(--color-success)'
                    : formData.status === 'Lost'
                    ? 'var(--color-danger)'
                    : formData.status === 'Qualified'
                    ? '#8b5cf6'
                    : 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <option value="New">Move to New</option>
              <option value="Contacted">Move to Contacted</option>
              <option value="Qualified">Move to Qualified</option>
              <option value="Won">Move to Won</option>
              <option value="Lost">Move to Lost</option>
            </select>
          </div>

          {/* Name & Platform */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Lead Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Narendra Gohel"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Platform
              </label>
              <input
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="e.g. ig, fb"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +917359236056"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. narendra@example.com"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Location & Assigned To */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Location / State
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. 📍 Gujarat"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Assigned Employee
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.location || 'All Regions'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>Lead Notes & History</label>
              <button
                type="button"
                onClick={() => setShowNotepadModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <FileText size={14} /> Full Notepad Modal
              </button>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Enter notes or discussion remarks..."
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={savingInfo}>
              Save Lead Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--color-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="var(--color-primary)" /> Log Lead Activity
              </h4>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="note">📝 General Note</option>
                <option value="call">📞 Phone Call</option>
                <option value="email">✉️ Email Sent</option>
                <option value="meeting">👥 Meeting / Demo</option>
              </select>
            </div>
            {activityError && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{activityError}</div>}

            <textarea
              placeholder="Describe discussion or client updates..."
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" type="submit" loading={savingActivity} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={15} /> Add Activity Record
              </Button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto' }}>
            {(!lead.activities || lead.activities.length === 0) ? (
              <p style={{ color: 'var(--color-text-dimmed)', textAlign: 'center', fontSize: '0.9rem' }}>No activities logged yet.</p>
            ) : (
              lead.activities.map((act) => (
                <div key={act.id} style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-primary)' }}>{act.type}</span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--color-text-dimmed)' }}>{new Date(act.date || act.timestamp).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{act.note || act.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <NotepadModal
        isOpen={showNotepadModal}
        onClose={() => setShowNotepadModal(false)}
        lead={lead}
        initialNotes={formData.notes}
        onSave={async (leadId, updates) => {
          setFormData((prev) => ({ ...prev, notes: updates.notes }));
          if (onSave) {
            await onSave(leadId, updates);
          }
        }}
        onAddActivity={onAddActivity}
      />
    </Modal>
  );
}
