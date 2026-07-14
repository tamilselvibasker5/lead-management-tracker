import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

/**
 * 403 Unauthorized fallback page.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: '0.5rem',
        }}
      >
        Access Denied
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          marginBottom: '1.5rem',
          maxWidth: 420,
        }}
      >
        You don't have permission to access this page. If you believe this is an
        error, contact your administrator.
      </p>
      <Button variant="secondary" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </Button>
    </div>
  );
}
