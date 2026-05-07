import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, FileText, CreditCard,
  Heart, ShieldCheck, AlertTriangle, User, Clock, Filter, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'liquidation' | 'paiement' | 'reversion' | 'system' | 'security' | 'affilie';
  read: boolean;
  date: string;
  link?: string;
}

const initialNotifications: Notification[] = [
  { id: 'n1', title: 'Nouvelle demande de liquidation', message: 'Alami Mohamed a déposé une demande de liquidation normale. Dossier en attente de traitement.', type: 'liquidation', read: false, date: '2026-04-14T09:30:00', link: '/liquidations' },
  { id: 'n2', title: 'Paiement exécuté', message: 'Le virement mensuel de 6 500 MAD pour Chakir Hassan a été exécuté avec succès.', type: 'paiement', read: false, date: '2026-04-14T08:15:00', link: '/payments' },
  { id: 'n3', title: 'Demande de réversion', message: 'Nouvelle demande d\'ayant-droit: Alami Khadija (conjoint). Vérification des pièces requise.', type: 'reversion', read: false, date: '2026-04-13T16:45:00', link: '/reversions' },
  { id: 'n4', title: 'Tentative de connexion suspecte', message: 'Connexion échouée depuis l\'adresse IP 10.0.0.55. 3 tentatives détectées.', type: 'security', read: false, date: '2026-04-13T03:15:00', link: '/admin/audit' },
  { id: 'n5', title: 'Dossier liquidation validé', message: 'Le dossier de Chakir Hassan (liquidation normale) a été validé. Paiement en cours de planification.', type: 'liquidation', read: true, date: '2026-04-12T14:20:00', link: '/liquidations' },
  { id: 'n6', title: 'Paiement échoué', message: 'Le virement pour Ghali Sara a échoué. Veuillez vérifier les coordonnées bancaires.', type: 'paiement', read: true, date: '2026-04-12T10:00:00', link: '/payments' },
  { id: 'n7', title: 'Mise à jour système', message: 'Maintenance planifiée le 20/04/2026 de 02:00 à 04:00. L\'application sera indisponible.', type: 'system', read: true, date: '2026-04-11T09:00:00' },
  { id: 'n8', title: 'Nouvel affilié créé', message: 'L\'affilié El Fassi Amina a été créé avec succès dans le système.', type: 'affilie', read: true, date: '2026-04-10T11:30:00', link: '/affilies' },
  { id: 'n9', title: 'Alerte cotisation', message: '3 affiliés ont des cotisations en retard pour la période Mars 2026.', type: 'system', read: true, date: '2026-04-09T15:00:00', link: '/contributions' },
  { id: 'n10', title: 'Réversion approuvée', message: 'La demande de réversion pour Alami Youssef (orphelin) a été approuvée. Taux: 25%.', type: 'reversion', read: true, date: '2026-04-08T16:20:00', link: '/reversions' },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'liquidation': return FileText;
    case 'paiement': return CreditCard;
    case 'reversion': return Heart;
    case 'system': return AlertTriangle;
    case 'security': return ShieldCheck;
    case 'affilie': return User;
    default: return Bell;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'liquidation': return '#3b82f6';
    case 'paiement': return '#10b981';
    case 'reversion': return '#8b5cf6';
    case 'system': return '#f59e0b';
    case 'security': return '#ef4444';
    case 'affilie': return '#06b6d4';
    default: return '#64748b';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'liquidation': return 'Liquidation';
    case 'paiement': return 'Paiement';
    case 'reversion': return 'Réversion';
    case 'system': return 'Système';
    case 'security': return 'Sécurité';
    case 'affilie': return 'Affilié';
    default: return type;
  }
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Il y a ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR');
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filterType, setFilterType] = useState('');
  const [filterRead, setFilterRead] = useState<'' | 'read' | 'unread'>('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification supprimée');
  };

  const clearAll = () => {
    if (window.confirm('Supprimer toutes les notifications ?')) {
      setNotifications([]);
      toast.success('Toutes les notifications supprimées');
    }
  };

  const filtered = notifications.filter(n => {
    if (filterType && n.type !== filterType) return false;
    if (filterRead === 'read' && !n.read) return false;
    if (filterRead === 'unread' && n.read) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes les notifications sont lues'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button className="btn btn-ghost" onClick={markAllRead}>
              <CheckCheck size={16} /> Tout marquer comme lu
            </button>
          )}
          <button className="btn btn-danger" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 size={16} /> Tout effacer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.85rem' }}
          >
            <option value="">Toutes catégories</option>
            <option value="liquidation">Liquidation</option>
            <option value="paiement">Paiement</option>
            <option value="reversion">Réversion</option>
            <option value="system">Système</option>
            <option value="security">Sécurité</option>
            <option value="affilie">Affilié</option>
          </select>
          <select
            value={filterRead}
            onChange={e => setFilterRead(e.target.value as any)}
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.85rem' }}
          >
            <option value="">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} notification(s)</span>
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {filtered.map((notif, i) => {
          const Icon = getTypeIcon(notif.type);
          const color = getTypeColor(notif.type);
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem',
                background: notif.read ? '#fff' : 'var(--info-bg)',
                borderBottom: '1px solid var(--border-light)',
                borderLeft: `3px solid ${notif.read ? 'transparent' : color}`,
                borderRight: '1px solid var(--border)',
                borderTop: i === 0 ? '1px solid var(--border)' : undefined,
                borderRadius: i === 0 ? 'var(--radius-md) var(--radius-md) 0 0' : i === filtered.length - 1 ? '0 0 var(--radius-md) var(--radius-md)' : undefined,
                alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!notif.read) e.currentTarget.style.background = '#e0ecff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = notif.read ? '#fff' : 'var(--info-bg)'; }}
            >
              {/* Icon */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `${color}15`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {notif.title}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: '4px',
                    background: `${color}15`, color: color,
                  }}>
                    {getTypeLabel(notif.type)}
                  </span>
                  {!notif.read && (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                  )}
                </div>
                <p style={{
                  fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0',
                  lineHeight: 1.5, opacity: notif.read ? 0.7 : 1,
                }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {timeAgo(notif.date)}
                  </span>
                  {notif.link && (
                    <Link to={notif.link} style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 600 }}>
                      Voir le dossier →
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {!notif.read && (
                  <button
                    className="action-btn action-view"
                    title="Marquer comme lu"
                    onClick={() => markAsRead(notif.id)}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className="action-btn"
                  title="Supprimer"
                  onClick={() => deleteNotification(notif.id)}
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Aucune notification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Vous êtes à jour !</p>
          </div>
        )}
      </div>
    </div>
  );
}
