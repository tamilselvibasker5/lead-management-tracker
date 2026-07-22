import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_LABELS } from '../../utils/roles';
import { Menu, Sun, Moon } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import './TopBar.css';

/**
 * Top navigation bar with page title, notification center, theme switcher, role badge, and user avatar.
 */
export default function TopBar({ onMenuToggle, pageTitle }) {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
          <Menu size={20} />
        </button>
        <h1 className="topbar__page-title">{pageTitle || 'Dashboard'}</h1>
      </div>

      <div className="topbar__right">
        {/* Notification Center */}
        <NotificationCenter />

        {/* Theme Toggle Button */}
        <button
          className="topbar__theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <span className={`topbar__role-badge topbar__role-badge--${role}`}>
          {ROLE_LABELS[role] || role}
        </span>

        <div className="topbar__user-info">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__user-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
