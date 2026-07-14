import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profileSaving, setProfileSaving] = useState(false);
  const [websiteSaving, setWebsiteSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      alert('Profile updated successfully!');
    }, 800);
  };

  const handleSaveWebsite = (e) => {
    e.preventDefault();
    setWebsiteSaving(true);
    setTimeout(() => {
      setWebsiteSaving(false);
      alert('Website settings updated successfully!');
    }, 800);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
          Super Admin Settings
        </h2>
        <p style={{ color: 'var(--color-text-dimmed)', marginTop: '0.25rem' }}>
          Manage your personal profile and high-level website configurations.
        </p>
      </div>

      {/* Profile Settings */}
      <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Profile Editing</h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.name}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              defaultValue={user?.email}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>New Password</label>
            <input 
              type="password" 
              placeholder="Leave blank to keep current password"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" loading={profileSaving}>Save Profile</Button>
          </div>
        </form>
      </div>

      {/* Website Settings */}
      <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Website Configuration</h3>
        <form onSubmit={handleSaveWebsite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Site Name</label>
            <input 
              type="text" 
              defaultValue="Lead Management Tracker"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Primary Theme Color</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="color" defaultValue="#6366f1" style={{ cursor: 'pointer' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', alignSelf: 'center' }}>Used for primary buttons and accents</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" id="maintenance" />
            <label htmlFor="maintenance" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Enable Maintenance Mode</label>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" loading={websiteSaving}>Save Website Configuration</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
