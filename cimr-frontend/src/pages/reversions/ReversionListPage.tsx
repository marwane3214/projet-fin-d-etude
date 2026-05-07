import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Heart, UserCheck, UserX, Eye, RotateCcw, Filter } from 'lucide-react';
import { reversionApi } from '../../api/reversions';
import { affilieApi } from '../../api/affilies';
import { useAuth } from '../../contexts/AuthContext';
import type { AyantDroit, Affilie } from '../../types';
import toast from 'react-hot-toast';

export default function ReversionListPage() {
  const { isAdmin } = useAuth();
  const [ayantsDroit, setAyantsDroit] = useState<AyantDroit[]>([]);
  const [affilies, setAffilies] = useState<Affilie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAD, setSelectedAD] = useState<AyantDroit | null>(null);
  const [newStatut, setNewStatut] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<AyantDroit>>({
    affilieDecedéId: '',
    nom: '',
    prenom: '',
    cin: '',
    lienParente: 'CONJOINT',
    dateNaissance: '',
    tauxReversion: 50,
  });

  async function loadData() {
    setLoading(true);
    try {
      const data = await reversionApi.getAll();
      setAyantsDroit(data);
    } catch {
      // Demo data
      setAyantsDroit([
        { id: 'ad-001', affilieDecedéId: 'aff-010', nom: 'Alami', prenom: 'Khadija', cin: 'BE654321', lienParente: 'CONJOINT', dateNaissance: '1978-08-12', tauxReversion: 50, montantReversion: 3250, statut: 'APPROUVE' },
        { id: 'ad-002', affilieDecedéId: 'aff-010', nom: 'Alami', prenom: 'Youssef', cin: 'BE654322', lienParente: 'ORPHELIN', dateNaissance: '2010-03-15', tauxReversion: 25, montantReversion: 1625, statut: 'APPROUVE' },
        { id: 'ad-003', affilieDecedéId: 'aff-011', nom: 'Chakir', prenom: 'Fatima', cin: 'JC987654', lienParente: 'CONJOINT', dateNaissance: '1972-01-20', tauxReversion: 50, montantReversion: 4100, statut: 'EN_ATTENTE' },
        { id: 'ad-004', affilieDecedéId: 'aff-012', nom: 'Bennani', prenom: 'Souad', cin: 'BN112233', lienParente: 'CONJOINT', dateNaissance: '1965-11-05', tauxReversion: 50, statut: 'EN_ATTENTE' },
        { id: 'ad-005', affilieDecedéId: 'aff-011', nom: 'Chakir', prenom: 'Nadia', cin: 'JC987655', lienParente: 'ORPHELIN', dateNaissance: '2008-06-30', tauxReversion: 25, statut: 'REJETE' },
      ]);
    }
    try {
      const affData = await affilieApi.getAll();
      setAffilies(affData);
    } catch {
      setAffilies([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reversionApi.create(formData);
      toast.success('Ayant-droit enregistré');
      setShowCreateModal(false);
      setFormData({ affilieDecedéId: '', nom: '', prenom: '', cin: '', lienParente: 'CONJOINT', dateNaissance: '', tauxReversion: 50 });
      loadData();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAD?.id) return;
    try {
      await reversionApi.updateStatus(selectedAD.id, newStatut);
      toast.success('Statut mis à jour');
      setShowStatusModal(false);
      loadData();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getLienLabel = (l: string) => {
    switch (l) {
      case 'CONJOINT': return 'Conjoint(e)';
      case 'ORPHELIN': return 'Orphelin(e)';
      case 'PARENT': return 'Parent';
      default: return l;
    }
  };

  const getStatutBadge = (s: string) => {
    switch (s) {
      case 'EN_ATTENTE': return 'warning';
      case 'APPROUVE': return 'success';
      case 'REJETE': return 'danger';
      default: return 'info';
    }
  };

  const getStatutLabel = (s: string) => {
    switch (s) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVE': return 'Approuvé';
      case 'REJETE': return 'Rejeté';
      default: return s;
    }
  };

  const filtered = ayantsDroit.filter(ad => {
    const q = search.toLowerCase();
    const matchSearch = !q || ad.nom.toLowerCase().includes(q) || ad.prenom.toLowerCase().includes(q) || ad.cin.toLowerCase().includes(q);
    const matchStatut = !filterStatut || ad.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: ayantsDroit.length,
    approuves: ayantsDroit.filter(a => a.statut === 'APPROUVE').length,
    enAttente: ayantsDroit.filter(a => a.statut === 'EN_ATTENTE').length,
    totalMontant: ayantsDroit.filter(a => a.statut === 'APPROUVE').reduce((s, a) => s + (a.montantReversion || 0), 0),
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestion des Réversions</h1>
          <p>Droits des ayants-droit (conjoints, orphelins, parents)</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Nouvel Ayant-Droit
          </button>
        )}
      </div>

      <div className="stats-grid">
        {[
          { label: 'Ayants-Droit', value: stats.total, color: '#8b5cf6', icon: Heart },
          { label: 'Approuvés', value: stats.approuves, color: '#10b981', icon: UserCheck },
          { label: 'En Attente', value: stats.enAttente, color: '#f59e0b', icon: Search },
          { label: 'Total Réversions/mois', value: `${stats.totalMontant.toLocaleString('fr-MA')} MAD`, color: '#3b82f6', icon: Heart },
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
          <input type="text" placeholder="Rechercher par nom, CIN..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }}>
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="APPROUVE">Approuvé</option>
            <option value="REJETE">Rejeté</option>
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
                <th>Nom & Prénom</th>
                <th>CIN</th>
                <th>Lien Parenté</th>
                <th>Date Naissance</th>
                <th>Taux</th>
                <th>Montant/mois</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ad => (
                <tr key={ad.id}>
                  <td className="td-name">{ad.nom} {ad.prenom}</td>
                  <td className="td-mono">{ad.cin}</td>
                  <td><span className="badge badge-info">{getLienLabel(ad.lienParente)}</span></td>
                  <td>{new Date(ad.dateNaissance).toLocaleDateString('fr-FR')}</td>
                  <td className="td-number">{ad.tauxReversion}%</td>
                  <td className="td-number">{ad.montantReversion ? `${ad.montantReversion.toLocaleString('fr-MA')} MAD` : '—'}</td>
                  <td><span className={`badge badge-${getStatutBadge(ad.statut)}`}>{getStatutLabel(ad.statut)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn action-view" title="Détails" onClick={() => { setSelectedAD(ad); setShowDetailModal(true); }}>
                        <Eye size={16} />
                      </button>
                      {isAdmin && (
                        <button className="action-btn action-edit" title="Changer Statut" onClick={() => { setSelectedAD(ad); setNewStatut(ad.statut); setShowStatusModal(true); }}>
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="empty-state">Aucun ayant-droit trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedAD && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Détails de l'Ayant-Droit</h3>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Nom</span><span className="detail-value">{selectedAD.nom}</span></div>
              <div className="detail-item"><span className="detail-label">Prénom</span><span className="detail-value">{selectedAD.prenom}</span></div>
              <div className="detail-item"><span className="detail-label">CIN</span><span className="detail-value td-mono">{selectedAD.cin}</span></div>
              <div className="detail-item"><span className="detail-label">Lien</span><span className="detail-value">{getLienLabel(selectedAD.lienParente)}</span></div>
              <div className="detail-item"><span className="detail-label">Date Naissance</span><span className="detail-value">{new Date(selectedAD.dateNaissance).toLocaleDateString('fr-FR')}</span></div>
              <div className="detail-item"><span className="detail-label">Taux Réversion</span><span className="detail-value td-number">{selectedAD.tauxReversion}%</span></div>
              <div className="detail-item"><span className="detail-label">Montant Mensuel</span><span className="detail-value td-number">{selectedAD.montantReversion ? `${selectedAD.montantReversion.toLocaleString('fr-MA')} MAD` : 'Non calculé'}</span></div>
              <div className="detail-item"><span className="detail-label">Statut</span><span className={`badge badge-${getStatutBadge(selectedAD.statut)}`}>{getStatutLabel(selectedAD.statut)}</span></div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-label">Affilié Décédé (ID)</span>
                <span className="detail-value td-mono">{selectedAD.affilieDecedéId}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedAD && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3>Changer le Statut</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Ayant-droit: <strong>{selectedAD.nom} {selectedAD.prenom}</strong>
            </p>
            <form onSubmit={handleStatusChange}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nouveau Statut</label>
                <select className="form-control" value={newStatut} onChange={e => setNewStatut(e.target.value)} required>
                  <option value="EN_ATTENTE">En Attente</option>
                  <option value="APPROUVE">Approuvé</option>
                  <option value="REJETE">Rejeté</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowStatusModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Appliquer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <h3>Enregistrer un Ayant-Droit</h3>
            <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Affilié Décédé *</label>
                <select className="form-control" value={formData.affilieDecedéId} onChange={e => setFormData({ ...formData, affilieDecedéId: e.target.value })} required>
                  <option value="">Sélectionner...</option>
                  {affilies.filter(a => a.status === 'DECEASED' || a.status === 'ACTIVE').map(a => (
                    <option key={a.id} value={a.id}>{a.nom} {a.prenom} — {a.cin}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" className="form-control" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input type="text" className="form-control" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>CIN *</label>
                  <input type="text" className="form-control" value={formData.cin} onChange={e => setFormData({ ...formData, cin: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date Naissance *</label>
                  <input type="date" className="form-control" value={formData.dateNaissance} onChange={e => setFormData({ ...formData, dateNaissance: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Lien de Parenté *</label>
                  <select className="form-control" value={formData.lienParente} onChange={e => setFormData({ ...formData, lienParente: e.target.value as any })}>
                    <option value="CONJOINT">Conjoint(e)</option>
                    <option value="ORPHELIN">Orphelin(e)</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Taux de Réversion (%) *</label>
                  <input type="number" className="form-control" min={0} max={100} value={formData.tauxReversion} onChange={e => setFormData({ ...formData, tauxReversion: Number(e.target.value) })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
