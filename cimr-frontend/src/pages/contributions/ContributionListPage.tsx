import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, DollarSign, Award, BookOpen } from 'lucide-react';
import { contributionApi } from '../../api/contributions';
import { affilieApi } from '../../api/affilies';
import { useAuth } from '../../contexts/AuthContext';
import type { Contribution, Affilie, PointsLedger, PointValue } from '../../types';
import toast from 'react-hot-toast';

export default function ContributionListPage() {
  const { user, isAdmin } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [affilies, setAffilies] = useState<Affilie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showPointValuesModal, setShowPointValuesModal] = useState(false);
  const [pointValues, setPointValues] = useState<PointValue[]>([]);

  // Form states
  const [formData, setFormData] = useState<Partial<Contribution>>({
    affilieId: '',
    periode: '',
    salaireMensuel: 0,
    contributionSalariale: 0,
    contributionPatronale: 0,
    taux: 0
  });

  const [pointsData, setPointsData] = useState<Partial<PointsLedger>>({
    affilieId: '',
    periode: '',
    pointsAcquis: 0
  });

  const [pointValueData, setPointValueData] = useState<Partial<PointValue>>({
    year: new Date().getFullYear(),
    value: 0
  });

  useEffect(() => {
    loadData();
    loadAffilies();
    loadPointValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await contributionApi.getAll();
      setContributions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur chargement des contributions');
    } finally {
      setLoading(false);
    }
  };

  const loadAffilies = async () => {
    try {
      const data = await affilieApi.getAll();
      setAffilies(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erreur chargement affiliés', e);
    }
  };

  const loadPointValues = async () => {
    try {
      const data = await contributionApi.getAllPointValues();
      setPointValues(Array.isArray(data) ? data : []);
      const currentYear = new Date().getFullYear();
      const currentVal = data.find((pv: any) => pv.year === currentYear);
      if (currentVal) {
        setPointValueData({
          year: currentYear,
          value: currentVal.value
        });
      }
    } catch (e) {
      console.error('Erreur chargement valeurs points', e);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contributionApi.record(formData);
      toast.success('Contribution Article 6 enregistrée');
      setShowRecordModal(false);
      loadData();
    } catch {
      toast.error('Erreur enregistrement');
    }
  };

  const handlePointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contributionApi.recordPoints(pointsData);
      toast.success('Points CIMR stockés dans le ledger');
      setShowPointsModal(false);
      loadData();
    } catch {
      toast.error('Erreur stockage des points');
    }
  };

  const handlePointValueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contributionApi.setPointValue(pointValueData);
      toast.success('Valeur des points définie pour l\'année');
      setShowPointValuesModal(false);
      loadPointValues();
    } catch {
      toast.error('Erreur définition valeur points');
    }
  };

  const filtered = contributions.filter(c => {
    const searchLower = search.toLowerCase();
    const affilieIdString = String(c.affilieId || '').toLowerCase();
    const periodeString = String(c.periode || '').toLowerCase();
    
    const matchesSearch = affilieIdString.includes(searchLower) || periodeString.includes(searchLower);
    if (isAdmin) return matchesSearch;
    return matchesSearch && (affilieIdString === String(user?.username || '').toLowerCase());
  });

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Contributions & Points CIMR</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestion du livret individuel et des droits acquis</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAdmin && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowPointValuesModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Award size={18} /> Valeurs Points
              </button>
              <button className="btn btn-ghost" onClick={() => setShowPointsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Award size={18} /> Alimenter Points
              </button>
              <button className="btn btn-primary" onClick={() => setShowRecordModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Nouvelle Contribution
              </button>
            </>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Cotisations</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {contributions.reduce((acc, c) => acc + ((c.contributionSalariale || 0) + (c.contributionPatronale || 0)), 0).toLocaleString('fr-MA')} MAD
            </h3>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.75rem', borderRadius: '12px' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Lignes Enregistrées</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {contributions.length} enregistrements
            </h3>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.75rem', borderRadius: '12px' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Valeur du Point ({new Date().getFullYear()})</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#b45309' }}>
              {pointValueData.value ? `${pointValueData.value.toFixed(2)} MAD` : 'Non définie'}
            </h3>
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Filtrer par UUID ou période (YYYY-MM)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Période</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>ID Affilié</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Salaire</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Part Salariale</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Part Patronale</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Taux Add.</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(loading ? [] : filtered).map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{c.periode}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{(c.affilieId || '').split('-')[0]}...</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{(c.salaireMensuel || 0).toLocaleString('fr-MA')} MAD</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{(c.contributionSalariale || 0).toLocaleString('fr-MA')} MAD</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{(c.contributionPatronale || 0).toLocaleString('fr-MA')} MAD</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{c.taux ? `${c.taux.toFixed(2)}%` : '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                    title="Voir Livret" 
                    onClick={() => window.open(`http://localhost:8080/api/contributions/affilies/${c.affilieId}/livret`)}
                  >
                    <BookOpen size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Aucun enregistrement trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Contribution Modal */}
      {showRecordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: 0 }}>Enregistrer une Contribution</h3>
            <form onSubmit={handleRecordSubmit} style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Affilié</label>
                <select 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                  value={formData.affilieId} 
                  onChange={e => setFormData({...formData, affilieId: e.target.value})} 
                  required
                >
                  <option value="">Sélectionner...</option>
                  {affilies.map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Période (YYYY-MM)</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="2024-03" value={formData.periode} onChange={e => setFormData({...formData, periode: e.target.value})} required/>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Salaire (MAD)</label>
                  <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.salaireMensuel} onChange={e => setFormData({...formData, salaireMensuel: Number(e.target.value)})} required/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Part Salariale</label>
                  <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.contributionSalariale} onChange={e => setFormData({...formData, contributionSalariale: Number(e.target.value)})} required/>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Part Patronale</label>
                  <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.contributionPatronale} onChange={e => setFormData({...formData, contributionPatronale: Number(e.target.value)})} required/>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Taux Additionnel (%)</label>
                <input type="number" step="0.01" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.taux || 0} onChange={e => setFormData({...formData, taux: Number(e.target.value)})} placeholder="0.00"/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowRecordModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Other modals follow same style pattern... */}
      {showPointsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '450px' }}>
            <h3>Alimenter Points Ledger</h3>
            <form onSubmit={handlePointsSubmit} style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Affilié</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={pointsData.affilieId} onChange={e => setPointsData({...pointsData, affilieId: e.target.value})} required>
                  <option value="">Sélectionner...</option>
                  {affilies.map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Période</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="2024" value={pointsData.periode} onChange={e => setPointsData({...pointsData, periode: e.target.value})} required/>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Points</label>
                <input type="number" step="0.01" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={pointsData.pointsAcquis} onChange={e => setPointsData({...pointsData, pointsAcquis: Number(e.target.value)})} required/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPointsModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Attribuer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Point Values Modal */}
      {showPointValuesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', textAlign: 'center' }}>Valeur du Point</h3>
            
            {/* Beautiful Current Value Indicator */}
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #bfdbfe' }}>
              <span style={{ color: '#1e40af', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valeur Actuelle ({pointValueData.year})</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.5rem' }}>
                {pointValueData.value ? `${pointValueData.value.toFixed(2)} MAD` : '0.00 MAD'}
              </div>
            </div>

            <form onSubmit={handlePointValueSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                  Saisir la nouvelle valeur (MAD)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 21.50"
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', outline: 'none' }} 
                  value={pointValueData.value || ''} 
                  onChange={e => setPointValueData({...pointValueData, value: Number(e.target.value)})} 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', fontWeight: 600 }} onClick={() => setShowPointValuesModal(false)}>Fermer</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', fontWeight: 600 }}>Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
