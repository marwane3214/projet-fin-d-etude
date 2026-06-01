import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, CreditCard, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { paymentApi } from '../../api/payments';
import { affilieApi } from '../../api/affilies';
import { useAuth } from '../../contexts/AuthContext';
import type { Allocation, Paiement, Affilie } from '../../types';
import toast from 'react-hot-toast';

export default function PaymentListPage() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'allocations' | 'paiements'>('allocations');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [affilies, setAffilies] = useState<Affilie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [allocationPaiements, setAllocationPaiements] = useState<Paiement[]>([]);
  
  // Form states
  const [allocationForm, setAllocationForm] = useState<Partial<Allocation>>({
    affilieId: '',
    typeAllocation: 'PENSION_MENSUELLE',
    montant: 0,
    dateDebut: new Date().toISOString().split('T')[0],
    statut: 'ACTIVE',
  });
  
  const [paiementForm, setPaiementForm] = useState<Partial<Paiement>>({
    allocationId: '',
    montant: 0,
    datePaiement: new Date().toISOString().split('T')[0],
    modePaiement: 'VIREMENT',
    statut: 'PLANIFIE',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [allocData, paiData] = await Promise.all([
        paymentApi.getAllocations(),
        paymentApi.getPaiements(),
      ]);
      // If affilié (non-admin), filter to only show their own data
      if (!isAdmin && user?.username) {
        const myAllocs = allocData.filter(a =>
          a.affilieId === (user.affilieId || user.username) ||
          a.affilieUsername === user.username
        );
        setAllocations(myAllocs);
        const myAllocIds = new Set(myAllocs.map(a => a.id));
        setPaiements(paiData.filter(p => myAllocIds.has(p.allocationId)));
      } else {
        setAllocations(allocData);
        setPaiements(paiData);
      }
    } catch {
      // Demo data — filtered by role
      const allAllocs = [
        { id: 'alloc-001', affilieId: 'aff-003', affilieNom: 'Chakir Hassan', typeAllocation: 'PENSION_MENSUELLE', montant: 6500, dateDebut: '2024-01-01', statut: 'ACTIVE' },
        { id: 'alloc-002', affilieId: 'aff-004', affilieNom: 'Daoudi Rachid', typeAllocation: 'PENSION_MENSUELLE', montant: 8200, dateDebut: '2024-03-01', statut: 'ACTIVE' },
        { id: 'alloc-003', affilieId: 'aff-006', affilieNom: 'Fahmi Youssef', typeAllocation: 'CAPITAL_UNIQUE', montant: 450000, dateDebut: '2024-02-15', dateFin: '2024-02-15', statut: 'TERMINEE' },
        { id: 'alloc-004', affilieId: 'aff-007', affilieNom: 'Ghali Sara', typeAllocation: 'PECULE', montant: 85000, dateDebut: '2024-03-01', statut: 'SUSPENDUE' },
      ] as Allocation[];
      const allPais = [
        { id: 'pai-001', allocationId: 'alloc-001', montant: 6500, datePaiement: '2024-03-01', modePaiement: 'VIREMENT', reference: 'VIR-2024-0301', statut: 'EXECUTE' },
        { id: 'pai-002', allocationId: 'alloc-001', montant: 6500, datePaiement: '2024-02-01', modePaiement: 'VIREMENT', reference: 'VIR-2024-0201', statut: 'EXECUTE' },
        { id: 'pai-003', allocationId: 'alloc-002', montant: 8200, datePaiement: '2024-04-01', modePaiement: 'VIREMENT', reference: 'VIR-2024-0401', statut: 'PLANIFIE' },
        { id: 'pai-004', allocationId: 'alloc-003', montant: 450000, datePaiement: '2024-02-15', modePaiement: 'CHEQUE', reference: 'CHQ-2024-0215', statut: 'EXECUTE' },
        { id: 'pai-005', allocationId: 'alloc-002', montant: 8200, datePaiement: '2024-03-01', modePaiement: 'VIREMENT', reference: 'VIR-2024-0302', statut: 'EXECUTE' },
      ] as Paiement[];
      if (isAdmin) {
        setAllocations(allAllocs);
        setPaiements(allPais);
      } else {
        // Affilié sees only their own
        const myAllocs = allAllocs.filter(a =>
          a.affilieId === (user?.affilieId || user?.username) ||
          a.affilieUsername === user?.username
        );
        setAllocations(myAllocs);
        const myIds = new Set(myAllocs.map(a => a.id));
        setPaiements(allPais.filter(p => myIds.has(p.allocationId)));
      }
    }
    try {
      const affData = await affilieApi.getAll();
      setAffilies(affData);
    } catch {
      setAffilies([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.username]);

  const resetAllocationForm = () => setAllocationForm({
    affilieId: '', typeAllocation: 'PENSION_MENSUELLE', montant: 0,
    dateDebut: new Date().toISOString().split('T')[0], statut: 'ACTIVE',
  });

  const resetPaiementForm = () => setPaiementForm({
    allocationId: '', montant: 0, datePaiement: new Date().toISOString().split('T')[0],
    modePaiement: 'VIREMENT', statut: 'PLANIFIE',
  });

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.createAllocation(allocationForm);
      toast.success('Allocation créée');
      setShowAllocationModal(false);
      resetAllocationForm();
      loadData();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleCreatePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.createPaiement(paiementForm);
      toast.success('Paiement planifié');
      setShowPaiementModal(false);
      resetPaiementForm();
      loadData();
    } catch {
      toast.error("Erreur lors de la création du paiement");
    }
  };

  const openDetail = async (alloc: Allocation) => {
    setSelectedAllocation(alloc);
    try {
      const pais = await paymentApi.getPaiementsByAllocation(alloc.id!);
      setAllocationPaiements(pais);
    } catch {
      setAllocationPaiements(paiements.filter(p => p.allocationId === alloc.id));
    }
    setShowDetailModal(true);
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'PENSION_MENSUELLE': return 'Pension Mensuelle';
      case 'CAPITAL_UNIQUE': return 'Capital Unique';
      case 'PECULE': return 'Pécule';
      default: return t;
    }
  };

  const getModePaiementLabel = (m: string) => {
    switch (m) {
      case 'VIREMENT': return 'Virement';
      case 'CHEQUE': return 'Chèque';
      case 'ESPECES': return 'Espèces';
      default: return m;
    }
  };

  const getStatutAllocBadge = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDUE': return 'warning';
      case 'TERMINEE': return 'info';
      default: return 'info';
    }
  };

  const getStatutPaiBadge = (s: string) => {
    switch (s) {
      case 'PLANIFIE': return 'info';
      case 'EXECUTE': return 'success';
      case 'ECHOUE': return 'danger';
      case 'ANNULE': return 'warning';
      default: return 'info';
    }
  };

  const totalAllocationsActives = allocations.filter(a => a.statut === 'ACTIVE').reduce((s, a) => s + a.montant, 0);
  const totalPaiementsExecutes = paiements.filter(p => p.statut === 'EXECUTE').reduce((s, p) => s + p.montant, 0);

  const filteredAllocations = allocations.filter(a => {
    const q = search.toLowerCase();
    return !q || a.affilieNom?.toLowerCase().includes(q) || a.typeAllocation.toLowerCase().includes(q);
  });

  const filteredPaiements = paiements.filter(p => {
    const q = search.toLowerCase();
    return !q || p.reference?.toLowerCase().includes(q) || p.modePaiement.toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Paiements & Allocations' : 'Mes Paiements'}</h1>
          <p>{isAdmin ? 'Gestion des pensions, capitaux et paiements' : 'Historique de vos allocations et paiements'}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowPaiementModal(true)}>
              <DollarSign size={18} /> Nouveau Paiement
            </button>
            <button className="btn btn-primary" onClick={() => setShowAllocationModal(true)}>
              <Plus size={18} /> Nouvelle Allocation
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {[
          { label: 'Allocations Actives', value: allocations.filter(a => a.statut === 'ACTIVE').length, color: '#10b981', icon: CreditCard },
          { label: 'Mensualités Actives', value: `${totalAllocationsActives.toLocaleString('fr-MA')} MAD`, color: '#3b82f6', icon: DollarSign },
          { label: 'Paiements Exécutés', value: `${totalPaiementsExecutes.toLocaleString('fr-MA')} MAD`, color: '#8b5cf6', icon: CheckCircle },
          { label: 'Paiements Échoués', value: paiements.filter(p => p.statut === 'ECHOUE').length, color: '#ef4444', icon: XCircle },
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

      <div className="tabs">
        <button className={`tab ${activeTab === 'allocations' ? 'active' : ''}`} onClick={() => setActiveTab('allocations')}>
          Allocations ({allocations.length})
        </button>
        <button className={`tab ${activeTab === 'paiements' ? 'active' : ''}`} onClick={() => setActiveTab('paiements')}>
          Paiements ({paiements.length})
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={activeTab === 'allocations' ? 'Rechercher par nom, type...' : 'Rechercher par référence, mode...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <motion.div key={activeTab} className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : activeTab === 'allocations' ? (
          <table>
            <thead>
              <tr>
                <th>Affilié</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map(a => (
                <tr key={a.id}>
                  <td className="td-name">{a.affilieNom || a.affilieId}</td>
                  <td><span className="badge badge-info">{getTypeLabel(a.typeAllocation)}</span></td>
                  <td className="td-number">{a.montant.toLocaleString('fr-MA')} MAD{a.typeAllocation === 'PENSION_MENSUELLE' ? '/mois' : ''}</td>
                  <td>{new Date(a.dateDebut).toLocaleDateString('fr-FR')}</td>
                  <td>{a.dateFin ? new Date(a.dateFin).toLocaleDateString('fr-FR') : '—'}</td>
                  <td><span className={`badge badge-${getStatutAllocBadge(a.statut)}`}>{a.statut === 'ACTIVE' ? 'Active' : a.statut === 'SUSPENDUE' ? 'Suspendue' : 'Terminée'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn action-view" title="Voir paiements" onClick={() => openDetail(a)}><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAllocations.length === 0 && (
                <tr><td colSpan={7} className="empty-state">Aucune allocation trouvée</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Allocation</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaiements.map(p => (
                <tr key={p.id}>
                  <td className="td-mono">{p.reference || p.id?.split('-')[0] + '...'}</td>
                  <td className="td-mono">{p.allocationId.split('-').slice(0, 2).join('-')}</td>
                  <td className="td-number">{p.montant.toLocaleString('fr-MA')} MAD</td>
                  <td>{new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                  <td>{getModePaiementLabel(p.modePaiement)}</td>
                  <td><span className={`badge badge-${getStatutPaiBadge(p.statut)}`}>{p.statut === 'PLANIFIE' ? 'Planifié' : p.statut === 'EXECUTE' ? 'Exécuté' : p.statut === 'ECHOUE' ? 'Échoué' : 'Annulé'}</span></td>
                </tr>
              ))}
              {filteredPaiements.length === 0 && (
                <tr><td colSpan={6} className="empty-state">Aucun paiement trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Allocation Detail Modal */}
      {showDetailModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Détails de l'Allocation</h3>
            <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-item"><span className="detail-label">Affilié</span><span className="detail-value">{selectedAllocation.affilieNom}</span></div>
              <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{getTypeLabel(selectedAllocation.typeAllocation)}</span></div>
              <div className="detail-item"><span className="detail-label">Montant</span><span className="detail-value td-number">{selectedAllocation.montant.toLocaleString('fr-MA')} MAD</span></div>
              <div className="detail-item"><span className="detail-label">Statut</span><span className={`badge badge-${getStatutAllocBadge(selectedAllocation.statut)}`}>{selectedAllocation.statut}</span></div>
            </div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Historique des Paiements</h4>
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Montant</th><th>Mode</th><th>Référence</th><th>Statut</th></tr></thead>
                <tbody>
                  {allocationPaiements.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                      <td className="td-number">{p.montant.toLocaleString('fr-MA')} MAD</td>
                      <td>{getModePaiementLabel(p.modePaiement)}</td>
                      <td className="td-mono">{p.reference || '—'}</td>
                      <td><span className={`badge badge-${getStatutPaiBadge(p.statut)}`}>{p.statut}</span></td>
                    </tr>
                  ))}
                  {allocationPaiements.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun paiement enregistré</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Allocation Modal */}
      {showAllocationModal && (
        <div className="modal-overlay" onClick={() => { setShowAllocationModal(false); resetAllocationForm(); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h3>Nouvelle Allocation</h3>
            <form onSubmit={handleCreateAllocation} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Affilié *</label>
                <select className="form-control" value={allocationForm.affilieId} onChange={e => setAllocationForm({ ...allocationForm, affilieId: e.target.value })} required>
                  <option value="">Sélectionner...</option>
                  {affilies.map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Type d'Allocation *</label>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <select className="form-control" value={allocationForm.typeAllocation} onChange={e => setAllocationForm({ ...allocationForm, typeAllocation: e.target.value as any })}>
                  <option value="PENSION_MENSUELLE">Pension Mensuelle</option>
                  <option value="CAPITAL_UNIQUE">Capital Unique</option>
                  <option value="PECULE">Pécule</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Montant (MAD) *</label>
                  <input type="number" className="form-control" value={allocationForm.montant} onChange={e => setAllocationForm({ ...allocationForm, montant: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Date Début *</label>
                  <input type="date" className="form-control" value={allocationForm.dateDebut} onChange={e => setAllocationForm({ ...allocationForm, dateDebut: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowAllocationModal(false); resetAllocationForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Paiement Modal */}
      {showPaiementModal && (
        <div className="modal-overlay" onClick={() => { setShowPaiementModal(false); resetPaiementForm(); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h3>Nouveau Paiement</h3>
            {allocations.filter(a => a.statut === 'ACTIVE').length === 0 ? (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.95rem', color: '#92400e', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Aucune allocation active disponible
                </div>
                <p style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Pour créer un paiement, vous devez d'abord avoir une allocation au statut <strong>Active</strong>. Créez une nouvelle allocation ou réactivez-en une existante.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowPaiementModal(false); resetPaiementForm(); }}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    setShowPaiementModal(false);
                    resetPaiementForm();
                    setShowAllocationModal(true);
                  }}>
                    <Plus size={16} /> Créer une Allocation
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleCreatePaiement} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Allocation *</label>
                <select
                  className="form-control"
                  value={paiementForm.allocationId}
                  onChange={e => {
                    const allocId = e.target.value;
                    const alloc = allocations.find(a => a.id === allocId);
                    setPaiementForm({
                      ...paiementForm,
                      allocationId: allocId,
                      montant: alloc?.montant || 0,
                    });
                  }}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {allocations.filter(a => a.statut === 'ACTIVE').map(a => (
                    <option key={a.id} value={a.id}>{a.affilieNom} — {getTypeLabel(a.typeAllocation)} ({a.montant.toLocaleString()} MAD)</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Montant (MAD) *</label>
                  <input type="number" className="form-control" value={paiementForm.montant} onChange={e => setPaiementForm({ ...paiementForm, montant: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Date Paiement *</label>
                  <input type="date" className="form-control" value={paiementForm.datePaiement} onChange={e => setPaiementForm({ ...paiementForm, datePaiement: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Mode de Paiement</label>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <select className="form-control" value={paiementForm.modePaiement} onChange={e => setPaiementForm({ ...paiementForm, modePaiement: e.target.value as any })}>
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="ESPECES">Espèces</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Référence</label>
                  <input type="text" className="form-control" value={paiementForm.reference || ''} onChange={e => setPaiementForm({ ...paiementForm, reference: e.target.value })} placeholder="VIR-2024-XXXX" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowPaiementModal(false); resetPaiementForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-primary">Planifier</button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
