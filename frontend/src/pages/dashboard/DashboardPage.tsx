import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Wallet, FileText, CreditCard, TrendingUp, Clock, AlertTriangle, CheckCircle, Loader2, MessageSquare, Mail, CheckCheck, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { contributionApi } from '../../api/contributions';
import { affilieApi } from '../../api/affilies';
import { liquidationApi } from '../../api/liquidations';
import { paymentApi } from '../../api/payments';
import { supportApi } from '../../api/support';
import type { SupportTicket } from '../../api/support';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import type { Contribution, DemandeLiquidation, Affilie, Paiement } from '../../types';

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  return isAdmin ? <AdminDashboard /> : <AffilieDashboard username={user?.username || ''} />;
}

interface AdminStats {
  affiliesActifs: number;
  cotisationsMois: number;
  dossiersEnAttente: number;
  dossiersUrgents: number;
  paiementsPlanifies: number;
  paiementsExecutesMois: number;
  retractations: number;
}

interface DossierRow {
  id: string;
  affilieNom: string;
  type: string;
  date: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  statut: string;
}

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  DEPOSE: 'Déposé',
  ATTENTE_DOCS: 'Attente Docs',
  EN_COURS: 'En cours',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
  LIQUIDE: 'Liquidé',
  RETRACTE: 'Rétracté',
};

const TYPE_LABELS: Record<string, string> = {
  NORMALE: 'Liquidation Normale',
  ANTICIPEE: 'Liquidation Anticipée',
  PROROGEE: 'Retraite Prorogée',
  INVALIDITE: 'Retraite Invalidité',
};

function formatMAD(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M MAD`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K MAD`;
  return `${amount.toLocaleString('fr-MA')} MAD`;
}

