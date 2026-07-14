import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import './Sidebar.css';

/**
 * Navigation sidebar — links are conditionally rendered per role.
 */
export default function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const isAdminOrAbove = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  const linkClass = ({ isActive }) =>
    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">LM</div>
          <span className="sidebar__brand-name">Lead Manager</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <span className="sidebar__section-title">Main</span>

          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <span className="sidebar__link-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink to="/leads" className={linkClass} onClick={onClose}>
            <span className="sidebar__link-icon">👥</span>
            {role === ROLES.EMPLOYEE ? 'My Leads' : 'All Leads'}
          </NavLink>

          {isAdminOrAbove && (
            <>
              <span className="sidebar__section-title">Management</span>

              <NavLink to="/assignment" className={linkClass} onClick={onClose}>
                <span className="sidebar__link-icon">🔗</span>
                Assign Leads
              </NavLink>

              <NavLink to="/employees" className={linkClass} onClick={onClose}>
                <span className="sidebar__link-icon">🏢</span>
                Employees
              </NavLink>

              <NavLink to="/import" className={linkClass} onClick={onClose}>
                <span className="sidebar__link-icon">📥</span>
                Import Leads
              </NavLink>
            </>
          )}

          {role === ROLES.SUPER_ADMIN && (
            <>
              <span className="sidebar__section-title">Super Admin</span>

              <NavLink to="/settings" className={linkClass} onClick={onClose}>
                <span className="sidebar__link-icon">⚙️</span>
                Settings
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-dimmed)',
            }}
          >
            © 2026 Lead Manager
          </span>
        </div>
      </aside>
    </>
  );
}
