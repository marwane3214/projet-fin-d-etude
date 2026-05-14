import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, FileText, CreditCard,
  Heart, ShieldCheck, AlertTriangle, User, Clock,
  RefreshCw, X, SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AppNotification } from '../../api/notifications';

/* ── Type helpers ──────────────────────────────────────────── */

type DisplayCategory = 'liquidation' | 'paiement' | 'reversion' | 'system' | 'security' | 'affilie' | 'autre';

const TYPE_MAP: Record<string, DisplayCategory> = {
  LIQUIDATION:               'liquidation',
  LIQUIDATION_SUBMITTED:     'liquidation',
  LIQUIDATION_STATUS_UPDATE: 'liquidation',
  PAYMENT:                   'paiement',
  CONTRIBUTION:              'paiement',
  REVERSION:                 'reversion',
  SYSTEM:                    'system',
  MESSAGE:                   'system',
  SECURITY:                  'security',
  AFFILIE:                   'affilie',
  AFFILIÉ:                   'affilie',
};

function toCategory(type: string): DisplayCategory {
  const upper = type?.toUpperCase() ?? '';
  return TYPE_MAP[upper]
    ?? (Object.keys(TYPE_MAP).find(k => upper.includes(k))
        ? TYPE_MAP[Object.keys(TYPE_MAP).find(k => upper.includes(k))!]
        : 'autre');
}

const CATEGORY_META: Record<DisplayCategory, {
  label: string;
  Icon: React.ElementType;
  color: string;
  link?: string;
}> = {
  liquidation: { label: 'Liquidation', Icon: FileText,      color: '#2563eb', link: '/liquidations' },
  paiement:    { label: 'Paiement',    Icon: CreditCard,    color: '#16a34a', link: '/payments' },
  reversion:   { label: 'Réversion',   Icon: Heart,         color: '#7c3aed', link: '/reversions' },
  system:      { label: 'Système',     Icon: AlertTriangle, color: '#d97706' },
  security:    { label: 'Sécurité',    Icon: ShieldCheck,   color: '#dc2626' },
  affilie:     { label: 'Affilié',     Icon: User,          color: '#0891b2', link: '/affilies' },
  autre:       { label: 'Autre',       Icon: Bell,          color: '#6b7280' },
};

function timeAgo(dateStr: string) {
  const diffMs  = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `Il y a ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7)  return `Il y a ${diffDay}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

/* ── Component ─────────────────────────────────────────────── */

export default function NotificationsPage() {
  const {
    notifications, unreadCount, loading, error,
    markAsRead, markAllRead, remove, clearAll, refresh,
  } = useNotifications();

  const [filterCat,  setFilterCat]  = useState<DisplayCategory | ''>('');
  const [filterRead, setFilterRead] = useState<'' | 'read' | 'unread'>('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const cat = toCategory(n.type);
      if (filterCat  && cat !== filterCat)       return false;
      if (filterRead === 'read'   && !n.isRead)  return false;
      if (filterRead === 'unread' &&  n.isRead)  return false;
      return true;
    });
  }, [notifications, filterCat, filterRead]);

  const handleMarkAsRead = async (n: AppNotification) => {
    if (n.isRead) return;
    await markAsRead(n.id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (window.confirm('Supprimer toutes les notifications ?')) {
      await clearAll();
    }
  };

  const handleRefresh = async () => {
    await refresh();
    toast.success('Notifications mises à jour');
  };

  const activeFilters = [
    filterCat  && { key: 'cat',  label: CATEGORY_META[filterCat]?.label ?? filterCat, clear: () => setFilterCat('') },
    filterRead && { key: 'read', label: filterRead === 'unread' ? 'Non lues' : 'Lues',  clear: () => setFilterRead('') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {loading
              ? 'Chargement...'
              : unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''} · ${notifications.length} au total`
                : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} · tout est lu`
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualiser
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} /> Vider
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="alert-item alert-warning" style={{ marginBottom: '1rem', borderRadius: 'var(--r-md)' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>Backend inaccessible</strong>
            <p>{error} — les données affichées peuvent être obsolètes.</p>
          </div>
        </div>
      )}

      {/* ── Table container ── */}
      <div className="table-container">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal size={14} />
              Filtres
              {activeFilters.length > 0 && (
                <span style={{
                  background: 'var(--brand)',
                  color: '#fff',
                  borderRadius: '99px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0 5px',
                  lineHeight: '16px',
                  minWidth: 16,
                  textAlign: 'center',
                }}>{activeFilters.length}</span>
              )}
            </button>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="badge badge-danger">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="table-toolbar-right">
            <span className="pagination-info">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="filter-panel">
            <div>
              <label>Catégorie</label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}>
                <option value="">Toutes</option>
                {(Object.keys(CATEGORY_META) as DisplayCategory[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Statut</label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <select value={filterRead} onChange={e => setFilterRead(e.target.value as any)}>
                <option value="">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </div>
        )}

        {/* Active chips */}
        {activeFilters.length > 0 && (
          <div className="filter-chips">
            {activeFilters.map(f => (
              <span key={f.key} className="filter-chip">
                {f.label}
                <button onClick={f.clear}><X size={11} /></button>
              </span>
            ))}
            <button className="filter-chips-clear" onClick={() => { setFilterCat(''); setFilterRead(''); }}>
              Tout effacer
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && notifications.length === 0 ? (
          <div className="loading-state" style={{ padding: '3rem' }}>
            <span style={{
              display: 'inline-block',
              width: 20, height: 20,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--brand)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Chargement des notifications...
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Bell size={44} style={{ color: 'var(--border-input)', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Aucune notification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
              {activeFilters.length > 0 ? 'Aucun résultat pour ces filtres.' : 'Vous êtes à jour !'}
            </p>
          </div>
        ) : (
          /* ── List ── */
          <AnimatePresence initial={false}>
            {filtered.map((notif, i) => {
              const cat  = toCategory(notif.type);
              const meta = CATEGORY_META[cat];
              const Icon = meta.Icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: notif.isRead ? 'var(--bg-card)' : 'var(--brand-subtle)',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: `3px solid ${notif.isRead ? 'transparent' : meta.color}`,
                    alignItems: 'flex-start',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onClick={() => handleMarkAsRead(notif)}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: `${meta.color}18`,
                    color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontWeight: notif.isRead ? 450 : 600,
                        fontSize: '0.9rem',
                        color: 'var(--text)',
                      }}>
                        {notif.title}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: `${meta.color}18`,
                        color: meta.color,
                      }}>
                        {meta.label}
                      </span>
                      {!notif.isRead && (
                        <span style={{
                          width: 7, height: 7,
                          borderRadius: '50%',
                          background: 'var(--brand)',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      opacity: notif.isRead ? 0.75 : 1,
                      margin: '0.2rem 0 0.375rem',
                    }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />
                        {timeAgo(notif.createdAt)}
                      </span>
                      {meta.link && (
                        <Link
                          to={meta.link}
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 500 }}
                        >
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {!notif.isRead && (
                      <button
                        className="action-btn action-view"
                        title="Marquer comme lu"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      className="action-btn"
                      title="Supprimer"
                      onClick={() => remove(notif.id)}
                      style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="table-footer" style={{ justifyContent: 'center' }}>
            <span className="pagination-info" style={{ fontSize: '0.8125rem' }}>
              Actualisation automatique toutes les 30 secondes
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
