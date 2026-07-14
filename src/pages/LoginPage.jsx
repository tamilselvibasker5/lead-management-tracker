import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import './LoginPage.css';

/**
 * Login page with email/password form and quick-login buttons (dev mode).
 */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">LM</div>
          <h1 className="login-card__title">Welcome Back</h1>
          <p className="login-card__subtitle">
            Sign in to your Lead Management Tracker
          </p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <div className="login-card__group">
            <label className="login-card__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="login-card__input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-card__group">
            <label className="login-card__label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="login-card__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-card__error">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="login-card__submit"
          >
            Sign In
          </Button>
        </form>

      </div>
    </div>
  );
}
