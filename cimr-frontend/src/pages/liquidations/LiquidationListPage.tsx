import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Eye, CheckCircle, XCircle, Clock, RotateCcw,
  Filter, FileText, Download, Paperclip, Building2, AlertTriangle
} from 'lucide-react';
import { liquidationApi } from '../../api/liquidations';
import { useAuth } from '../../contexts/AuthContext';
import type { DemandeLiquidation, StatutDossier } from '../../types';
import toast from 'react-hot-toast';

export default function LiquidationListPage() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState<DemandeLiquidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeLiquidation | null>(null);
  const [newStatut, setNewStatut] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailDemande, setDetailDemande] = useState<DemandeLiquidation | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await liquidationApi.getAll(isAdmin ? undefined : user?.username);
      setDemandes(data);
    } catch {
      // Demo data
      setDemandes([
        {
          id: '1', affilieId: 'aff-001', affilieNom: 'Alami Mohamed', typeLiquidation: 'NORMALE',
          dateDepot: '2024-03-15', montantPension: 6500, statut: 'EN_COURS',
          documents: [
            { id: 'd1', demandeLiquidationId: '1', typeDocument: 'cin', nomFichier: 'cin_recto_verso.pdf', tailleFichier: 245000, statut: 'VALIDE', uploadDate: '2024-03-15' },
            { id: 'd2', demandeLiquidationId: '1', typeDocument: 'attestation', nomFichier: 'attestation_travail.pdf', tailleFichier: 180000, statut: 'VALIDE', uploadDate: '2024-03-15' },
            { id: 'd3', demandeLiquidationId: '1', typeDocument: 'rib', nomFichier: 'rib_cih.jpg', tailleFichier: 120000, statut: 'EN_ATTENTE', uploadDate: '2024-03-15' },
            { id: 'd4', demandeLiquidationId: '1', typeDocument: 'acte_naissance', nomFichier: 'acte_naissance_2024.pdf', tailleFichier: 95000, statut: 'EN_ATTENTE', uploadDate: '2024-03-15' },
          ],
          createdAt: '2024-03-15T10:00:00',
        },
        {
          id: '2', affilieId: 'aff-002', affilieNom: 'Benali Fatima', typeLiquidation: 'ANTICIPEE',
          dateDepot: '2024-03-10', montantPension: 4200, statut: 'DEPOSE',
          documents: [
            { id: 'd5', demandeLiquidationId: '2', typeDocument: 'cin', nomFichier: 'cin_benali.pdf', tailleFichier: 210000, statut: 'EN_ATTENTE', uploadDate: '2024-03-10' },
            { id: 'd6', demandeLiquidationId: '2', typeDocument: 'rib', nomFichier: 'rib_attijariwafa.pdf', tailleFichier: 150000, statut: 'EN_ATTENTE', uploadDate: '2024-03-10' },
          ],
          createdAt: '2024-03-10T14:30:00',
        },
        {
          id: '3', affilieId: 'aff-003', affilieNom: 'Chakir Hassan', typeLiquidation: 'NORMALE',
          dateDepot: '2024-02-20', montantPension: 8500, statut: 'VALIDE',
          documents: [
            { id: 'd7', demandeLiquidationId: '3', typeDocument: 'cin', nomFichier: 'cin_chakir.pdf', tailleFichier: 230000, statut: 'VALIDE', uploadDate: '2024-02-20' },
            { id: 'd8', demandeLiquidationId: '3', typeDocument: 'attestation', nomFichier: 'cessation_activite.pdf', tailleFichier: 195000, statut: 'VALIDE', uploadDate: '2024-02-20' },
            { id: 'd9', demandeLiquidationId: '3', typeDocument: 'rib', nomFichier: 'rib_bp.jpg', tailleFichier: 100000, statut: 'VALIDE', uploadDate: '2024-02-20' },
            { id: 'd10', demandeLiquidationId: '3', typeDocument: 'acte_naissance', nomFichier: 'acte_naissance_chakir.pdf', tailleFichier: 88000, statut: 'VALIDE', uploadDate: '2024-02-20' },
          ],
          createdAt: '2024-02-20T09:15:00',
        },
        {
          id: '4', affilieId: 'aff-004', affilieNom: 'Daoudi Rachid', typeLiquidation: 'PROROGEE',
          dateDepot: '2024-01-15', montantPension: 8200, statut: 'LIQUIDE', dateLiquidation: '2024-03-01',
          createdAt: '2024-01-15T11:00:00',
        },
        {
          id: '5', affilieId: 'aff-005', affilieNom: 'El Fassi Amina', typeLiquidation: 'INVALIDITE',
          dateDepot: '2024-03-18', montantPension: 3800, statut: 'REJETE',
          motifRejet: 'Pièces justificatives manquantes — CIN et attestation de travail non fournis',
          createdAt: '2024-03-18T16:45:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande?.id) return;
    try {
      await liquidationApi.updateStatus(selectedDemande.id, newStatut, newStatut === 'REJETE' ? motifRejet : undefined);
      toast.success('Statut mis à jour');
      setShowStatusModal(false);
      setSelectedDemande(null);
      setMotifRejet('');
      loadData();
    } catch {
      // Demo: update locally
      setDemandes(prev => prev.map(d =>
        d.id === selectedDemande.id ? { ...d, statut: newStatut as any, motifRejet: newStatut === 'REJETE' ? motifRejet : undefined } : d
      ));
      toast.success('Statut mis à jour');
      setShowStatusModal(false);
      setSelectedDemande(null);
      setMotifRejet('');
    }
  };

  const openStatusModal = (demande: DemandeLiquidation) => {
    setSelectedDemande(demande);
    setNewStatut(demande.statut);
    setShowStatusModal(true);
  };

  const openDetailModal = async (demande: DemandeLiquidation) => {
    try {
      const full = await liquidationApi.getById(demande.id!);
      setDetailDemande(full);
    } catch {
      setDetailDemande(demande);
    }
    setShowDetailModal(true);
  };

  const filtered = demandes.filter(d => {
    const matchSearch = !search ||
      d.affilieNom?.toLowerCase().includes(search.toLowerCase()) ||
      d.id?.includes(search) ||
      d.typeLiquidation.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || d.statut === filterStatut;
    
    // Tab filter
    const isProcessed = ['VALIDE', 'REJETE', 'LIQUIDE'].includes(d.statut);
    const matchTab = activeTab === 'history' ? isProcessed : !isProcessed;

    return matchSearch && matchStatut && matchTab;
  });

  const getStatutBadge = (s: StatutDossier) => {
    switch (s) {
      case 'DEPOSE': return 'info';
      case 'ATTENTE_DOCS': return 'warning';
      case 'EN_COURS': return 'info';
      case 'VALIDE': return 'success';
      case 'REJETE': return 'danger';
      case 'LIQUIDE': return 'success';
      default: return 'info';
    }
  };

  const getStatutLabel = (s: StatutDossier) => {
    switch (s) {
      case 'DEPOSE': return 'Déposé';
      case 'ATTENTE_DOCS': return 'Attente docs physiques';
      case 'EN_COURS': return 'En cours d\'examen';
      case 'VALIDE': return 'Vérifié & Validé';
      case 'REJETE': return 'Rejeté';
      case 'LIQUIDE': return 'Liquidé (Terminé)';
      case 'BROUILLON': return 'Brouillon';
      case 'RETRACTE': return 'Rétracté';
      default: return s;
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'NORMALE': return 'Normale';
      case 'ANTICIPEE': return 'Anticipée';
      case 'PROROGEE': return 'Prorogée';
      case 'INVALIDITE': return 'Invalidité';
      default: return t;
    }
  };

  const getDocStatusBadge = (s: string) => {
    switch (s) {
      case 'VALIDE': return 'success';
      case 'REJETE': return 'danger';
      default: return 'warning';
    }
  };

  const stats = {
    total: demandes.length,
    enCours: demandes.filter(d => d.statut === 'EN_COURS' || d.statut === 'DEPOSE').length,
    valides: demandes.filter(d => d.statut === 'VALIDE' || d.statut === 'LIQUIDE').length,
    rejetes: demandes.filter(d => d.statut === 'REJETE').length,
  };

  // ═══════════════════════════════════════════════════════
  //  AFFILIATE VIEW — Single request status tracker
  // ═══════════════════════════════════════════════════════
  if (!isAdmin) {
    const myDemande = demandes.find(d => d.affilieId === user?.username);
    const hasSubmitted = !!myDemande || localStorage.getItem(`cimr_liquidation_submitted_${user?.username}`) === 'true';

    // No request yet
    if (!hasSubmitted && !myDemande) {
      return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1>Liquidation de Dossier</h1>
              <p>Déposer votre demande de liquidation des droits CIMR</p>
            </div>
          </div>

          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '700px', textAlign: 'center', padding: '3rem' }}
          >
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--info-bg)', color: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <FileText size={40} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Liquider vos droits CIMR</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 1rem' }}>
              Vous pouvez déposer une demande de liquidation de vos droits acquis auprès de la CIMR. 
              Cette demande ne peut être soumise <strong>qu'une seule fois</strong>.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 2rem' }}>
              Préparez vos documents (CIN, attestation de travail, RIB, acte de naissance) 
              avant de commencer.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/liquidations/new')} style={{ padding: '0.875rem 2rem' }}>
              <Plus size={18} /> Déposer ma demande
            </button>
          </motion.div>
        </div>
      );
    }

    // Already submitted — show status tracker
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Ma Demande de Liquidation</h1>
            <p>Suivi de votre dossier</p>
          </div>
        </div>

        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '700px' }}
        >
          {/* Status tracker */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="form-section-title" style={{ marginBottom: '1.5rem' }}><Clock size={20} /> Statut du Dossier</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Demande déposée en ligne', match: ['DEPOSE', 'ATTENTE_DOCS', 'EN_COURS', 'VALIDE', 'LIQUIDE'] },
                { label: 'Dossier numérique vérifié', match: ['ATTENTE_DOCS', 'EN_COURS', 'VALIDE', 'LIQUIDE'] },
                { label: 'Vérification des pièces originales en agence', match: ['EN_COURS', 'VALIDE', 'LIQUIDE'] },
                { label: 'Dossier validé final', match: ['VALIDE', 'LIQUIDE'] },
                { label: 'Liquidation terminée', match: ['LIQUIDE'] },
              ].map((s, i) => {
                const isDone = s.match.includes(myDemande?.statut || '');
                const isCurrent = myDemande?.statut === s.match[0];
                return (
                  <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    {/* Timeline line */}
                    {i < 4 && (
                      <div style={{
                        position: 'absolute', left: '15px', top: '32px', width: '2px', height: 'calc(100% - 16px)',
                        background: isDone ? 'var(--success)' : 'var(--border)',
                      }} />
                    )}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, zIndex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? 'var(--success)' : isCurrent ? 'var(--brand)' : 'var(--bg-input)',
                      color: isDone || isCurrent ? '#fff' : 'var(--text-muted)',
                      border: isCurrent ? '3px solid var(--info-bg)' : 'none',
                    }}>
                      {isDone && !isCurrent ? <CheckCircle size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    <div style={{ padding: '0.25rem 0 1.5rem' }}>
                      <div style={{ fontWeight: isCurrent ? 700 : 500, fontSize: '0.9rem', color: !isDone && !isCurrent ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {s.label}
                      </div>
                      {isCurrent && (
                        <span className="badge badge-warning" style={{ marginTop: '4px' }}>En cours</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical papers reminder */}
          <div style={{
            background: 'var(--warning-bg)', border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <Building2 size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#92400e' }}>N'oubliez pas vos documents originaux</strong>
              <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                Présentez-vous à l'agence CIMR avec les originaux de vos documents pour finaliser votre dossier.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Vous souhaitez corriger des documents ou remplacer votre demande actuelle ?
            </p>
            <button className="btn btn-ghost" onClick={() => navigate('/liquidations/new')} style={{ border: '1px solid var(--border)' }}>
              <RotateCcw size={16} /> Soumettre une nouvelle demande
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  ADMIN VIEW — Full management dashboard
  // ═══════════════════════════════════════════════════════
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestion des Liquidations</h1>
          <p>Examiner et traiter les demandes de liquidation</p>
        </div>
      </div>

      <div className="tab-navigation" style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', display: 'flex', gap: '2rem' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '1rem 0.5rem', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontWeight: 600,
            borderBottom: activeTab === 'pending' ? '3px solid #004a99' : '3px solid transparent',
            color: activeTab === 'pending' ? '#004a99' : '#666'
          }}
        >
          Dossiers en attente ({demandes.filter(d => !['VALIDE', 'REJETE', 'LIQUIDE'].includes(d.statut)).length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '1rem 0.5rem', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontWeight: 600,
            borderBottom: activeTab === 'history' ? '3px solid #004a99' : '3px solid transparent',
            color: activeTab === 'history' ? '#004a99' : '#666'
          }}
        >
          Historique des dossiers traités ({demandes.filter(d => ['VALIDE', 'REJETE', 'LIQUIDE'].includes(d.statut)).length})
        </button>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Demandes', value: stats.total, color: '#3b82f6', icon: FileText },
          { label: 'En Attente', value: stats.enCours, color: '#f59e0b', icon: Clock },
          { label: 'Validées / Liquidées', value: stats.valides, color: '#10b981', icon: CheckCircle },
          { label: 'Rejetées', value: stats.rejetes, color: '#ef4444', icon: XCircle },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-card-top">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={22} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, ID, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }}
          >
            <option value="">Tous les statuts</option>
            <option value="DEPOSE">Déposé</option>
            <option value="ATTENTE_DOCS">Attente docs</option>
            <option value="EN_COURS">En cours</option>
            <option value="VALIDE">Validé</option>
            <option value="REJETE">Rejeté</option>
            <option value="LIQUIDE">Liquidé</option>
          </select>
        </div>
      </div>

      <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {loading ? (
          <div className="loading-state">Chargement des dossiers...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Affilié</th>
                <th>Type Retraite</th>
                <th>Date Dépôt</th>
                <th>Documents</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td className="td-name">{d.affilieNom || d.affilieId}</td>
                  <td><span className="badge badge-info">{getTypeLabel(d.typeLiquidation)}</span></td>
                  <td>{new Date(d.dateDepot).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Paperclip size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem' }}>{d.documents?.length || 0} fichier(s)</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${getStatutBadge(d.statut)}`}>{getStatutLabel(d.statut)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn action-view" title="Voir le dossier" onClick={() => openDetailModal(d)}>
                        <Eye size={16} />
                      </button>
                      <button className="action-btn action-edit" title="Changer Statut" onClick={() => openStatusModal(d)}>
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="empty-state">Aucun dossier de liquidation trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Detail Modal — with documents review */}
      {showDetailModal && detailDemande && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Dossier de Liquidation</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Affilié</span>
                <span className="detail-value">{detailDemande.affilieNom || detailDemande.affilieId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type Retraite</span>
                <span className="detail-value">{getTypeLabel(detailDemande.typeLiquidation)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Statut</span>
                <span className={`badge badge-${getStatutBadge(detailDemande.statut)}`}>{getStatutLabel(detailDemande.statut)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Dépôt</span>
                <span className="detail-value">{new Date(detailDemande.dateDepot).toLocaleDateString('fr-FR')}</span>
              </div>
              {detailDemande.dateLiquidation && (
                <div className="detail-item">
                  <span className="detail-label">Date Liquidation</span>
                  <span className="detail-value">{new Date(detailDemande.dateLiquidation).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {detailDemande.montantPension && (
                <div className="detail-item">
                  <span className="detail-label">Pension Estimée</span>
                  <span className="detail-value td-number">{detailDemande.montantPension.toLocaleString('fr-MA')} MAD/mois</span>
                </div>
              )}
            </div>

            {detailDemande.motifRejet && (
              <div style={{
                marginTop: '1.5rem', padding: '1rem',
                background: 'var(--danger-bg)', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#991b1b', fontSize: '0.875rem' }}>Motif de Rejet</strong>
                  <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: '0.25rem 0 0' }}>{detailDemande.motifRejet}</p>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {detailDemande.documents && detailDemande.documents.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Paperclip size={16} /> Documents joints ({detailDemande.documents.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detailDemande.documents.map(doc => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                    }}>
                      <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.nomFichier}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.tailleFichier ? `${(doc.tailleFichier / 1024).toFixed(0)} Ko` : ''} • {doc.typeDocument}
                        </div>
                      </div>
                      <span className={`badge badge-${getDocStatusBadge(doc.statut)}`} style={{ fontSize: '0.7rem' }}>
                        {doc.statut === 'EN_ATTENTE' ? 'En attente' : doc.statut === 'VALIDE' ? 'Validé' : 'Rejeté'}
                      </span>
                      <button
                        className="action-btn action-view"
                        title="Aperçu"
                        onClick={() => {
                          const url = `http://localhost:8080/api/liquidations/documents/${doc.id}`;
                          setPreviewDoc({ url, name: doc.nomFichier });
                        }}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!detailDemande.documents || detailDemande.documents.length === 0) && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#92400e', textAlign: 'center' }}>
                Aucun document joint à cette demande
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Fermer</button>
              
              {isAdmin && detailDemande.statut === 'DEPOSE' && (
                <button 
                  className="btn btn-success" 
                  onClick={async () => {
                    try {
                      await liquidationApi.updateStatus(detailDemande.id!, 'ATTENTE_DOCS', 'Documents numériques vérifiés. Veuillez apporter les originaux en agence.');
                      toast.success('Dossier validé numériquement');
                      setShowDetailModal(false);
                      loadData();
                    } catch {
                      toast.error('Erreur lors de la validation');
                    }
                  }}
                >
                  <CheckCircle size={16} /> Valider dossier numérique
                </button>
              )}

              <button className="btn btn-primary" onClick={() => { setShowDetailModal(false); openStatusModal(detailDemande); }}>
                <RotateCcw size={16} /> Changer le Statut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedDemande && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <h3>Changer le Statut</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Dossier de <strong>{selectedDemande.affilieNom}</strong>
            </p>
            <form onSubmit={handleStatusChange}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nouveau Statut</label>
                <select className="form-control" value={newStatut} onChange={e => setNewStatut(e.target.value)} required>
                  <option value="DEPOSE">Déposé</option>
                  <option value="ATTENTE_DOCS">Attente docs physiques</option>
                  <option value="EN_COURS">En cours d'examen</option>
                  <option value="VALIDE">Vérifié & Validé</option>
                  <option value="REJETE">Rejeté</option>
                  <option value="LIQUIDE">Liquidé / Terminé</option>
                </select>
              </div>
              {newStatut === 'REJETE' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Motif du Rejet</label>
                  <textarea
                    className="form-control"
                    value={motifRejet}
                    onChange={e => setMotifRejet(e.target.value)}
                    rows={3}
                    placeholder="Précisez le motif du rejet..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowStatusModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Appliquer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%', height: '80vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Aperçu: {previewDoc.name}</h3>
              <button className="close-btn" onClick={() => setPreviewDoc(null)}>×</button>
            </div>
            <div style={{ flex: 1, background: '#f5f5f5' }}>
              <iframe 
                src={previewDoc.url} 
                title={previewDoc.name}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
