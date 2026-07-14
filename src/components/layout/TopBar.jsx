import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '../../utils/roles';
import './TopBar.css';

/**
 * Top navigation bar with user info, role badge, and logout.
 */
export default function TopBar({ onMenuToggle, pageTitle }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__hamburger"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <h1 className="topbar__page-title">{pageTitle || 'Dashboard'}</h1>
      </div>

      <div className="topbar__right">
        <span className={`topbar__role-badge topbar__role-badge--${role}`}>
          {ROLE_LABELS[role] || role}
        </span>

        <div className="topbar__user-info">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__user-name">{user?.name}</span>
        </div>

        <button className="topbar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
