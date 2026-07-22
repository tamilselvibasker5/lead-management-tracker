import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, UploadCloud, UserPlus, ArrowRightLeft, Info } from 'lucide-react';
import './NotificationCenter.css';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'import':
        return <UploadCloud size={18} />;
      case 'assignment':
        return <UserPlus size={18} />;
      case 'swap':
        return <ArrowRightLeft size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        className="notification-center__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-center__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown__header">
            <span className="notification-dropdown__title">
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.725rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </span>
            <div className="notification-dropdown__actions">
              {unreadCount > 0 && (
                <button
                  className="notification-dropdown__action-btn"
                  onClick={markAllRead}
                  title="Mark all as read"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notification-dropdown__action-btn"
                  style={{ color: 'var(--color-text-dimmed)' }}
                  onClick={clearAll}
                  title="Clear all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="notification-dropdown__body">
            {notifications.length === 0 ? (
              <div className="notification-dropdown__empty">
                <Bell size={28} style={{ opacity: 0.3 }} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread =
                  !item.readBy?.includes(user?.id) &&
                  !item.readBy?.includes(user?.name);

                return (
                  <div
                    key={item.id}
                    className={`notification-item ${
                      isUnread ? 'notification-item--unread' : ''
                    }`}
                    onClick={() => markRead(item.id)}
                  >
                    <div
                      className={`notification-item__icon notification-item__icon--${
                        item.type || 'general'
                      }`}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div className="notification-item__content">
                      <div className="notification-item__title">
                        <span>{item.title}</span>
                        {isUnread && <span className="notification-item__dot" />}
                      </div>
                      <div className="notification-item__message">{item.message}</div>
                      <div className="notification-item__time">
                        {formatRelativeTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
