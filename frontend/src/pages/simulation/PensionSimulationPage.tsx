import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { contributionApi } from '../../api/contributions';
import { affilieApi } from '../../api/affilies';
import type { SimulationRequest, SimulationResponse, CareerPeriod } from '../../types/simulation';
import type { Affilie } from '../../types';
import toast from 'react-hot-toast';
import { Calculator, ArrowLeft, ArrowRight, Settings, FileText, Plus, Trash2, Building } from 'lucide-react';
import logoImage from '../../assets/image.png';

export default function PensionSimulationPage() {
  const { user, isAdmin } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimulationResponse | null>(null);

  const [affiliateData, setAffiliateData] = useState<Affilie | null>(null);

  const [formData, setFormData] = useState<SimulationRequest>({
    affilieId: user?.affilieId,
    dateNaissance: '1970-01-01', // Fallback
    salaireMensuelActuel: 0,
    dateAffiliation: new Date().toISOString().split('T')[0],
    referenceSalary: 33.69,
    pointValue: 20.21,
    yieldRate: 3.00,
    desiredRetirementAge: 60,
    salaryEvolution: 4.00,
    applyRachat: false,
    rachatYears: 0,
    applyCapitalOption: false,
    careerPeriods: []
  });

  useEffect(() => {
    // Load global params if saved
    const savedSr = localStorage.getItem('cimr_sr_value');
    const savedVpl = localStorage.getItem('cimr_vpl_value');
    if (savedSr || savedVpl) {
      setFormData(prev => ({
        ...prev,
        referenceSalary: savedSr ? Number(savedSr) : prev.referenceSalary,
        pointValue: savedVpl ? Number(savedVpl) : prev.pointValue
      }));
    }

    if (user?.affilieId) {
      affilieApi.getById(user.affilieId).then(data => {
        setAffiliateData(data);
        const defaultCareer: CareerPeriod = {
          employerName: data.employeur || 'Employeur Actuel',
          startDate: data.dateAffiliation || new Date().toISOString().split('T')[0],
          endDate: null,
          monthlySalary: data.salaireMensuel || 0,
          contributionRate: 12.0,
          isCurrent: true
        };

        setFormData(prev => ({
          ...prev,
          dateNaissance: data.dateNaissance,
          salaireMensuelActuel: data.salaireMensuel || 0,
          dateAffiliation: data.dateAffiliation,
          careerPeriods: [defaultCareer]
        }));
      }).catch(err => {
        console.error("Erreur lors de la récupération des données de l'affilié:", err);
        toast.error('Impossible de récupérer vos données d\'affiliation pour la simulation.');
      });
    }
  }, [user]);

  const addCareerPeriod = () => {
    setFormData(prev => ({
      ...prev,
      careerPeriods: [
        ...prev.careerPeriods,
        {
          employerName: '',
          startDate: '',
          endDate: '',
          monthlySalary: 0,
          contributionRate: 12.0,
          isCurrent: false
        }
      ]
    }));
  };

  const updateCareerPeriod = (index: number, field: keyof CareerPeriod, value: string | number | boolean | null) => {
    setFormData(prev => {
      const periods = [...prev.careerPeriods];
      periods[index] = { ...periods[index], [field]: value };
      return { ...prev, careerPeriods: periods };
    });
  };

  const removeCareerPeriod = (index: number) => {
    setFormData(prev => {
      const periods = prev.careerPeriods.filter((_, i) => i !== index);
      return { ...prev, careerPeriods: periods };
    });
  };

  const handleSimulate = async () => {
    if (!formData.careerPeriods || formData.careerPeriods.length === 0) {
      toast.error('Veuillez ajouter au moins une période de carrière.');
      return;
    }

    setLoading(true);
    try {
      const res = await contributionApi.simulatePension({
        ...formData,
        affilieId: user?.affilieId
      });
      if (!res?.summaryNet || !res?.summaryGross || !res?.careerSummaries || !res?.detailedProjections) {
        toast.error('Résultat de simulation incomplet. Vérifiez vos paramètres.');
        return;
      }
      setResults(res);
      setStep(3);
      toast.success('Simulation générée avec succès');
    } catch {
      toast.error('Erreur lors du calcul. Vérifiez vos paramètres.');
    } finally {
      setLoading(false);
    }
  };
  if (isAdmin) {
    return (
      <div className="page" style={{ padding: '2rem' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={28} color="var(--brand)" />
            Paramètres de Simulation
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestion des constantes actuarielles globales utilisées pour le calcul des pensions.
          </p>
        </div>

        <motion.div className="form-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px' }}>
          <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} /> Valeurs Actuelles
          </h3>

          <div className="form-grid cols-1" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Salaire de Référence (SR) actuel</label>
              <input type="number" step="0.01" value={formData.referenceSalary} onChange={e => setFormData({ ...formData, referenceSalary: Number(e.target.value) })} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Utilisé pour déterminer le nombre de points acquis par les contributions.</span>
            </div>
            <div className="form-group">
              <label>Valeur du Point (VPL) actuelle</label>
              <input type="number" step="0.01" value={formData.pointValue} onChange={e => setFormData({ ...formData, pointValue: Number(e.target.value) })} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Utilisé pour calculer la pension de retraite annuelle.</span>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={async () => {
              setLoading(true);
              try {
                 await contributionApi.setPointValue({ year: new Date().getFullYear(), value: formData.pointValue });
                 localStorage.setItem('cimr_sr_value', formData.referenceSalary.toString());
                 localStorage.setItem('cimr_vpl_value', formData.pointValue.toString());
                 toast.success('Paramètres actuariels mis à jour avec succès');
              } catch {
                 toast.error('Erreur lors de la mise à jour des paramètres');
              } finally {
                 setLoading(false);
              }
            }} disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calculator size={28} color="var(--brand)" />
          Simulation de Pension
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Simulation exacte basée sur vos données d'affiliation et votre historique de carrière.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--brand)' : '#e2e8f0', borderRadius: '4px' }} />
        <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--brand)' : '#e2e8f0', borderRadius: '4px' }} />
        <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--brand)' : '#e2e8f0', borderRadius: '4px' }} />
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-card">
          <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} /> Profil & Carrière
          </h3>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <strong>Affilié:</strong> {affiliateData?.nom} {affiliateData?.prenom} <br />
            <strong>Date de naissance:</strong> {formData.dateNaissance}
          </div>

          <div className="form-grid cols-2" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Âge cible de départ à la retraite</label>
              <input type="number" value={formData.desiredRetirementAge} onChange={e => setFormData({ ...formData, desiredRetirementAge: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Estimation d'évolution annuelle du salaire (%)</label>
              <input type="number" step="0.1" value={formData.salaryEvolution} onChange={e => setFormData({ ...formData, salaryEvolution: Number(e.target.value) })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={18} /> Périodes de Carrière</h4>
            <button className="btn btn-sm btn-ghost" onClick={addCareerPeriod}><Plus size={16} /> Ajouter</button>
          </div>

          {formData.careerPeriods.map((period, index) => (
            <div key={index} style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
              <button
                onClick={() => removeCareerPeriod(index)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>

              <div className="form-grid cols-2">
                <div className="form-group">
                  <label>Employeur</label>
                  <input type="text" value={period.employerName} onChange={e => updateCareerPeriod(index, 'employerName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Taux de cotisation (%)</label>
                  <input type="number" step="0.1" value={period.contributionRate} onChange={e => updateCareerPeriod(index, 'contributionRate', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Date de début</label>
                  <input type="date" value={period.startDate} onChange={e => updateCareerPeriod(index, 'startDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date de fin (laisser vide si actuel)</label>
                  <input type="date" value={period.endDate || ''} onChange={e => updateCareerPeriod(index, 'endDate', e.target.value || null)} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Salaire Mensuel Moyen (MAD)</label>
                  <input type="number" value={period.monthlySalary} onChange={e => updateCareerPeriod(index, 'monthlySalary', Number(e.target.value))} />
                </div>
              </div>
              <label className="checkbox-label" style={{ marginTop: '1rem' }}>
                <input type="checkbox" checked={period.isCurrent} onChange={e => updateCareerPeriod(index, 'isCurrent', e.target.checked)} />
                <span>C'est mon employeur actuel (projeté jusqu'à la retraite)</span>
              </label>
            </div>
          ))}

          <div className="form-actions" style={{ marginTop: '2.5rem' }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continuer <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="form-card">
          <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Paramètres Actuariels & Options
          </h3>

          <div className="form-grid cols-2" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Salaire de Référence (SR) {!isAdmin && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Fixé par l'admin)</span>}</label>
              <input type="number" step="0.01" value={formData.referenceSalary} disabled={!isAdmin} onChange={e => setFormData({ ...formData, referenceSalary: Number(e.target.value) })} style={!isAdmin ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : undefined} />
            </div>
            <div className="form-group">
              <label>Valeur du Point (VPL) {!isAdmin && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Fixé par l'admin)</span>}</label>
              <input type="number" step="0.01" value={formData.pointValue} disabled={!isAdmin} onChange={e => setFormData({ ...formData, pointValue: Number(e.target.value) })} style={!isAdmin ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : undefined} />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Options de liquidation</h4>

            <label className="checkbox-label" style={{ marginBottom: '0.75rem' }}>
              <input type="checkbox" checked={formData.applyRachat} onChange={e => setFormData({ ...formData, applyRachat: e.target.checked })} />
              <span>Rachat de services passés</span>
            </label>
            {formData.applyRachat && (
              <div className="form-group" style={{ marginLeft: '2rem', maxWidth: '200px' }}>
                <label>Nombre d'années à racheter</label>
                <input type="number" value={formData.rachatYears} onChange={e => setFormData({ ...formData, rachatYears: Number(e.target.value) })} />
              </div>
            )}

            <label className="checkbox-label" style={{ marginBottom: '0.75rem', marginTop: '1rem' }}>
              <input type="checkbox" checked={formData.applyCapitalOption} onChange={e => setFormData({ ...formData, applyCapitalOption: e.target.checked })} />
              <span>Option Capital (Liquider 30% de la pension sous forme de capital)</span>
            </label>
            {formData.applyCapitalOption && (
              <div className="form-group" style={{ marginLeft: '2rem', maxWidth: '200px' }}>
                <label>Taux de Rendement (%)</label>
                <input type="number" step="0.01" value={formData.yieldRate} onChange={e => setFormData({ ...formData, yieldRate: Number(e.target.value) })} />
              </div>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '2.5rem', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={18} /> Retour
            </button>
            <button className="btn btn-primary" onClick={handleSimulate} disabled={loading}>
              {loading ? 'Calcul en cours...' : 'Lancer la simulation'}
              {!loading && <Calculator size={18} />}
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && results && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="simulation-results-card">
            {/* Professional Print Header */}
            <div className="print-header" style={{ display: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a' }}>C.I.M.R.</h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Caisse Interprofessionnelle Marocaine de Retraite</p>
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Rapport de Simulation de Pension Individuelle</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <img src={logoImage} alt="Logo CIMR" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Réf: SIM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Date: {new Date().toLocaleDateString('fr-MA')}</p>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: 'var(--brand)' }}>Résultats de votre Simulation</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Modifier</button>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <FileText size={18} /> Télécharger PDF / Imprimer
                </button>
              </div>
            </div>

            {/* Executive Summary Cards */}
            <div className="results-grid">
              <div className="result-card primary">
                <div className="result-card-label">Pension Mensuelle Nette</div>
                <div className="result-card-value">{results.summaryNet.pensionMensuelle.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} <span className="currency">MAD</span></div>
                <div className="result-card-sub">Soit {results.summaryNet.pensionAnnuelle.toLocaleString('fr-MA', { minimumFractionDigits: 0 })} MAD / an</div>
              </div>

              {formData.applyCapitalOption ? (
                <div className="result-card accent">
                  <div className="result-card-label">Capital & Pension Réduite</div>
                  <div className="result-card-value">{results.summaryWithCapital.capitalAmount.toLocaleString('fr-MA', { minimumFractionDigits: 0 })} <span className="currency">MAD</span></div>
                  <div className="result-card-sub">+ {results.summaryWithCapital.pensionMensuelle.toLocaleString('fr-MA', { minimumFractionDigits: 0 })} MAD / mois</div>
                </div>
              ) : (
                <div className="result-card muted">
                  <div className="result-card-label">Taux de Remplacement</div>
                  <div className="result-card-value">{results.summaryNet.replacementRate.toFixed(1)} <span className="currency">%</span></div>
                  <div className="result-card-sub">Du dernier salaire projeté</div>
                </div>
              )}

              <div className="result-card info">
                <div className="result-card-label">Total Points Acquis</div>
                <div className="result-card-value">{Math.floor(results.summaryGross.totalPoints).toLocaleString('fr-MA')} <span className="currency">pts</span></div>
                <div className="result-card-sub">À l'âge de {formData.desiredRetirementAge} ans</div>
              </div>
            </div>

            {/* Actuarial & Yield Parameters - THE DETAILED SECTION */}
            <div className="section-container">
              <h3 className="section-title"><Settings size={20} /> Paramètres Actuariels & Rendement</h3>
              <div className="params-grid">
                <div className="param-item">
                  <label>Salaire de Référence (SR)</label>
                  <span>{formData.referenceSalary.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="param-item">
                  <label>Valeur du Point (VPL)</label>
                  <span>{formData.pointValue.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="param-item">
                  <label>Taux de Rendement</label>
                  <span>{formData.yieldRate.toFixed(2)} %</span>
                </div>
                <div className="param-item">
                  <label>Coût d'un Point</label>
                  <span>{(formData.referenceSalary * formData.yieldRate).toFixed(4)} MAD</span>
                </div>
                <div className="param-item">
                  <label>Évolution de carrière</label>
                  <span>+ {formData.salaryEvolution.toFixed(1)} % / an</span>
                </div>
                <div className="param-item">
                  <label>Âge de Liquidation</label>
                  <span>{formData.desiredRetirementAge} ans</span>
                </div>
              </div>
            </div>

            {/* Career Summary */}
            <div className="section-container page-break">
              <h3 className="section-title"><Building size={20} /> Récapitulatif de Carrière</h3>
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Employeur</th>
                      <th>Période</th>
                      <th>Années</th>
                      <th>Cotisations (MAD)</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.careerSummaries.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>{row.employerName}</td>
                        <td style={{ color: '#64748b' }}>{row.startDate} - {row.endDate}</td>
                        <td>{row.years}</td>
                        <td>{row.totalContributions.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                        <td className="points-cell">{Math.round(row.totalPointsEarned).toLocaleString('fr-MA')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Projection */}
            <div className="section-container page-break">
              <h3 className="section-title"><Calculator size={20} /> Projection Annuelle Détaillée</h3>
              <div className="table-wrapper scrollable">
                <table className="report-table detailed">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Année</th>
                      <th>Âge</th>
                      <th style={{ textAlign: 'left' }}>Employeur</th>
                      <th>Salaire Annuel</th>
                      <th>Cotisation</th>
                      <th>Points</th>
                      <th>Cumul</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.detailedProjections.map((row, idx) => (
                      <tr key={idx} className={row.isPast ? 'row-past' : ''}>
                        <td style={{ textAlign: 'left', fontWeight: row.isPast ? 400 : 700 }}>{row.year}</td>
                        <td>{row.age}</td>
                        <td style={{ textAlign: 'left' }}>{row.employer}</td>
                        <td>{row.annualSalary.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}</td>
                        <td>{row.contributionAmount.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}</td>
                        <td className="points-cell">{Math.round(row.pointsAcquired)}</td>
                        <td style={{ fontWeight: 700 }}>{Math.round(row.cumulativePoints).toLocaleString('fr-MA')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="print-footer" style={{ display: 'none' }}>
              <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Document généré à titre indicatif par le simulateur C.I.M.R. — Les valeurs réelles peuvent varier selon l'évolution des paramètres réglementaires.
              </div>
            </div>

            <div className="form-actions no-print" style={{ marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Nouvelle Simulation</button>
            </div>
          </div>

          <style>{`
            .simulation-results-card {
              background: white; border-radius: 16px; padding: 2.5rem; 
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid var(--border);
            }
            .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
            .result-card { padding: 1.5rem; border-radius: 12px; border: 1px solid transparent; }
            .result-card.primary { background: #0f172a; color: white; }
            .result-card.accent { background: #fefce8; border-color: #fef08a; color: #854d0e; }
            .result-card.info { background: #f0f9ff; border-color: #bae6fd; color: #075985; }
            .result-card.muted { background: #f8fafc; border-color: #e2e8f0; color: #475569; }
            .result-card-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; opacity: 0.8; }
            .result-card-value { font-size: 1.75rem; font-weight: 800; display: flex; align-items: baseline; gap: 0.25rem; }
            .result-card-value .currency { font-size: 0.9rem; font-weight: 500; }
            .result-card-sub { font-size: 0.85rem; margin-top: 0.25rem; opacity: 0.9; }

            .section-container { margin-bottom: 2.5rem; }
            .section-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
            .params-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #f8fafc; padding: 1.5rem; border-radius: 12px; }
            .param-item label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem; }
            .param-item span { font-size: 1rem; font-weight: 700; color: #0f172a; }

            .table-wrapper { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
            .table-wrapper.scrollable { max-height: 500px; overflow-y: auto; }
            .report-table { width: 100%; border-collapse: collapse; text-align: right; }
            .report-table th { background: #f8fafc; padding: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; position: sticky; top: 0; z-index: 5; }
            .report-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
            .report-table tr:last-child td { border-bottom: none; }
            .points-cell { color: #2563eb; font-weight: 700; }
            .row-past { background: #f8fafc; color: #94a3b8; }

            @media print {
              @page { margin: 0; size: A4; }
              body { background: white !important; font-size: 10pt !important; margin: 0; padding: 0; }
              .sidebar, .topbar, .no-print, .btn, .ai-assistant-toggle, .ai-assistant-wrapper, .ai-toggle-btn { display: none !important; }
              #toast-container, [class*="Toaster"], [class*="toast"] { display: none !important; }
              .main-wrapper { margin-left: 0 !important; padding: 0 !important; }
              .page-content { padding: 1.5cm !important; margin: 0 !important; max-width: 100% !important; }
              .simulation-results-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
              .print-header, .print-footer { display: block !important; }
              .results-grid { gap: 0.5rem; margin-bottom: 1.5rem; }
              .result-card { border: 1.5px solid #e2e8f0 !important; color: black !important; background: white !important; padding: 0.75rem !important; }
              .result-card-label { color: #64748b !important; }
              .result-card-value { font-size: 1.5rem !important; }
              .section-container { margin-bottom: 1.5rem; }
              .params-grid { background: white !important; border: 1px solid #e2e8f0; grid-template-columns: repeat(3, 1fr); padding: 1rem; }
              .table-wrapper { border: 1px solid #cbd5e1 !important; overflow: visible !important; max-height: none !important; }
              .report-table th { 
                position: static !important; background: #f1f5f9 !important; border-bottom: 1px solid #94a3b8 !important; 
                color: black !important; -webkit-print-color-adjust: exact; 
              }
              .report-table td { padding: 0.5rem !important; border-bottom: 1px solid #e2e8f0 !important; }
              .page-break { page-break-inside: avoid; margin-top: 1rem; }
              .row-past { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
}
