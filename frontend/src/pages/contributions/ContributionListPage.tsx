import { useState, useEffect, useRef } from 'react';
import { Plus, Search, DollarSign, Award, BookOpen, Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, X } from 'lucide-react';
import { contributionApi } from '../../api/contributions';
import { affilieApi } from '../../api/affilies';
import { API_BASE_URL } from '../../api/client';
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
  const [, setPointValues] = useState<PointValue[]>([]);

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

  // ── CSV Import ──────────────────────────────────────────────────────────────
  type ImportStatus = 'valid' | 'error' | 'success' | 'failed';
  interface ImportRow {
    index: number;
    affilieId: string;
    affilieNom: string;
    periode: string;
    salaireMensuel: number;
    contributionSalariale: number;
    contributionPatronale: number;
    taux: number;
    status: ImportStatus;
    error?: string;
  }

  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'processing' | 'done'>('upload');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, errors: 0 });
  const csvInputRef = useRef<HTMLInputElement>(null);

  const resolveAffilie = (rawId: string): { id: string; nom: string } | null => {
    // Try exact UUID match
    const byId = affilies.find(a => a.id === rawId);
    if (byId) return { id: byId.id!, nom: `${byId.nom} ${byId.prenom}` };
    // Try "Nom Prenom" match (case-insensitive)
    const byName = affilies.find(a =>
      `${a.nom} ${a.prenom}`.toLowerCase() === rawId.toLowerCase() ||
      `${a.prenom} ${a.nom}`.toLowerCase() === rawId.toLowerCase()
    );
    if (byName) return { id: byName.id!, nom: `${byName.nom} ${byName.prenom}` };
    return null;
  };

  const parseAndValidateCSV = (rawText: string): ImportRow[] => {
    // 1. Remove BOM (UTF-8 BOM, sometimes added by Excel)
    const text = rawText.charCodeAt(0) === 0xFEFF ? rawText.slice(1) : rawText;

    // 2. Normalize ALL line-ending styles (\r\n Windows, \r old Mac, \n Unix) → \n
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const lines = normalized.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // 3. Auto-detect separator: semicolon (Excel FR) or comma
    const firstLine = lines[0];
    const sep = firstLine.includes(';') ? ';' : ',';

    const headers = firstLine.split(sep).map(h => h.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, ''));

    return lines.slice(1).map((line, i) => {
      const values = line.split(sep).map(v => v.trim().replace(/^"|"$/g, '')); // strip Excel quotes
      const col = (name: string) => {
        const idx = headers.findIndex(h => h === name || h.includes(name) || name.includes(h));
        return idx >= 0 ? (values[idx] || '') : '';
      };

      const rawId = col('affilieid') || col('affilieid') || values[0] || '';
      const periode = col('periode') || values[1] || '';
      const salaire = parseFloat(col('salairemensuel') || col('salaire') || values[2] || '0') || 0;
      const salariale = parseFloat(col('contributionsalariale') || col('partsalariale') || col('salariale') || values[3] || '0') || 0;
      const patronale = parseFloat(col('contributionpatronale') || col('partpatronale') || col('patronale') || values[4] || '0') || 0;
      const taux = parseFloat(col('taux') || col('tauxadditionnel') || values[5] || '0') || 0;

      if (!rawId) return { index: i + 1, affilieId: '', affilieNom: '', periode, salaireMensuel: salaire, contributionSalariale: salariale, contributionPatronale: patronale, taux, status: 'error' as ImportStatus, error: 'Colonne affilieId manquante ou vide' };
      const resolved = resolveAffilie(rawId);
      if (!resolved) return { index: i + 1, affilieId: rawId, affilieNom: rawId, periode, salaireMensuel: salaire, contributionSalariale: salariale, contributionPatronale: patronale, taux, status: 'error' as ImportStatus, error: `Affilié introuvable: "${rawId}" — vérifiez le nom ou l'UUID` };
      if (!/^\d{4}-\d{2}$/.test(periode)) return { index: i + 1, affilieId: resolved.id, affilieNom: resolved.nom, periode, salaireMensuel: salaire, contributionSalariale: salariale, contributionPatronale: patronale, taux, status: 'error' as ImportStatus, error: `Période invalide: "${periode}" (format YYYY-MM requis)` };
      if (salaire <= 0) return { index: i + 1, affilieId: resolved.id, affilieNom: resolved.nom, periode, salaireMensuel: salaire, contributionSalariale: salariale, contributionPatronale: patronale, taux, status: 'error' as ImportStatus, error: 'Salaire doit être supérieur à 0' };

      return { index: i + 1, affilieId: resolved.id, affilieNom: resolved.nom, periode, salaireMensuel: salaire, contributionSalariale: salariale, contributionPatronale: patronale, taux, status: 'valid' as ImportStatus };
    });
  };

  const handleCSVFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) { toast.error('Veuillez sélectionner un fichier .csv'); return; }

    // Ensure affilies are loaded before parsing
    if (affilies.length === 0) await loadAffilies();

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = parseAndValidateCSV(text);
      if (rows.length === 0) { toast.error('Fichier vide ou format non reconnu. Vérifiez le séparateur (virgule ou point-virgule) et les en-têtes.'); return; }
      setImportRows(rows);
      setImportStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleValidateAll = async () => {
    const validRows = importRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) { toast.error('Aucune ligne valide à importer'); return; }
    setImportStep('processing');
    setImportProgress(0);
    let success = 0; let errors = 0;
    const updated = [...importRows];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await contributionApi.record({
          affilieId: row.affilieId,
          periode: row.periode,
          salaireMensuel: row.salaireMensuel,
          contributionSalariale: row.contributionSalariale,
          contributionPatronale: row.contributionPatronale,
          taux: row.taux,
        });
        const idx = updated.findIndex(r => r.index === row.index);
        updated[idx] = { ...updated[idx], status: 'success' };
        success++;
      } catch (err: unknown) {
        const idx = updated.findIndex(r => r.index === row.index);
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const rawMsg = axiosErr?.response?.data?.message || '';
        const msg = rawMsg.includes('uq_affilie_periode') || rawMsg.includes('unique')
          ? `Doublon — ${row.periode} déjà enregistré pour cet affilié`
          : (axiosErr?.response?.status ? `HTTP ${axiosErr.response.status}` : 'Erreur réseau');
        updated[idx] = { ...updated[idx], status: 'failed', error: msg };
        errors++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
      setImportRows([...updated]);
    }
    setImportResults({ success, errors });
    setImportStep('done');
    if (success > 0) loadData();
  };

  const resetImport = () => {
    setShowImportModal(false);
    setImportStep('upload');
    setImportRows([]);
    setImportProgress(0);
  };

  useEffect(() => {
    loadData();
    loadAffilies();
    loadPointValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await contributionApi.getAll();
      } else {
        // Affilié: load only their own contributions via history endpoint
        const myId = user?.affilieId || user?.username || '';
        data = myId ? await contributionApi.getHistory(myId) : [];
      }
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
      const currentVal = data.find((pv) => pv.year === currentYear);
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
    const myId = String(user?.affilieId || user?.username || '').toLowerCase();
    return matchesSearch && (affilieIdString === myId);
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
              <button className="btn btn-ghost" onClick={() => { setShowImportModal(true); setImportStep('upload'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                <Upload size={18} /> Importer CSV
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
              {filtered.reduce((acc, c) => acc + ((c.contributionSalariale || 0) + (c.contributionPatronale || 0)), 0).toLocaleString('fr-MA')} MAD
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
              {filtered.length} enregistrements
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)' }}
                    title="Voir Livret"
                    onClick={() => window.open(`${API_BASE_URL}/api/contributions/affilies/${c.affilieId}/livret`)}
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
      
      {/* ── CSV Import Modal ── */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileSpreadsheet size={22} color="var(--brand)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Import CSV — Contributions</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {importStep === 'upload' && 'Étape 1/3 — Sélection du fichier'}
                    {importStep === 'preview' && `Étape 2/3 — Vérification (${importRows.filter(r => r.status === 'valid').length} valides / ${importRows.filter(r => r.status === 'error').length} erreurs)`}
                    {importStep === 'processing' && `Étape 3/3 — Importation en cours... ${importProgress}%`}
                    {importStep === 'done' && `Terminé — ${importResults.success} importées, ${importResults.errors} échecs`}
                  </p>
                </div>
              </div>
              <button onClick={resetImport} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}><X size={20} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>

              {/* STEP 1 — Upload */}
              {importStep === 'upload' && (
                <div>
                  <div style={{ background: '#f0faf0', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#166534' }}>
                    <strong>Format attendu du fichier CSV :</strong>
                    <code style={{ display: 'block', marginTop: '0.5rem', background: '#dcfce7', padding: '0.5rem 0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      affilieId,periode,salaireMensuel,contributionSalariale,contributionPatronale,taux
                    </code>
                    <p style={{ margin: '0.5rem 0 0' }}>
                      <strong>affilieId</strong> : UUID de l'affilié <em>ou</em> "Nom Prenom" (ex: Mharrech Iliass)
                    </p>
                  </div>

                  <div
                    onClick={() => csvInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f); }}
                    style={{ border: '2px dashed var(--brand)', borderRadius: '12px', padding: '3rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(61,170,46,0.03)' }}
                  >
                    <Upload size={36} color="var(--brand)" style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>Glissez votre fichier CSV ici</p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>ou cliquez pour parcourir</p>
                    <input ref={csvInputRef} type="file" accept=".csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleCSVFile(f); }} />
                  </div>
                </div>
              )}

              {/* STEP 2 — Preview */}
              {importStep === 'preview' && (
                <div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>#</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Affilié</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Période</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Salaire</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Part Sal.</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Part Pat.</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Taux</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.map(row => (
                          <tr key={row.index} style={{ borderBottom: '1px solid var(--border)', background: row.status === 'error' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{row.index}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{row.affilieNom}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace' }}>{row.periode}</td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>{row.salaireMensuel.toLocaleString('fr-MA')}</td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>{row.contributionSalariale.toLocaleString('fr-MA')}</td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>{row.contributionPatronale.toLocaleString('fr-MA')}</td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>{row.taux > 0 ? `${row.taux}%` : '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                              {row.status === 'valid'
                                ? <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>✓ Valide</span>
                                : <span title={row.error} style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, cursor: 'help' }}>⚠ {row.error}</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3 — Processing */}
              {importStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '1.5rem' }}>Importation en cours...</p>
                  <div style={{ background: 'var(--bg-input)', borderRadius: '9999px', height: '12px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ height: '100%', background: 'var(--brand)', borderRadius: '9999px', width: `${importProgress}%`, transition: 'width 0.3s ease' }} />
                  </div>
                  <p style={{ margin: '0.75rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{importProgress}% — Veuillez ne pas fermer cette fenêtre</p>
                  <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <tbody>
                        {importRows.filter(r => r.status !== 'error').map(row => (
                          <tr key={row.index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.4rem 0.75rem' }}>{row.affilieNom}</td>
                            <td style={{ padding: '0.4rem 0.75rem', fontFamily: 'monospace' }}>{row.periode}</td>
                            <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                              {row.status === 'success' && <CheckCircle size={16} color="#16a34a" />}
                              {row.status === 'failed' && <XCircle size={16} color="#dc2626" />}
                              {row.status === 'valid' && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>En attente...</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 4 — Done */}
              {importStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{importResults.errors === 0 ? '✅' : '⚠️'}</div>
                  <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Importation terminée</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{importResults.success}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Importées avec succès</div>
                    </div>
                    {importResults.errors > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{importResults.errors}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Erreurs</div>
                      </div>
                    )}
                  </div>
                  {importResults.errors > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', textAlign: 'left', fontSize: '0.8rem' }}>
                      <strong style={{ color: '#dc2626' }}>Lignes en échec :</strong>
                      {importRows.filter(r => r.status === 'failed' || r.status === 'error').map(r => (
                        <div key={r.index} style={{ marginTop: '0.25rem', color: '#7f1d1d' }}>Ligne {r.index} ({r.affilieNom}) — {r.error || 'Erreur API'}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {importStep === 'upload' && (
                <button className="btn btn-ghost" onClick={resetImport}>Annuler</button>
              )}
              {importStep === 'preview' && (
                <>
                  <button className="btn btn-ghost" onClick={() => setImportStep('upload')}>← Changer le fichier</button>
                  {importRows.filter(r => r.status === 'error').length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#d97706' }}>
                      <AlertTriangle size={14} /> {importRows.filter(r => r.status === 'error').length} lignes ignorées
                    </span>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleValidateAll}
                    disabled={importRows.filter(r => r.status === 'valid').length === 0}
                  >
                    <CheckCircle size={16} style={{ marginRight: '0.4rem' }} />
                    Valider et importer ({importRows.filter(r => r.status === 'valid').length} lignes)
                  </button>
                </>
              )}
              {importStep === 'done' && (
                <button className="btn btn-primary" onClick={resetImport}>Fermer</button>
              )}
            </div>
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
