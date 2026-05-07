import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Wallet, FileText, CreditCard, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contributionApi } from '../../api/contributions';
import type { Contribution } from '../../types';

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  return isAdmin ? <AdminDashboard /> : <AffilieDashboard username={user?.username || ''} />;
}

function AdminDashboard() {
  const stats = [
    { label: 'Affiliés Actifs', value: '1 247', icon: Users, color: '#3b82f6', trend: '+12 ce mois' },
    { label: 'Cotisations du Mois', value: '2.4M MAD', icon: Wallet, color: '#10b981', trend: '+8.2%' },
    { label: 'Dossiers en Attente', value: '23', icon: FileText, color: '#f59e0b', trend: '5 urgents' },
    { label: 'Paiements Planifiés', value: '156', icon: CreditCard, color: '#8b5cf6', trend: 'Ce trimestre' },
  ];

  const recentDossiers = [
    { id: 1, nom: 'Alami Mohamed', type: 'Liquidation Normale', date: '15/03/2024', priority: 'Haute', statut: 'En cours' },
    { id: 2, nom: 'Benali Fatima', type: 'Réversion Conjoint', date: '14/03/2024', priority: 'Moyenne', statut: 'En attente' },
    { id: 3, nom: 'Chakir Hassan', type: 'Liquidation Anticipée', date: '13/03/2024', priority: 'Basse', statut: 'Validé' },
    { id: 4, nom: 'Daoudi Rachid', type: 'Retraite Prorogée', date: '12/03/2024', priority: 'Haute', statut: 'En cours' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Tableau de Bord Administrateur</h1>
        <p>Vue d'ensemble de l'activité CIMR</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
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
              <span className="stat-trend"><TrendingUp size={14} /> {stat.trend}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
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
                    <td className="td-name">{d.nom}</td>
                    <td>{d.type}</td>
                    <td>{d.date}</td>
                    <td><span className={`badge badge-${d.priority === 'Haute' ? 'danger' : d.priority === 'Moyenne' ? 'warning' : 'info'}`}>{d.priority}</span></td>
                    <td><span className={`badge badge-${d.statut === 'Validé' ? 'success' : d.statut === 'En cours' ? 'warning' : 'info'}`}>{d.statut}</span></td>
                    <td><button className="btn btn-sm btn-primary">Traiter</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Alertes</h3>
          </div>
          <div className="alert-list">
            <div className="alert-item alert-danger">
              <AlertTriangle size={18} />
              <div>
                <strong>5 dossiers urgents</strong>
                <p>Délai de traitement dépassé</p>
              </div>
            </div>
            <div className="alert-item alert-warning">
              <Clock size={18} />
              <div>
                <strong>12 rétractations</strong>
                <p>Période de 3 mois expire bientôt</p>
              </div>
            </div>
            <div className="alert-item alert-success">
              <CheckCircle size={18} />
              <div>
                <strong>45 paiements exécutés</strong>
                <p>Virements ce mois</p>
              </div>
            </div>
          </div>
        </div>
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
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const pointsData = await contributionApi.getPoints(user?.affilieId || '');
      setTotalPoints(pointsData.totalPoints || 0);

      const contributions = await contributionApi.getHistory(user?.affilieId || '');
      setRecentContributions(contributions.slice(0, 5));
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
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
