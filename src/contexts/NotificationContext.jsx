import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.fetchNotifications(user.id, role);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user, role]);

  // Initial load and fast periodic polling every 3 seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markRead = async (id) => {
    if (!user) return;
    try {
      await api.markNotificationAsRead(id, user.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readBy: [...(n.readBy || []), user.id] } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await api.markAllNotificationsAsRead(user.id, role);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readBy: Array.from(new Set([...(n.readBy || []), user.id])) }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAll = async () => {
    if (!user) return;
    try {
      await api.clearNotifications(user.id, role);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const unreadCount = user
    ? notifications.filter(
        (n) =>
          !n.readBy?.includes(user.id) &&
          !n.readBy?.includes(user.name)
      ).length
    : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications: loadNotifications,
        markRead,
        markAllRead,
        clearAll,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