function getPriority(dossier: DemandeLiquidation): 'Haute' | 'Moyenne' | 'Basse' {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  if (dossier.statut === 'EN_COURS' && new Date(dossier.dateDepot) < sevenDaysAgo) return 'Haute';
  if (dossier.statut === 'DEPOSE' || dossier.statut === 'ATTENTE_DOCS') return 'Moyenne';
  return 'Basse';
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    affiliesActifs: 0,
    cotisationsMois: 0,
    dossiersEnAttente: 0,
    dossiersUrgents: 0,
    paiementsPlanifies: 0,
    paiementsExecutesMois: 0,
    retractations: 0,
  });
  const [recentDossiers, setRecentDossiers] = useState<DossierRow[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportApi.getAll();
      setTickets(data);
    } catch {
      // service AI peut être offline, on ignore silencieusement
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleResolveTicket = async (id: number) => {
    try {
      await supportApi.resolve(id);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, statut: 'RESOLU' } : t));
      toast.success('Ticket marqué comme résolu');
    } catch {
      toast.error('Erreur lors de la résolution du ticket');
    }
  };

  const [sendingReset, setSendingReset] = useState<number | null>(null);

  const handleSendResetEmail = async (ticket: SupportTicket) => {
    setSendingReset(ticket.id);
    try {
      await authApi.forgotPassword(ticket.email);
      toast.success(`Email de réinitialisation envoyé à ${ticket.email}`);
    } catch {
      toast.error('Impossible d\'envoyer l\'email de réinitialisation');
    } finally {
      setSendingReset(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [affilies, contributions, liquidations, paiements] = await Promise.all([
        affilieApi.getAll({ size: 9999 }),
        contributionApi.getAll(),
        liquidationApi.getAll(),
        paymentApi.getPaiements(),
      ]);

      // Affiliés actifs
      const affiliesActifs = affilies.filter((a: Affilie) => a.status === 'ACTIVE').length;

      // Cotisations du mois en cours
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const cotisationsMois = contributions
        .filter((c: Contribution) => c.periode === currentPeriod)
        .reduce((sum: number, c: Contribution) => sum + (c.contributionSalariale || 0) + (c.contributionPatronale || 0), 0);

      // Dossiers en attente
      const pending = liquidations.filter((l: DemandeLiquidation) =>
        ['DEPOSE', 'ATTENTE_DOCS', 'EN_COURS'].includes(l.statut)
      );
      const dossiersEnAttente = pending.length;

      // Dossiers urgents: EN_COURS depuis plus de 7 jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dossiersUrgents = liquidations.filter((l: DemandeLiquidation) =>
        l.statut === 'EN_COURS' && new Date(l.dateDepot) < sevenDaysAgo
      ).length;

      // Paiements planifiés
      const paiementsPlanifies = paiements.filter((p: Paiement) => p.statut === 'PLANIFIE').length;

      // Paiements exécutés ce mois
      const paiementsExecutesMois = paiements.filter((p: Paiement) => {
        if (p.statut !== 'EXECUTE') return false;
        const d = new Date(p.datePaiement);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Rétractations
      const retractations = liquidations.filter((l: DemandeLiquidation) => l.statut === 'RETRACTE').length;

      setStats({ affiliesActifs, cotisationsMois, dossiersEnAttente, dossiersUrgents, paiementsPlanifies, paiementsExecutesMois, retractations });

      // Récents dossiers avec noms réels
      const affilieMap = new Map<string, string>(
        affilies.map((a: Affilie) => [a.id, `${a.nom} ${a.prenom}`] as [string, string])
      );

      const recent: DossierRow[] = liquidations
        .sort((a: DemandeLiquidation, b: DemandeLiquidation) =>
          new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime()
        )
        .slice(0, 5)
        .map((l: DemandeLiquidation) => ({
          id: l.id || '',
          affilieNom: affilieMap.get(l.affilieId) || l.affilieId,
          type: TYPE_LABELS[l.typeLiquidation] || l.typeLiquidation,
          date: new Date(l.dateDepot).toLocaleDateString('fr-MA'),
          priority: getPriority(l),
          statut: STATUT_LABELS[l.statut] || l.statut,
        }));

      setRecentDossiers(recent);
    } catch (err) {
      console.error('Erreur chargement dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Affiliés Actifs',
      value: loading ? '...' : stats.affiliesActifs.toLocaleString('fr-MA'),
      icon: Users,
      color: '#3b82f6',
      trend: 'Total actifs',
    },
    {
      label: 'Cotisations du Mois',
      value: loading ? '...' : formatMAD(stats.cotisationsMois),
      icon: Wallet,
      color: '#10b981',
      trend: 'Mois en cours',
    },
    {
      label: 'Dossiers en Attente',
      value: loading ? '...' : stats.dossiersEnAttente.toString(),
      icon: FileText,
      color: '#f59e0b',
      trend: stats.dossiersUrgents > 0 ? `${stats.dossiersUrgents} urgents` : 'Aucun urgent',
    },
    {
      label: 'Paiements Planifiés',
      value: loading ? '...' : stats.paiementsPlanifies.toString(),
      icon: CreditCard,
      color: '#8b5cf6',
      trend: 'En attente d\'exécution',
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Tableau de Bord Administrateur</h1>
        <p>Vue d'ensemble de l'activité CIMR</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
          >
            <div className="stat-card-top">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <span className="stat-trend">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><TrendingUp size={14} /> {stat.trend}</>}
              </span>
            </div>
            <div className="stat-value">
              {loading ? <Loader2 size={22} className="animate-spin" style={{ color: stat.color }} /> : stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card large">
          <div className="card-header">
            <h3>Dossiers Récents</h3>
            <Link to="/liquidations" className="card-link">Voir tout →</Link>
          </div>
          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: '#3b82f6' }} />
              </div>
            ) : recentDossiers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Aucun dossier</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Affilié</th>
                    <th>Type de Demande</th>
                    <th>Date</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDossiers.map(d => (
                    <tr key={d.id}>
                      <td className="td-name">{d.affilieNom}</td>
                      <td>{d.type}</td>
                      <td>{d.date}</td>
                      <td>
                        <span className={`badge badge-${d.priority === 'Haute' ? 'danger' : d.priority === 'Moyenne' ? 'warning' : 'info'}`}>
                          {d.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${d.statut === 'Validé' || d.statut === 'Liquidé' ? 'success' : d.statut === 'En cours' || d.statut === 'Déposé' ? 'warning' : d.statut === 'Rejeté' ? 'danger' : 'info'}`}>
                          {d.statut}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate('/liquidations')}
                        >
                          Traiter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Alertes</h3>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={24} className="animate-spin" style={{ color: '#3b82f6' }} />
            </div>
          ) : (
            <div className="alert-list">
              {stats.dossiersUrgents > 0 && (
                <div className="alert-item alert-danger">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{stats.dossiersUrgents} dossier{stats.dossiersUrgents > 1 ? 's' : ''} urgent{stats.dossiersUrgents > 1 ? 's' : ''}</strong>
                    <p>Délai de traitement dépassé (7j+)</p>
                  </div>
                </div>
              )}
              {stats.retractations > 0 && (
                <div className="alert-item alert-warning">
                  <Clock size={18} />
                  <div>
                    <strong>{stats.retractations} rétractation{stats.retractations > 1 ? 's' : ''}</strong>
                    <p>Dossiers rétractés à archiver</p>
                  </div>
                </div>
              )}
              {stats.dossiersEnAttente > 0 && (
                <div className="alert-item alert-warning">
                  <FileText size={18} />
                  <div>
                    <strong>{stats.dossiersEnAttente} dossier{stats.dossiersEnAttente > 1 ? 's' : ''} en attente</strong>
                    <p>À traiter par les agents</p>
                  </div>
                </div>
              )}
              {stats.paiementsExecutesMois > 0 && (
                <div className="alert-item alert-success">
                  <CheckCircle size={18} />
                  <div>
                    <strong>{stats.paiementsExecutesMois} paiement{stats.paiementsExecutesMois > 1 ? 's' : ''} exécuté{stats.paiementsExecutesMois > 1 ? 's' : ''}</strong>
                    <p>Virements ce mois</p>
                  </div>
                </div>
              )}
              {stats.dossiersUrgents === 0 && stats.retractations === 0 && stats.dossiersEnAttente === 0 && stats.paiementsExecutesMois === 0 && (
                <div className="alert-item alert-success">
                  <CheckCircle size={18} />
                  <div>
                    <strong>Tout est à jour</strong>
                    <p>Aucune alerte en cours</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="#3b82f6" /> Tickets Support
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {ticketsLoading ? '...' : `${tickets.filter(t => t.statut === 'OUVERT').length} ouvert(s)`}
          </span>
        </div>
        {ticketsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : tickets.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Aucun ticket support</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Sujet</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{t.id}</td>
                    <td className="td-name">{t.nom}</td>
                    <td>
                      <a href={`mailto:${t.email}`} style={{ color: '#3b82f6', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={13} /> {t.email}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {t.sujet === 'connexion' ? 'Prob. connexion' : 'Autre demande'}
                    </td>
                    <td style={{ maxWidth: 220, fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={t.message}>
                      {t.message}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString('fr-MA')}
                    </td>
                    <td>
                      <span className={`badge badge-${t.statut === 'OUVERT' ? 'warning' : 'success'}`}>
                        {t.statut === 'OUVERT' ? 'Ouvert' : 'Résolu'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleSendResetEmail(t)}
                          disabled={sendingReset === t.id}
                          title="Envoyer un email de réinitialisation du mot de passe"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          {sendingReset === t.id
                            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            : <KeyRound size={13} />
                          }
                          Réinit. MDP
                        </button>
                        {t.statut === 'OUVERT' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleResolveTicket(t.id)}
                            title="Marquer comme résolu"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <CheckCheck size={14} /> Résoudre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AffilieDashboard({ username }: { username: string }) {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.affilieId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const pointsData = await contributionApi.getPoints(user?.affilieId || '');
      setTotalPoints(pointsData.totalPoints || 0);

      const contributions = await contributionApi.getHistory(user?.affilieId || '');
      setRecentContributions(contributions.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Bienvenue, {username}</h1>
        <p>Votre espace personnel CIMR</p>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}><Wallet size={22} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : totalPoints.toLocaleString('fr-MA')}</div>
          <div className="stat-label">Points Acquis</div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: '#10b98115', color: '#10b981' }}><TrendingUp size={22} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : (totalPoints * 1.2).toLocaleString('fr-MA')} MAD</div>
          <div className="stat-label">Estimation Pension / Mois</div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}><Clock size={22} /></div>
          </div>
          <div className="stat-value">65%</div>
          <div className="stat-label">Taux de Remplacement</div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card large">
          <div className="card-header">
            <h3>Mes Cotisations Récentes</h3>
            <Link to="/contributions" className="card-link">Historique complet →</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Période</th><th>Salaire Déclaré</th><th>Cotisation Totale</th><th>Points</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {recentContributions.length > 0 ? recentContributions.map((c, i) => (
                  <tr key={i}>
                    <td>{c.periode}</td>
                    <td>{c.salaireMensuel?.toLocaleString('fr-MA')} MAD</td>
                    <td>{((c.contributionSalariale || 0) + (c.contributionPatronale || 0)).toLocaleString('fr-MA')} MAD</td>
                    <td>{(((c.contributionSalariale || 0) + (c.contributionPatronale || 0)) / 15.25).toFixed(2)}</td>
                    <td><span className="badge badge-success">Validée</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Aucune cotisation récente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header"><h3>Actions Rapides</h3></div>
          <div className="quick-actions">
            <Link to="/liquidations/new" className="quick-action-btn">
              <FileText size={20} />
              <span>Demande de Liquidation</span>
            </Link>
            <Link to="/contributions" className="quick-action-btn">
              <Wallet size={20} />
              <span>Mes Cotisations</span>
            </Link>
            <Link to="/payments" className="quick-action-btn">
              <CreditCard size={20} />
              <span>Mes Paiements</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
