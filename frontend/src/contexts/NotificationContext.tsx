import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { notificationApi, type AppNotification } from '../api/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const prevUnreadRef                     = useRef<number>(-1);
  // Backend hardcodes userId="admin" for admin-targeted notifications
  const userId = isAuthenticated
    ? (isAdmin ? 'admin' : (user?.username ?? null))
    : null;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await notificationApi.getNotifications(userId);
      const newUnread = data.filter(n => !n.isRead).length;

      // Toast when genuinely new unread notifications arrive (not on first load)
      if (prevUnreadRef.current >= 0 && newUnread > prevUnreadRef.current) {
        const diff = newUnread - prevUnreadRef.current;
        toast(
          `${diff} nouvelle${diff > 1 ? 's' : ''} notification${diff > 1 ? 's' : ''}`,
          {
            icon: '🔔',
            style: {
              background: 'var(--sidebar-bg)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.875rem',
            },
          }
        );
      }

      prevUnreadRef.current = newUnread;
      setNotifications(data);
      setError(null);
    } catch {
      setError('Impossible de charger les notifications');
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  // Initial fetch + polling
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await notificationApi.markAsRead(id);
    } catch {
      // Rollback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      toast.error('Impossible de marquer comme lu');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    prevUnreadRef.current = 0;

    try {
      await Promise.all(unread.map(n => notificationApi.markAsRead(n.id)));
      toast.success('Toutes les notifications marquées comme lues');
    } catch {
      toast.error('Erreur partielle lors de la mise à jour');
      // Refresh to get real state
      await fetchNotifications();
    }
  };

  const remove = async (id: string) => {
    // Optimistic update
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      prevUnreadRef.current = updated.filter(n => !n.isRead).length;
      return updated;
    });
    try {
      await notificationApi.delete(id);
    } catch {
      toast.error('Impossible de supprimer la notification');
      await fetchNotifications();
    }
  };

  const clearAll = async () => {
    if (!userId) return;
    setNotifications([]);
    prevUnreadRef.current = 0;
    try {
      await notificationApi.deleteAll(userId);
      toast.success('Toutes les notifications supprimées');
    } catch {
      toast.error('Impossible de supprimer les notifications');
      await fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      markAsRead,
      markAllRead,
      remove,
      clearAll,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
