import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, User, MapPin, Briefcase, 
  Trash2, Download, Eye, FileText, Upload, CreditCard, 
  Check, X
} from 'lucide-react';
import { affilieApi } from '../../api/affilies';
import { API_BASE_URL } from '../../api/client';
import type { Affilie } from '../../types';
import toast from 'react-hot-toast';

export default function AffilieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [affilie, setAffilie] = useState<Affilie | null>(null);
  const [loading, setLoading] = useState(true);

  // States for Editing Info
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editAdresse, setEditAdresse] = useState('');
  const [editVille, setEditVille] = useState('');
  const [editSituation, setEditSituation] = useState('');

  // States for Modals
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [bulletinRef, setBulletinRef] = useState('');
  const [showJustifModal, setShowJustifModal] = useState(false);
  const [justifNom, setJustifNom] = useState('');
  const [justifType, setJustifType] = useState('CIN');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // New features states
  const [activeTab, setActiveTab] = useState<'profile' | 'rights'>('profile');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [points, setPoints] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contributions, setContributions] = useState<any[]>([]);
  const [loadingRights, setLoadingRights] = useState(false);
  const [showRadiationModal, setShowRadiationModal] = useState(false);
  const [radiationMotif, setRadiationMotif] = useState('');

  const loadData = () => {
    if (id) {
      setLoading(true);
      affilieApi.getById(id)
        .then(data => {
          setAffilie(data);
          setEditAdresse(data.adresse || '');
          setEditVille(data.ville || '');
          setEditSituation(data.situationFamiliale || '');
        })
        .catch(() => toast.error('Affilié introuvable'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'rights' && id) {
      loadRights();
    }
  }, [activeTab, id]);

  const loadRights = async () => {
    if (!id) return;
    setLoadingRights(true);
    try {
      const [p, c] = await Promise.all([
        affilieApi.getPoints(id),
        affilieApi.getContributions(id)
      ]);
      setPoints(p);
      setContributions(c);
    } catch {
      toast.error('Erreur lors du chargement des droits');
    } finally {
      setLoadingRights(false);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    if (!window.confirm('Voulez-vous suspendre cet affilié (Article 7) ?')) return;
    try {
      await affilieApi.suspend(id);
      toast.success('Affilié suspendu');
      loadData();
    } catch {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleRadiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await affilieApi.radiate(id, radiationMotif, 0);
      toast.success('Affilié radié');
      setShowRadiationModal(false);
      loadData();
    } catch {
      toast.error('Erreur lors de la radiation');
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const data = await affilieApi.exportData(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_affilie_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Données exportées');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleAnonymize = async () => {
    if (!id) return;
    if (!window.confirm('Voulez-vous anonymiser définitivement cet affilié ?')) return;
    try {
      await affilieApi.anonymize(id);
      toast.success('Données anonymisées');
      navigate('/affilies');
    } catch {
      toast.error('Erreur lors de l\'anonymisation');
    }
  };

  const handleSaveInfo = async () => {
    if (!id) return;
    try {
      await affilieApi.updatePersonalInfo(id, {
        adresse: editAdresse,
        ville: editVille,
        situationFamiliale: editSituation
      });
      toast.success('Informations mises à jour');
      setIsEditingInfo(false);
      loadData();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAddBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !bulletinRef.trim()) return;
    try {
      await affilieApi.addBulletin(id, { reference: bulletinRef });
      toast.success('Bulletin ajouté');
      setShowBulletinModal(false);
      setBulletinRef('');
      loadData();
    } catch {
      toast.error('Erreur lors de l\'ajout du bulletin');
    }
  };

  const handleAddJustificatif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !justifNom.trim() || !selectedFile) {
        toast.error('Veuillez sélectionner un fichier');
        return;
    }

    const loadingToast = toast.loading('Upload en cours...');
    try {
      await affilieApi.uploadJustificatif(id, selectedFile, justifNom, justifType);
      toast.success('Document uploadé', { id: loadingToast });
      setShowJustifModal(false);
      setJustifNom('');
      setSelectedFile(null);
      loadData();
    } catch {
      toast.error('Erreur lors de l\'upload', { id: loadingToast });
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'success';
      case 'RETIRED': return 'info';
      case 'SUSPENDED': return 'warning';
      case 'RADIE': return 'danger';
      default: return 'info';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'ACTIF';
      case 'RETIRED': return 'RETRAITÉ';
      case 'SUSPENDED': return 'SUSPENDU';
      case 'RADIE': return 'RADIÉ';
      default: return s;
    }
  };

  const getSexeLabel = (s: string) => s === 'M' ? 'Masculin' : 'Féminin';

  const getSituationLabel = (s: string) => {
    switch (s) {
      case 'CELIBATAIRE': return 'Célibataire';
      case 'MARIE': return 'Marié(e)';
      case 'DIVORCE': return 'Divorcé(e)';
      case 'VEUF': return 'Veuf/Veuve';
      default: return s;
    }
  };

  if (loading) return <div className="loading-state">Chargement...</div>;
  if (!affilie) return <div className="empty-state">Affilié introuvable</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/affilies')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{affilie.nom} {affilie.prenom}</h1>
            <p className="td-mono">{affilie.numImmatriculation}</p>
          </div>
          <span className={`badge badge-${getStatusColor(affilie.status)}`}>
            {getStatusLabel(affilie.status)}
          </span>
        </div>
        <div className="btn-group" style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/affilies/${id}/edit`} className="btn btn-ghost btn-sm">
            <Edit size={16} /> Modifier
          </Link>
          {affilie.status === 'ACTIVE' && (
            <button className="btn btn-warning btn-sm" onClick={handleSuspend}>Suspendre</button>
          )}
          {affilie.status !== 'RADIE' && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowRadiationModal(true)}>Radier</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleExport}><Upload size={16} /> Export</button>
          <button className="btn btn-danger btn-sm" onClick={handleAnonymize}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          Profil & Documents
        </button>
        <button className={`tab ${activeTab === 'rights' ? 'active' : ''}`} onClick={() => setActiveTab('rights')}>
          Mes Droits
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="form-grid"
      >
        {activeTab === 'profile' && (
          <div className="form-grid">
            <div className="form-card">
              <h3 className="form-section-title"><User size={20} /> Identité</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Nom</span><span className="detail-value">{affilie.nom}</span></div>
                <div className="detail-item"><span className="detail-label">Prénom</span><span className="detail-value">{affilie.prenom}</span></div>
                <div className="detail-item"><span className="detail-label">CIN</span><span className="detail-value td-mono">{affilie.cin}</span></div>
                <div className="detail-item"><span className="detail-label">Sexe</span><span className="detail-value">{getSexeLabel(affilie.sexe)}</span></div>
                <div className="detail-item">
                  <span className="detail-label">Situation</span>
                  <span className="detail-value">{getSituationLabel(affilie.situationFamiliale)}</span>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h3 className="form-section-title" style={{ margin: 0 }}><MapPin size={20} /> Coordonnées</h3>
                {!isEditingInfo ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingInfo(true)}><Edit size={14} /></button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveInfo}><Check size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingInfo(false)}><X size={14} /></button>
                  </div>
                )}
              </div>
              <div className="form-grid">
                {isEditingInfo ? (
                  <>
                    <input type="text" value={editAdresse} onChange={e => setEditAdresse(e.target.value)} placeholder="Adresse" />
                    <input type="text" value={editVille} onChange={e => setEditVille(e.target.value)} placeholder="Ville" />
                  </>
                ) : (
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">Adresse</span><span className="detail-value">{affilie.adresse}</span></div>
                    <div className="detail-item"><span className="detail-label">Ville</span><span className="detail-value">{affilie.ville}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-section-title"><Briefcase size={20} /> Emploi</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Employeur</span><span className="detail-value">{affilie.employeur}</span></div>
                <div className="detail-item"><span className="detail-label">Salaire</span><span className="detail-value td-number">{affilie.salaireMensuel?.toLocaleString()} MAD</span></div>
              </div>
            </div>

            <div className="form-card">
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h3 className="form-section-title" style={{ margin: 0 }}><FileText size={20} /> Bulletins</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowBulletinModal(true)}>Ajouter</button>
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Ref</th><th>Date</th><th>Statut</th></tr></thead>
                  <tbody>
                    {affilie.bulletins?.map(b => (
                      <tr key={b.id}>
                        <td className="td-mono">{b.reference}</td>
                        <td>{new Date(b.dateCreation).toLocaleDateString()}</td>
                        <td><span className="badge badge-info">{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-card">
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h3 className="form-section-title" style={{ margin: 0 }}><Upload size={20} /> Documents</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowJustifModal(true)}>Uploader</button>
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Nom</th><th>Type</th><th>Actions</th></tr></thead>
                  <tbody>
                    {affilie.justificatifs?.map(j => (
                      <tr key={j.id}>
                        <td className="td-name">{j.nom}</td>
                        <td><span className="badge badge-info">{j.typeDocument}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a href={`${API_BASE_URL}${j.urlStockage}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Eye size={14} /></a>
                            <a href={`${API_BASE_URL}${j.urlStockage}`} download className="btn btn-ghost btn-sm"><Download size={14} /></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rights' && (
          <div className="form-grid">
            {loadingRights ? (
              <div className="loading-state">Calcul des droits...</div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <div className="stat-icon" style={{ background: 'var(--brand-light)', color: '#fff' }}><CreditCard size={24} /></div>
                    </div>
                    <div className="stat-label">Total des Points</div>
                    <div className="stat-value">{points?.totalPoints || 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Dernière Mise à Jour</div>
                    <div className="stat-value">{points?.lastYear || '2024'}</div>
                  </div>
                </div>
                <div className="form-card">
                  <h3 className="form-section-title">Points Acquis (Ledger CIMR)</h3>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Période</th><th>Points Attribués</th><th>Date Attribution</th></tr></thead>
                      <tbody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {points?.pointsLedger?.map((p: any) => (
                          <tr key={p.id}>
                            <td className="td-mono">{p.periode}</td>
                            <td className="td-number" style={{ fontWeight: 700, color: 'var(--brand)' }}>+{p.pointsAcquis}</td>
                            <td>{new Date(p.dateAttribution).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {(!points?.pointsLedger || points.pointsLedger.length === 0) && (
                          <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>Aucun point enregistré</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="form-card">
                  <h3 className="form-section-title">Historique des Cotisations (Article 6)</h3>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Période</th><th>Salaire Mensuel</th><th>Part Salariale</th><th>Part Patronale</th></tr></thead>
                      <tbody>
                        {contributions.map((c, i) => (
                          <tr key={i}>
                            <td className="td-mono">{c.periode}</td>
                            <td className="td-number">{c.salaireMensuel?.toLocaleString()} MAD</td>
                            <td className="td-number">{c.contributionSalariale?.toLocaleString()} MAD</td>
                            <td className="td-number">{c.contributionPatronale?.toLocaleString()} MAD</td>
                          </tr>
                        ))}
                        {contributions.length === 0 && (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>Aucune cotisation enregistrée</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showBulletinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nouveau Bulletin</h3>
            <form onSubmit={handleAddBulletin}>
              <div className="form-group">
                <label>Référence</label>
                <input type="text" value={bulletinRef} onChange={e => setBulletinRef(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowBulletinModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJustifModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Uploader Document</h3>
            <form onSubmit={handleAddJustificatif}>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" value={justifNom} onChange={e => setJustifNom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={justifType} onChange={e => setJustifType(e.target.value)}>
                  <option value="CIN">CIN</option>
                  <option value="RIB">RIB</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fichier</label>
                <input type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowJustifModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Uploader</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRadiationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ color: 'var(--danger)' }}>Radiation de l'Affilié</h3>
            <p>Voulez-vous vraiment radier cet affilié ?</p>
            <form onSubmit={handleRadiate}>
              <div className="form-group">
                <label>Motif</label>
                <select value={radiationMotif} onChange={e => setRadiationMotif(e.target.value)} required>
                  <option value="">Choisir...</option>
                  <option value="FRAUDE">Fraude</option>
                  <option value="DECES">Décès</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowRadiationModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-danger">Confirmer Radiation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
