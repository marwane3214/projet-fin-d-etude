import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, FileText, CreditCard,
  Heart, ShieldCheck, AlertTriangle, User, Clock,
  RefreshCw, X, SlidersHorizontal, RotateCcw, Inbox,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AppNotification } from '../../api/notifications';

/* ── Type helpers ──────────────────────────────────────────── */

type DisplayCategory = 'liquidation' | 'paiement' | 'reversion' | 'system' | 'security' | 'affilie' | 'autre';
type Tab = 'all' | 'unread' | 'read' | 'trash';

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
  label: string; Icon: React.ElementType; color: string; link?: string;
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

/* ── Trash helpers (localStorage) ─────────────────────────── */

const TRASH_KEY = 'cimr_notif_trash';

function loadTrashedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(TRASH_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}

function saveTrashedIds(ids: Set<string>) {
  localStorage.setItem(TRASH_KEY, JSON.stringify([...ids]));
}

/* ── Component ─────────────────────────────────────────────── */

export default function NotificationsPage() {
  const {
    notifications, unreadCount, loading, error,
    markAsRead, markAllRead, remove, clearAll, refresh,
  } = useNotifications();

  const [activeTab,   setActiveTab]   = useState<Tab>('all');
  const [filterCat,   setFilterCat]   = useState<DisplayCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Trash state (persisted in localStorage) ──
  const [trashedIds, setTrashedIds] = useState<Set<string>>(loadTrashedIds);

  const updateTrash = (next: Set<string>) => {
    setTrashedIds(new Set(next));
    saveTrashedIds(next);
  };

  // Move to trash (soft delete — stays in context, hidden from main view)
  const moveToTrash = (id: string) => {
    const next = new Set(trashedIds);
    next.add(id);
    updateTrash(next);
    toast('Notification déplacée dans la corbeille', {
      icon: '🗑️',
      style: { fontSize: '0.875rem' },
    });
  };

  // Restore from trash
  const restoreFromTrash = (id: string) => {
    const next = new Set(trashedIds);
    next.delete(id);
    updateTrash(next);
    toast.success('Notification restaurée');
  };

  // Permanent delete (calls backend DELETE + removes from trash)
  const deleteFromTrash = async (id: string) => {
    await remove(id);
    const next = new Set(trashedIds);
    next.delete(id);
    updateTrash(next);
  };

  // Empty entire trash (backend DELETE all trashed)
  const emptyTrash = async () => {
    if (trashedIds.size === 0) return;
    if (window.confirm(`Supprimer définitivement ${trashedIds.size} notification(s) ?`)) {
      await Promise.all([...trashedIds].map(id => remove(id)));
      updateTrash(new Set());
      toast.success('Corbeille vidée');
    }
  };

  // Move all to trash when "Vider" clicked from main view
  const handleClearAll = async () => {
    const active = notifications.filter(n => !trashedIds.has(n.id));
    if (active.length === 0) return;
    if (window.confirm(`Déplacer ${active.length} notification(s) dans la corbeille ?`)) {
      const next = new Set(trashedIds);
      active.forEach(n => next.add(n.id));
      updateTrash(next);
      toast('Toutes les notifications déplacées dans la corbeille', { icon: '🗑️' });
    }
  };

  const handleRefresh = async () => {
    await refresh();
    toast.success('Notifications mises à jour');
  };

  // ── Derived lists ──
  const activeNotifs  = useMemo(() => notifications.filter(n => !trashedIds.has(n.id)), [notifications, trashedIds]);
  const trashedNotifs = useMemo(() => notifications.filter(n =>  trashedIds.has(n.id)), [notifications, trashedIds]);
  const activeUnread  = activeNotifs.filter(n => !n.isRead).length;

  const filtered = useMemo(() => {
    let source: AppNotification[];
    if (activeTab === 'trash')  source = trashedNotifs;
    else if (activeTab === 'unread') source = activeNotifs.filter(n => !n.isRead);
    else if (activeTab === 'read')   source = activeNotifs.filter(n =>  n.isRead);
    else source = activeNotifs;

    if (filterCat) source = source.filter(n => toCategory(n.type) === filterCat);
    return source;
  }, [activeTab, activeNotifs, trashedNotifs, filterCat]);

  // ── Tab config ──
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all',    label: 'Toutes',   count: activeNotifs.length },
    { id: 'unread', label: 'Non lues', count: activeUnread || undefined },
    { id: 'read',   label: 'Lues' },
    { id: 'trash',  label: 'Corbeille', count: trashedNotifs.length || undefined },
  ];

  const inTrashTab = activeTab === 'trash';

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {loading ? 'Chargement...'
              : activeUnread > 0
                ? `${activeUnread} non lue${activeUnread > 1 ? 's' : ''} · ${activeNotifs.length} au total`
                : `${activeNotifs.length} notification${activeNotifs.length !== 1 ? 's' : ''} · tout est lu`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualiser
          </button>

          {!inTrashTab && activeUnread > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          )}

          {inTrashTab ? (
            <button
              className="btn btn-danger btn-sm"
              onClick={emptyTrash}
              disabled={trashedNotifs.length === 0}
            >
              <Trash2 size={14} /> Vider la corbeille
            </button>
          ) : (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleClearAll}
              disabled={activeNotifs.length === 0}
              title="Déplacer tout dans la corbeille"
            >
              <Trash2 size={14} /> Vider
            </button>
          )}
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

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '2px solid var(--border)',
        marginBottom: '1rem',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--brand)' : 'transparent'}`,
              marginBottom: '-2px',
              color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.id === 'trash'
              ? <Trash2 size={14} />
              : tab.id === 'unread'
                ? <Bell size={14} />
                : tab.id === 'read'
                  ? <Check size={14} />
                  : <Inbox size={14} />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: tab.id === 'trash' ? 'var(--text-muted)' : 'var(--brand)',
                color: '#fff',
                borderRadius: '99px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0 6px',
                lineHeight: '17px',
                minWidth: 17,
                textAlign: 'center',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table container ── */}
      <div className="table-container">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            {!inTrashTab && (
              <button
                className={`filter-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(v => !v)}
              >
                <SlidersHorizontal size={14} />
                Filtres
                {filterCat && (
                  <span style={{
                    background: 'var(--brand)', color: '#fff',
                    borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700,
                    padding: '0 5px', lineHeight: '16px', minWidth: 16, textAlign: 'center',
                  }}>1</span>
                )}
              </button>
            )}
            {inTrashTab && trashedNotifs.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={13} />
                {trashedNotifs.length} élément{trashedNotifs.length > 1 ? 's' : ''} dans la corbeille
              </span>
            )}
          </div>
          <div className="table-toolbar-right">
            <span className="pagination-info">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Filter panel (not in trash) */}
        {showFilters && !inTrashTab && (
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
            {filterCat && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFilterCat('')}>
                <X size={13} /> Effacer
              </button>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && notifications.length === 0 ? (
          <div className="loading-state" style={{ padding: '3rem' }}>
            <span style={{
              display: 'inline-block', width: 20, height: 20,
              border: '2px solid var(--border)', borderTopColor: 'var(--brand)',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            Chargement...
          </div>

        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            {inTrashTab
              ? <Trash2 size={44} style={{ color: 'var(--border-input)', marginBottom: '1rem' }} />
              : <Bell   size={44} style={{ color: 'var(--border-input)', marginBottom: '1rem' }} />}
            <h3 style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
              {inTrashTab ? 'Corbeille vide' : 'Aucune notification'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
              {inTrashTab
                ? 'Les notifications supprimées apparaîtront ici.'
                : filterCat ? 'Aucun résultat pour ce filtre.' : 'Vous êtes à jour !'}
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
                    background: inTrashTab
                      ? 'var(--bg-card)'
                      : notif.isRead ? 'var(--bg-card)' : 'var(--brand-subtle)',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: `3px solid ${
                      inTrashTab
                        ? 'var(--text-muted)'
                        : notif.isRead ? 'transparent' : meta.color
                    }`,
                    alignItems: 'flex-start',
                    opacity: inTrashTab ? 0.65 : 1,
                    cursor: (!inTrashTab && !notif.isRead) ? 'pointer' : 'default',
                    transition: 'background 0.15s ease',
                  }}
                  onClick={() => !inTrashTab && !notif.isRead && markAsRead(notif.id)}
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
                      <span style={{ fontWeight: notif.isRead ? 450 : 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                        {notif.title}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.04em', padding: '1px 6px', borderRadius: 4,
                        background: `${meta.color}18`, color: meta.color,
                      }}>
                        {meta.label}
                      </span>
                      {!notif.isRead && !inTrashTab && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                      )}
                      {inTrashTab && (
                        <span style={{
                          fontSize: '0.6875rem', fontWeight: 600,
                          padding: '1px 6px', borderRadius: 4,
                          background: 'var(--bg-input)', color: 'var(--text-muted)',
                        }}>
                          Supprimée
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '0.85rem', color: 'var(--text-secondary)',
                      lineHeight: 1.55, margin: '0.2rem 0 0.375rem',
                      opacity: (notif.isRead || inTrashTab) ? 0.75 : 1,
                    }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />
                        {timeAgo(notif.createdAt)}
                      </span>
                      {meta.link && !inTrashTab && (
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
                    {inTrashTab ? (
                      /* ── Trash actions ── */
                      <>
                        <button
                          className="action-btn action-view"
                          title="Restaurer"
                          onClick={() => restoreFromTrash(notif.id)}
                          style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button
                          className="action-btn"
                          title="Supprimer définitivement"
                          onClick={() => deleteFromTrash(notif.id)}
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      /* ── Normal actions ── */
                      <>
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
                          title="Déplacer dans la corbeille"
                          onClick={() => moveToTrash(notif.id)}
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
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
