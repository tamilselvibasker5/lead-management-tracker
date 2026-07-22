import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import NotepadModal from './NotepadModal';
import { Phone, Mail, Users, FileText, Plus, Notebook } from 'lucide-react';
import './Notepad.css';

export default function LeadDetailsModal({ isOpen, onClose, lead, onSave, onAddActivity }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'activity'
  
  // Info Tab State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    platform: '',
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
        platform: lead.platform || lead.source || '',
        notes: lead.notes || '',
      });
      setActiveTab('info');
    }
  }, [lead]);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setSavingInfo(true);
      setInfoError('');
      await onSave(lead.id, formData);
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
        text: activityText
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Lead Details: ${lead.name}`}>
      {/* Contact Statistics Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>
            Engagement Summary
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Times Contacted: <span style={{ color: 'var(--color-primary)' }}>{totalContacts}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
            <Phone size={13} color="var(--color-primary)" /> <strong>{calls}</strong> <span style={{ color: 'var(--color-text-muted)' }}>Calls</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
            <Mail size={13} color="var(--color-primary)" /> <strong>{emails}</strong> <span style={{ color: 'var(--color-text-muted)' }}>Emails</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
            <Users size={13} color="var(--color-primary)" /> <strong>{meetings}</strong> <span style={{ color: 'var(--color-text-muted)' }}>Meetings</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'info' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'activity' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'activity' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Activity Timeline
        </button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleInfoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {infoError && <div style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{infoError}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInfoChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInfoChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInfoChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInfoChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Platform</label>
              <input
                name="platform"
                value={formData.platform}
                onChange={handleInfoChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>Lead Notes</label>
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
                <FileText size={14} /> Open Notes Popup Modal
              </button>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInfoChange}
              rows={5}
              placeholder="Type comprehensive lead notes..."
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
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Add Activity Form */}
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
            {activityError && <div style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{activityError}</div>}

            <textarea
              placeholder="Describe activity, phone discussion summary, meeting observation..."
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              rows={5}
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

          {/* Activity Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {(!lead.activities || lead.activities.length === 0) ? (
              <p style={{ color: 'var(--color-text-dimmed)', textAlign: 'center', fontSize: '0.9rem' }}>No activities logged yet.</p>
            ) : (
              lead.activities.map((act) => (
                <div key={act.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-primary)' }}>{act.type}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dimmed)' }}>{new Date(act.date || act.timestamp).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{act.note || act.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Popup Notes & Activity Modal */}
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
