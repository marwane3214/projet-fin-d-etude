import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, FileText, Upload, Info, CheckCircle,
  X, File, AlertTriangle, Building2, Clock, MapPin
} from 'lucide-react';
import { liquidationApi } from '../../api/liquidations';
import { notificationApi } from '../../api/notifications';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UploadedFile {
  file: File;
  id: string;
  label: string;
  preview?: string;
}

const REQUIRED_DOCS = [
  { id: 'cin', label: 'Copie CIN (recto-verso)', accept: 'image/*,.pdf' },
  { id: 'attestation', label: 'Attestation de travail ou certificat de cessation d\'activité', accept: '.pdf,.jpg,.png' },
  { id: 'rib', label: 'Relevé d\'identité bancaire (RIB)', accept: '.pdf,.jpg,.png' },
  { id: 'acte_naissance', label: 'Acte de naissance récent (moins de 3 mois)', accept: '.pdf,.jpg,.png' },
];

export default function LiquidationFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [step, setStep] = useState<'form' | 'confirmation' | 'submitted'>('form');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [observations, setObservations] = useState('');
  const [consentPhysical, setConsentPhysical] = useState(false);

  // Revoke all object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if already submitted (persisted in localStorage)
  const storageKey = `cimr_liquidation_submitted_${user?.affilieId || user?.username}`;
  const alreadySubmitted = localStorage.getItem(storageKey) === 'true';

  const handleFileSelect = (docId: string, docLabel: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5 Mo');
      return;
    }

    // Remove existing file with same docId
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== docId);
      const newFile: UploadedFile = {
        file,
        id: docId,
        label: docLabel,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
      return [...filtered, newFile];
    });
    toast.success(`${docLabel} ajouté`);
  };

  const removeFile = (docId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === docId);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== docId);
    });
  };

  const isFileUploaded = (docId: string) => uploadedFiles.some(f => f.id === docId);
  const allRequiredUploaded = REQUIRED_DOCS.every(d => isFileUploaded(d.id));

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredUploaded) {
      toast.error('Veuillez téléverser tous les documents requis');
      return;
    }
    if (!consentPhysical) {
      toast.error('Veuillez confirmer que vous apporterez les originaux');
      return;
    }
    setStep('confirmation');
  };

  const handleFinalSubmit = async () => {
    const affilieId = user?.affilieId || user?.username;
    if (!affilieId) {
      toast.error('Impossible d\'identifier votre compte. Veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    try {
      // Create the demande
      const saved = await liquidationApi.create({
        affilieId,
        affilieNom: user?.nomComplexe || user?.username || '',
        typeLiquidation: 'NORMALE',
        dateDepot: new Date().toISOString().split('T')[0],
        statut: 'DEPOSE',
      });

      if (saved.id) {
        for (const uf of uploadedFiles) {
          try {
            await liquidationApi.uploadDocument(saved.id, uf.file, uf.id);
          } catch (err) {
            console.error(`Failed to upload ${uf.label}:`, err);
          }
        }
      }

      // Mark as submitted
      localStorage.setItem(storageKey, 'true');
      setStep('submitted');
      toast.success('Demande de liquidation déposée avec succès !');

      // Notify admin
      notificationApi.createNotification({
        userId: 'admin',
        title: 'Nouvelle demande de liquidation',
        message: `L'affilié ${user?.username} a déposé une demande de liquidation avec ${uploadedFiles.length} document(s) joint(s).`,
        type: 'LIQUIDATION',
        referenceId: saved.id,
      }).catch(() => {});
    } catch {
      toast.error('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };


  // ── Successfully submitted view ──
  if (step === 'submitted') {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Demande Déposée !</h1>
          </div>
        </div>

        <motion.div
          className="form-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '700px', textAlign: 'center', padding: '3rem' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--success), #059669)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle size={50} />
          </motion.div>

          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>Votre demande a été soumise avec succès</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 2rem' }}>
            L'administrateur a été notifié et examinera votre dossier ainsi que les pièces jointes. 
            Vous recevrez une notification lorsque votre dossier sera traité.
          </p>

          {/* Steps timeline */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0',
            background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
            padding: '1.5rem', marginBottom: '2rem', textAlign: 'left',
          }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Prochaines étapes</h4>
            {[
              { icon: CheckCircle, text: 'Demande déposée en ligne', color: 'var(--success)', done: true },
              { icon: Clock, text: 'Examen du dossier par l\'administration', color: 'var(--warning)', done: false },
              { icon: Building2, text: 'Apporter les originaux à l\'agence CIMR', color: 'var(--brand)', done: false },
              { icon: FileText, text: 'Validation finale et liquidation', color: 'var(--text-muted)', done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: s.done ? s.color : `${s.color}20`,
                  color: s.done ? '#fff' : s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <s.icon size={16} />
                </div>
                <span style={{ fontWeight: s.done ? 600 : 400, color: s.done ? 'var(--text)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {s.text}
                </span>
                {s.done && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Fait</span>}
              </div>
            ))}
          </div>

          {/* Physical papers warning */}
          <div style={{
            background: 'var(--warning-bg)', border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            textAlign: 'left', marginBottom: '2rem',
          }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#92400e' }}>Documents originaux requis</strong>
              <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                Vous devez vous présenter à l'agence CIMR la plus proche avec les <strong>originaux</strong> de tous les documents 
                que vous avez téléversés en ligne. La demande ne sera finalisée qu'après vérification des pièces physiques.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              Retour au tableau de bord
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/liquidations')}>
              Suivre ma demande
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Confirmation step ──
  if (step === 'confirmation') {
    return (
      <div className="page">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => setStep('form')}>
              <ArrowLeft size={18} /> Modifier
            </button>
            <div>
              <h1>Confirmer votre demande</h1>
              <p>Vérifiez les informations avant de soumettre</p>
            </div>
          </div>
        </div>

        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '700px' }}
        >
          <h3 className="form-section-title"><FileText size={20} /> Récapitulatif</h3>
          <div className="detail-grid" style={{ marginBottom: '2rem' }}>
            <div className="detail-item">
              <span className="detail-label">Demandeur</span>
              <span className="detail-value">{user?.username}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date de dépôt</span>
              <span className="detail-value">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Documents joints</span>
              <span className="detail-value">{uploadedFiles.length} fichier(s)</span>
            </div>
          </div>

          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Documents téléversés</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {uploadedFiles.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', background: 'var(--success-bg)',
                borderRadius: 'var(--radius-sm)', border: '1px solid #d1fae5',
              }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.file.name}</span>
              </div>
            ))}
          </div>

          {observations && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Observations</h4>
              <p style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                {observations}
              </p>
            </div>
          )}

          <div style={{
            background: 'var(--warning-bg)', border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)', padding: '1rem',
            marginBottom: '2rem', fontSize: '0.85rem', color: '#92400e',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              {alreadySubmitted ? (
                <>
                  <strong>Attention : Remplacement !</strong> En confirmant, votre demande précédente 
                  sera définitivement supprimée et remplacée par celle-ci.
                </>
              ) : (
                <>
                  <strong>Action irréversible :</strong> Une fois la demande soumise, vous ne pourrez plus la modifier. 
                  Assurez-vous que tous les documents sont corrects.
                </>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost" onClick={() => setStep('form')}>Retour</button>
            <button className="btn btn-primary" onClick={handleFinalSubmit} disabled={loading}>
              <Save size={18} /> {loading ? 'Envoi en cours...' : 'Confirmer et Soumettre'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main form step ──
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/liquidations')}>
            <ArrowLeft size={18} /> Retour
          </button>
          <div>
            <h1>Demande de Liquidation</h1>
            <p>Déposer votre demande de liquidation des droits CIMR</p>
          </div>
        </div>
      </div>

      {/* Important notice / Overwrite Warning */}
      {alreadySubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--warning-bg)', border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            marginBottom: '1.5rem', maxWidth: '800px',
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#92400e' }}>Attention : Vous avez déjà une demande en cours</strong>
            <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
              Vous avez déjà soumis une demande de liquidation. Si vous soumettez ce nouveau formulaire, 
              <strong> votre demande précédente sera annulée et remplacée de façon permanente</strong>.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--info-bg)', border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            marginBottom: '1.5rem', maxWidth: '800px',
          }}
        >
          <Info size={20} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--brand)' }}>Information importante</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
              Veuillez vous assurer de l'exactitude de vos documents. Après soumission, 
              votre dossier sera examiné par l'administration. Vous devrez également vous présenter 
              à l'agence CIMR avec les <strong>originaux de vos documents</strong>.
            </p>
          </div>
        </motion.div>
      )}

      <motion.form
        className="form-card"
        onSubmit={handlePreSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '800px' }}
      >
        {/* Affiliate Info */}
        <div className="form-section">
          <h3 className="form-section-title"><FileText size={20} /> Identité du Demandeur</h3>
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Identifiant</label>
              <input type="text" value={user?.username || ''} disabled style={{ background: 'var(--bg-input)' }} />
            </div>
            <div className="form-group">
              <label>Date de la demande</label>
              <input type="text" value={new Date().toLocaleDateString('fr-FR')} disabled style={{ background: 'var(--bg-input)' }} />
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="form-section">
          <h3 className="form-section-title"><Upload size={20} /> Pièces Justificatives</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Téléversez les copies numériques de vos documents. <strong>Formats acceptés : PDF, JPG, PNG</strong> (max 5 Mo par fichier).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {REQUIRED_DOCS.map(doc => {
              const uploaded = uploadedFiles.find(f => f.id === doc.id);
              return (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    border: `2px solid ${uploaded ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: uploaded ? 'var(--success-bg)' : '#fff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: uploaded ? 'var(--success)' : 'var(--bg-input)',
                    color: uploaded ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {uploaded ? <CheckCircle size={18} /> : <File size={18} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.label}</div>
                    {uploaded && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {uploaded.file.name} — {(uploaded.file.size / 1024).toFixed(0)} Ko
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept={doc.accept}
                    ref={el => { fileInputRefs.current[doc.id] = el; }}
                    onChange={e => handleFileSelect(doc.id, doc.label, e)}
                    style={{ display: 'none' }}
                  />

                  {uploaded ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                      >
                        Remplacer
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                        onClick={() => removeFile(doc.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                    >
                      <Upload size={14} /> Téléverser
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload progress indicator */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              flex: 1, height: '6px', background: 'var(--bg-input)',
              borderRadius: '99px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${(uploadedFiles.length / REQUIRED_DOCS.length) * 100}%`,
                height: '100%',
                background: allRequiredUploaded ? 'var(--success)' : 'var(--brand)',
                borderRadius: '99px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: allRequiredUploaded ? 'var(--success)' : 'var(--text-muted)' }}>
              {uploadedFiles.length}/{REQUIRED_DOCS.length}
            </span>
          </div>
        </div>

        {/* Observations */}
        <div className="form-section">
          <h3 className="form-section-title"><Info size={20} /> Observations (facultatif)</h3>
          <textarea
            className="form-control"
            rows={3}
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Précisions ou remarques supplémentaires..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Physical papers consent */}
        <div className="form-section">
          <div style={{
            background: 'var(--warning-bg)', border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)', padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <Building2 size={22} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#92400e', fontSize: '1rem' }}>Documents physiques requis</strong>
                <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
                  Après le dépôt de votre demande en ligne, vous devez <strong>impérativement</strong> vous 
                  présenter à l'agence CIMR la plus proche avec les <strong>originaux</strong> de tous les 
                  documents ci-dessus. Votre dossier ne sera traité qu'après vérification des pièces physiques.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#92400e', paddingLeft: '2.5rem' }}>
              <MapPin size={16} style={{ flexShrink: 0 }} />
              <span>Agence la plus proche : <strong>CIMR Casablanca — 7 Bd Abdelmoumen</strong></span>
            </div>

            <label className="checkbox-label" style={{ marginTop: '1.25rem', paddingLeft: '2.5rem', color: '#92400e' }}>
              <input
                type="checkbox"
                checked={consentPhysical}
                onChange={e => setConsentPhysical(e.target.checked)}
              />
              <span>
                Je confirme que je me présenterai à l'agence CIMR avec les <strong>originaux</strong> de mes documents 
                pour compléter le processus de liquidation.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/liquidations')}>Annuler</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!allRequiredUploaded || !consentPhysical}
          >
            <Save size={18} /> Vérifier et Soumettre
          </button>
        </div>
      </motion.form>
    </div>
  );
}
