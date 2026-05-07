import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, FileText, Info, AlertTriangle } from 'lucide-react';
import { notificationApi } from '../../api/notifications';
import type { AppNotification } from '../../api/notifications';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationPage() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user?.username) return;
    try {
      const targetId = isAdmin ? 'admin' : user.username;
      const data = await notificationApi.getNotifications(targetId);
      setNotifications(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Erreur');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LIQUIDATION_SUBMITTED':
      case 'LIQUIDATION_STATUS_UPDATE':
        return <FileText size={18} />;
      case 'ALERT':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Restez informé des activités de votre compte</p>
        </div>
      </div>

      <div className="notification-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem', background: '#fff', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
            <h3>Aucune notification</h3>
            <p className="text-muted">Vous êtes à jour !</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`notification-card ${n.isRead ? 'read' : 'unread'}`}
                style={{
                  background: '#fff',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  borderLeft: n.isRead ? '4px solid transparent' : '4px solid var(--brand)',
                  display: 'flex',
                  gap: '1rem',
                  position: 'relative',
                  transition: 'all 0.2s',
                  boxShadow: n.isRead ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: n.isRead ? 'var(--bg-input)' : 'var(--info-bg)',
                  color: n.isRead ? 'var(--text-muted)' : 'var(--brand)',
                  flexShrink: 0
                }}>
                  {getTypeIcon(n.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontWeight: n.isRead ? 500 : 700 }}>{n.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {new Date(n.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Check size={14} /> Marquer comme lu
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .notification-card:hover {
          transform: translateX(4px);
          border-color: var(--brand-light);
        }
        .notification-card.unread {
          background: linear-gradient(to right, #f0f7ff, #ffffff);
        }
      `}</style>
    </div>
  );
}
