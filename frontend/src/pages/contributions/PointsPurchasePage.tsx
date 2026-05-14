import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Upload, CheckCircle, XCircle, Search, FileText, Info } from 'lucide-react';
import { contributionApi } from '../../api/contributions';
import { API_BASE_URL } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { PointsPurchase } from '../../types';
import toast from 'react-hot-toast';

export default function PointsPurchasePage() {
  const { isAdmin, user } = useAuth();
  const [purchases, setPurchases] = useState<PointsPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PointsPurchase | null>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  
  const [pointValue, setPointValue] = useState(75.25); // Default fallback if API fails

  const [formData, setFormData] = useState({
    nombrePoints: 100,
    referenceVirement: '',
    banque: '',
    dateVirement: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadPurchases();
    fetchPointValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPointValue = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const data = await contributionApi.getPointValue(currentYear);
      if (data && data.value) {
        setPointValue(data.value);
      }
    } catch {
      // Point value for current year not configured yet — use default fallback silently
    }
  };

  const loadPurchases = async () => {
    if (!isAdmin && !user?.affilieId) return; // need UUID for the endpoint
    setLoading(true);
    try {
      const data = isAdmin 
        ? await contributionApi.getAllPointsPurchases()
        : await contributionApi.getMyPointsPurchases(user?.affilieId || '');
      setPurchases(data || []);
    } catch (error) {
      console.error("Erreur chargement achats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Veuillez télécharger une preuve de virement');
      return;
    }

    const toastId = toast.loading('Envoi de la demande...');
    try {
      if (!user?.affilieId && !isAdmin) {
        toast.error("Erreur de session : identifiant affilié manquant. Veuillez vous reconnecter.", { id: toastId });
        return;
      }

      const data = new FormData();
      data.append('nombrePoints', formData.nombrePoints.toString());
      data.append('montantTotal', (formData.nombrePoints * pointValue).toString());
      data.append('referenceVirement', formData.referenceVirement);
      data.append('banque', formData.banque);
      data.append('dateVirement', formData.dateVirement);
      data.append('affilieId', user?.affilieId || '');
      data.append('affilieNom', user?.nomComplexe || user?.username || 'Affilié');
      data.append('file', file);

      await contributionApi.submitPointsPurchase(data);
      toast.success('Demande envoyée avec succès', { id: toastId });
      setShowForm(false);
      setFormData({ nombrePoints: 100, referenceVirement: '', banque: '', dateVirement: new Date().toISOString().split('T')[0] });
      setFile(null);
      loadPurchases();
    } catch {
      toast.error('Erreur lors de l\'envoi', { id: toastId });
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await contributionApi.validatePointsPurchase(id);
      toast.success('Demande validée');
      loadPurchases();
    } catch {
      toast.error('Erreur de validation');
    }
  };

  const handleReject = async () => {
    if (!selectedPurchase) return;
    try {
      await contributionApi.rejectPointsPurchase(selectedPurchase.id!, rejectMotif);
      toast.success('Demande rejetée');
      setShowRejectModal(false);
      setRejectMotif('');
      loadPurchases();
    } catch {
      toast.error('Erreur');
    }
  };

  const filteredPurchases = purchases.filter(p => 
    (p.affilieNom?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (p.referenceVirement?.toLowerCase() || '').includes(search.toLowerCase())
  );
  
  const handleViewProof = (path: string) => {
    const fileName = path.split(/[\\/]/).pop() || '';
    setProofUrl(`${API_BASE_URL}/api/contributions/files/${encodeURIComponent(fileName)}`);
    setShowProofModal(true);
  };

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Achat de Points</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{isAdmin ? 'Validation des demandes d\'achat de points' : 'Augmentez votre future pension en achetant des points'}</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} /> Acheter des points
          </button>
        )}
      </div>

      <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="toolbar-search" style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par référence ou nom..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
          />
        </div>
      </div>

      <div className="table-container" style={{ background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {isAdmin && <th style={{ textAlign: 'left', padding: '1rem' }}>Affilié</th>}
              <th style={{ textAlign: 'left', padding: '1rem' }}>Points</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Montant</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Réf. Virement</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Date Virement</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Statut</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement...</td></tr>
            ) : filteredPurchases.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                {isAdmin && <td style={{ padding: '1rem' }}><strong>{p.affilieNom}</strong></td>}
                <td style={{ padding: '1rem' }}><strong>{p.pointsGranted || 0} pts</strong></td>
                <td style={{ padding: '1rem' }}>{(p.montantVerse || 0).toLocaleString('fr-MA')} MAD</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--primary)' }}>{p.referenceVirement || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>{p.dateVirement ? new Date(p.dateVirement).toLocaleDateString('fr-FR') : '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: p.statut === 'VALIDE' ? '#dcfce7' : p.statut === 'REJETE' ? '#fee2e2' : '#fef9c3',
                    color: p.statut === 'VALIDE' ? '#166534' : p.statut === 'REJETE' ? '#991b1b' : '#854d0e'
                  }}>
                    {p.statut === 'VALIDE' ? 'Validé' : p.statut === 'REJETE' ? 'Rejeté' : 'En attente'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleViewProof(p.preuvePath || '')}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-primary)' }}
                      title="Voir preuve"
                    >
                      <FileText size={16} />
                    </button>
                    {isAdmin && p.statut === 'EN_ATTENTE' && (
                      <>
                        <button 
                          onClick={() => handleValidate(p.id!)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#dcfce7', cursor: 'pointer', color: '#166534' }}
                          title="Valider"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedPurchase(p); setShowRejectModal(true); }}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#fee2e2', cursor: 'pointer', color: '#991b1b' }}
                          title="Rejeter"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredPurchases.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Aucune demande trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Point Purchase Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nouvelle demande d'achat</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Calculez et soumettez votre preuve de virement</p>
            
            <div style={{ background: '#f0f7ff', border: '1px solid #cce3ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Info size={20} color="#0066cc" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: '#004d99' }}>
                Valeur actuelle du point : <strong>{pointValue} MAD</strong>.<br/>
                Compte virement : <strong>007 810 0000001234567890 12</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nombre de points</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={formData.nombrePoints}
                    onChange={e => setFormData({...formData, nombrePoints: parseInt(e.target.value)})}
                    min="10"
                    required
                  />
                  <small style={{ marginTop: '0.25rem', display: 'block', color: 'var(--primary)', fontWeight: '600' }}>
                    {(formData.nombrePoints * pointValue).toLocaleString('fr-MA')} MAD
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Date du virement</label>
                  <input 
                    type="date" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={formData.dateVirement}
                    onChange={e => setFormData({...formData, dateVirement: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Référence virement</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    placeholder="Ex: VIR-88229"
                    value={formData.referenceVirement}
                    onChange={e => setFormData({...formData, referenceVirement: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Banque</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    placeholder="Ex: BCP, BMCE..."
                    value={formData.banque}
                    onChange={e => setFormData({...formData, banque: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Preuve (PDF/Image)</label>
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  style={{ border: '2px dashed var(--border)', padding: '1.5rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#f9fafb' }}
                >
                  <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.875rem', color: file ? 'var(--primary)' : 'var(--text-muted)' }}>{file ? file.name : "Cliquez pour uploader"}</p>
                  <input id="file-upload" type="file" hidden onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*,application/pdf" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Envoyer la demande</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Motif de rejet</h3>
            <textarea 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}
              rows={4} 
              placeholder="Raison du rejet..."
              value={rejectMotif}
              onChange={e => setRejectMotif(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleReject} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#991b1b', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Rejeter</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Side-Panel Preview */}
      {showProofModal && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end'
          }} 
          onClick={() => setShowProofModal(false)}
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              width: '100%', maxWidth: '600px', height: '100%', background: 'white',
              boxShadow: '-20px 0 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Aperçu du Justificatif</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Preuve de virement bancaire</p>
              </div>
              <button 
                onClick={() => setShowProofModal(false)}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none', 
                  background: '#f1f5f9', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: '#64748b' 
                }}
              >✕</button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {proofUrl.toLowerCase().includes('.pdf') ? (
                  <iframe 
                    src={proofUrl} 
                    width="100%" 
                    height="800px" 
                    style={{ border: 'none', borderRadius: '8px' }} 
                    title="Preuve PDF" 
                  />
                ) : (
                  <img 
                    src={proofUrl} 
                    alt="Proof" 
                    style={{ width: '100%', borderRadius: '8px', display: 'block' }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Fichier+non+trouv%C3%A9';
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
              <a 
                href={proofUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Search size={18} /> Plein écran
              </a>
              <button 
                onClick={() => setShowProofModal(false)} 
                className="btn" 
                style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white' }}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
