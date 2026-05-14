import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Clock, Filter, Activity, User, Database } from 'lucide-react';
import { auditApi } from '../../api/audit';
import type { AuditLog } from '../../types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntite, setFilterEntite] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await auditApi.getAll({ search });
      setLogs(data);
    } catch {
      // Demo data
      setLogs([
        { id: 'log-001', action: 'CREATE', entite: 'AFFILIE', entiteId: 'aff-001', utilisateur: 'admin', details: 'Création de l\'affilié Alami Mohamed (CIN: BE123456)', adresseIp: '192.168.1.100', dateAction: '2024-03-18T10:30:00' },
        { id: 'log-002', action: 'UPDATE', entite: 'AFFILIE', entiteId: 'aff-001', utilisateur: 'admin', details: 'Mise à jour adresse: "12 Rue Hassan II" → "45 Av Mohammed V"', adresseIp: '192.168.1.100', dateAction: '2024-03-18T10:45:00' },
        { id: 'log-003', action: 'LOGIN', entite: 'AUTH', entiteId: 'user-admin', utilisateur: 'admin', details: 'Connexion réussie', adresseIp: '192.168.1.100', dateAction: '2024-03-18T09:00:00' },
        { id: 'log-004', action: 'CREATE', entite: 'CONTRIBUTION', entiteId: 'cont-001', utilisateur: 'admin', details: 'Contribution Article 6 enregistrée: 2024-03, Salaire: 12000 MAD', adresseIp: '192.168.1.100', dateAction: '2024-03-17T14:20:00' },
        { id: 'log-005', action: 'CREATE', entite: 'LIQUIDATION', entiteId: 'liq-001', utilisateur: 'm.alami', details: 'Demande de liquidation normale déposée', adresseIp: '192.168.1.52', dateAction: '2024-03-17T11:15:00' },
        { id: 'log-006', action: 'UPDATE', entite: 'LIQUIDATION', entiteId: 'liq-001', utilisateur: 'admin', details: 'Statut: DEPOSE → EN_COURS', adresseIp: '192.168.1.100', dateAction: '2024-03-17T15:00:00' },
        { id: 'log-007', action: 'SUSPEND', entite: 'AFFILIE', entiteId: 'aff-004', utilisateur: 'admin', details: 'Suspension de l\'affilié Daoudi Rachid (Article 7)', adresseIp: '192.168.1.100', dateAction: '2024-03-16T16:30:00' },
        { id: 'log-008', action: 'CREATE', entite: 'PAIEMENT', entiteId: 'pai-001', utilisateur: 'admin', details: 'Paiement pension planifié: 6500 MAD, virement', adresseIp: '192.168.1.100', dateAction: '2024-03-16T10:00:00' },
        { id: 'log-009', action: 'EXPORT', entite: 'AFFILIE', entiteId: 'aff-002', utilisateur: 'admin', details: 'Export CNDP des données de Benali Fatima', adresseIp: '192.168.1.100', dateAction: '2024-03-15T14:45:00' },
        { id: 'log-010', action: 'DELETE', entite: 'AFFILIE', entiteId: 'aff-099', utilisateur: 'admin', details: 'Anonymisation des données (CNDP Loi 09-08)', adresseIp: '192.168.1.100', dateAction: '2024-03-15T09:30:00' },
        { id: 'log-011', action: 'CREATE', entite: 'REVERSION', entiteId: 'ad-001', utilisateur: 'admin', details: 'Enregistrement ayant-droit: Alami Khadija (conjoint)', adresseIp: '192.168.1.100', dateAction: '2024-03-14T11:20:00' },
        { id: 'log-012', action: 'LOGIN_FAILED', entite: 'AUTH', entiteId: 'user-unknown', utilisateur: 'inconnu', details: 'Tentative de connexion échouée (3 essais)', adresseIp: '10.0.0.55', dateAction: '2024-03-14T03:15:00' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return '#10b981';
      case 'UPDATE': return '#3b82f6';
      case 'DELETE': return '#ef4444';
      case 'LOGIN': return '#8b5cf6';
      case 'LOGIN_FAILED': return '#ef4444';
      case 'SUSPEND': return '#f59e0b';
      case 'EXPORT': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '＋';
      case 'UPDATE': return '✎';
      case 'DELETE': return '✕';
      case 'LOGIN': return '→';
      case 'LOGIN_FAILED': return '✕';
      case 'SUSPEND': return '⏸';
      case 'EXPORT': return '↗';
      default: return '•';
    }
  };

  const getEntiteBadge = (e: string) => {
    switch (e) {
      case 'AFFILIE': return 'info';
      case 'AUTH': return 'warning';
      case 'CONTRIBUTION': return 'success';
      case 'LIQUIDATION': return 'info';
      case 'PAIEMENT': return 'success';
      case 'REVERSION': return 'warning';
      default: return 'info';
    }
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntites = [...new Set(logs.map(l => l.entite))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.utilisateur.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.entiteId.toLowerCase().includes(q) ||
      l.adresseIp?.includes(q);
    const matchAction = !filterAction || l.action === filterAction;
    const matchEntite = !filterEntite || l.entite === filterEntite;
    return matchSearch && matchAction && matchEntite;
  });

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'CREATE').length,
    updates: logs.filter(l => l.action === 'UPDATE').length,
    security: logs.filter(l => l.action === 'LOGIN' || l.action === 'LOGIN_FAILED' || l.action === 'DELETE').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Audit & Traçabilité</h1>
          <p>Journal des actions et événements système</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Actions', value: stats.total, color: '#3b82f6', icon: Activity },
          { label: 'Créations', value: stats.creates, color: '#10b981', icon: Database },
          { label: 'Modifications', value: stats.updates, color: '#f59e0b', icon: ShieldCheck },
          { label: 'Sécurité', value: stats.security, color: '#ef4444', icon: ShieldCheck },
        ].map((stat, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card-top">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}><stat.icon size={22} /></div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input type="text" placeholder="Rechercher par utilisateur, IP, détails..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.8rem' }}>
            <option value="">Toutes actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterEntite} onChange={e => setFilterEntite(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.8rem' }}>
            <option value="">Toutes entités</option>
            {uniqueEntites.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {loading ? (
          <div className="loading-state">Chargement des logs...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: '#fff',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  alignItems: 'flex-start',
                  borderLeft: i === 0 ? '1px solid var(--border)' : undefined,
                  borderRight: '1px solid var(--border)',
                  borderTop: i === 0 ? '1px solid var(--border)' : undefined,
                  borderRadius: i === 0 ? 'var(--radius-md) var(--radius-md) 0 0' : i === filtered.length - 1 ? '0 0 var(--radius-md) var(--radius-md)' : undefined,
                }}
                onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-main)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                {/* Timeline indicator */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `${getActionColor(log.action)}15`,
                  color: getActionColor(log.action),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '4px',
                      background: `${getActionColor(log.action)}15`, color: getActionColor(log.action),
                    }}>
                      {log.action}
                    </span>
                    <span className={`badge badge-${getEntiteBadge(log.entite)}`} style={{ fontSize: '0.7rem' }}>{log.entite}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {new Date(log.dateAction).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.25rem 0', lineHeight: 1.4 }}>
                    {log.details || 'Aucun détail'}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span><User size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{log.utilisateur}</span>
                    {log.adresseIp && <span>IP: {log.adresseIp}</span>}
                    <span className="td-mono" style={{ fontSize: '0.75rem' }}>{log.entiteId}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                Aucun événement trouvé
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: 'var(--brand)' }} />
              Détail de l'Événement
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Action</span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: '6px',
                  background: `${getActionColor(selectedLog.action)}15`, color: getActionColor(selectedLog.action),
                  display: 'inline-block',
                }}>
                  {selectedLog.action}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Entité</span>
                <span className={`badge badge-${getEntiteBadge(selectedLog.entite)}`}>{selectedLog.entite}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID Entité</span>
                <span className="detail-value td-mono">{selectedLog.entiteId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Utilisateur</span>
                <span className="detail-value">{selectedLog.utilisateur}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Adresse IP</span>
                <span className="detail-value td-mono">{selectedLog.adresseIp || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date & Heure</span>
                <span className="detail-value">{new Date(selectedLog.dateAction).toLocaleString('fr-FR')}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-label">Détails</span>
                <div style={{
                  background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', marginTop: '0.25rem',
                }}>
                  {selectedLog.details || 'Aucun détail supplémentaire'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
