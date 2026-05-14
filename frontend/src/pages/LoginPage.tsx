import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Eye, EyeOff, Loader2, Key, CheckCircle, Mail, MessageSquare, ScanFace, Upload, FileCheck, XCircle, Activity, FileText, Lock } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import logoImage from '../assets/image.png';
import { supportApi } from '../api/support';

const loginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password recovery
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState<'email' | 'cin'>('email');

  // Email tab
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);

  // CIN tab
  const [cinUsername, setCinUsername] = useState('');
  const [cinFile, setCinFile] = useState<File | null>(null);
  const [cinLoading, setCinLoading] = useState(false);
  const [cinVerified, setCinVerified] = useState(false);
  const [cinError, setCinError] = useState('');
  const [cinExtracted, setCinExtracted] = useState<{ cin: string; full_name: string; birthday: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Support
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ nom: '', email: '', sujet: 'connexion', message: '' });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const user = await authApi.login(data);
      login(user);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.response?.data?.error
        || err?.response?.data?.message
        || (err?.response?.status === 401 ? 'Identifiants incorrects' : null)
        || (err?.code === 'ERR_NETWORK' ? 'Service indisponible, veuillez réessayer' : null)
        || 'Erreur de connexion, veuillez réessayer';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) {
      toast.error('Veuillez saisir votre identifiant ou email.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await authApi.forgotPassword(recoveryInput.trim());
      setRecoveryEmailSent(true);
    } catch {
      toast.error('Erreur lors de la demande. Veuillez réessayer.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const resetRecovery = () => {
    setShowRecoveryModal(false);
    setRecoveryInput('');
    setRecoveryEmailSent(false);
    setRecoveryTab('email');
    setCinUsername('');
    setCinFile(null);
    setCinVerified(false);
    setCinError('');
    setCinExtracted(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetSuccess(false);
  };

  const handleCinVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinUsername.trim() || !cinFile) {
      setCinError('Veuillez saisir votre identifiant et télécharger votre CIN.');
      return;
    }
    setCinLoading(true);
    setCinError('');
    try {
      const formData = new FormData();
      formData.append('file', cinFile);
      formData.append('username', cinUsername.trim());
      const res = await fetch(`${import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000'}/api/ai/verify-id`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCinExtracted(data.extracted);
        if (data.extracted.verified) {
          setCinVerified(true);
        } else {
          setCinError('Vérification échouée. Le numéro CIN extrait ne correspond pas à votre dossier.');
        }
      } else {
        setCinError('Impossible de lire la carte. Essayez une photo plus nette.');
      }
    } catch {
      setCinError('Service IA indisponible. Utilisez la méthode par email.');
    } finally {
      setCinLoading(false);
    }
  };

  const handleCinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000'}/api/ai/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cinUsername.trim(), new_password: newPassword }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResetSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès !');
      } else {
        toast.error(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch {
      toast.error('Service indisponible. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.nom.trim() || !supportForm.email.trim() || !supportForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    setSupportLoading(true);
    try {
      await supportApi.submit(supportForm);
      setSupportSent(true);
    } catch {
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSupportLoading(false);
    }
  };

  const resetSupport = () => {
    setSupportSent(false);
    setSupportForm({ nom: '', email: '', sujet: 'connexion', message: '' });
    setShowSupportModal(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape login-bg-shape-1" />
      <div className="login-bg-shape login-bg-shape-2" />
      <div className="login-bg-shape login-bg-shape-3" />

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left panel - branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <img src={logoImage} alt="Portail CIMR" style={{ width: 80, borderRadius: 12 }} />
              <h1>Portail CIMR</h1>
            </div>
            <h2>Caisse Interprofessionnelle<br />Marocaine de Retraite</h2>
            <p>Votre espace sécurisé pour gérer vos droits de retraite, consulter vos cotisations et effectuer vos démarches en ligne.</p>
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon"><Activity size={13} /></div>
                <span>Consultation en temps réel</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon"><FileText size={13} /></div>
                <span>Demandes en ligne simplifiées</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon"><Shield size={13} /></div>
                <span>Sécurité CNDP certifiée</span>
              </div>
            </div>
          </div>
          <div className="login-stats">
            <div className="login-stat-item">
              <span className="login-stat-value">1977</span>
              <span className="login-stat-label">Fondée en</span>
            </div>
            <div className="login-stat-item">
              <span className="login-stat-value">500K+</span>
              <span className="login-stat-label">Affiliés</span>
            </div>
            <div className="login-stat-item">
              <span className="login-stat-value">47 ans</span>
              <span className="login-stat-label">D'expertise</span>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="login-form-panel">
          <div className="login-form-accent" />
          <div className="login-form-inner">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="login-form-header">
              <h3>Connexion</h3>
              <p>Accédez à votre espace personnel</p>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Entrez votre identifiant"
                  {...register('username')}
                  className={errors.username ? 'input-error' : ''}
                />
              </div>
              {errors.username && <span className="field-error">{errors.username.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <Shield size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  {...register('password')}
                  className={errors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Connexion...</>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className="login-help">
              <button type="button" className="login-help-link" onClick={() => setShowRecoveryModal(true)}>
                <Key size={14} />
                Mot de passe oublié ?
              </button>
              <span className="login-help-sep" />
              <button type="button" className="login-help-link" onClick={() => setShowSupportModal(true)}>
                <MessageSquare size={14} />
                Contacter le support
              </button>
            </div>

          </form>
          </div>
          <div className="login-security-note">
            <Lock size={11} />
            <span>Connexion chiffrée SSL 256-bit · CNDP certifié · © 2025 CIMR</span>
          </div>
        </div>
      </motion.div>

      {/* Password Recovery Modal */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '460px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <Key size={40} color="var(--brand)" style={{ margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Mot de passe oublié</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Choisissez votre méthode de vérification
                </p>
              </div>

              {/* Tabs */}
              {!recoveryEmailSent && !resetSuccess && (
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setRecoveryTab('email')}
                    style={{
                      flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: recoveryTab === 'email' ? 'var(--brand)' : 'var(--bg-card)',
                      color: recoveryTab === 'email' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                    }}
                  >
                    <Mail size={15} /> Par Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryTab('cin')}
                    style={{
                      flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: recoveryTab === 'cin' ? 'var(--brand)' : 'var(--bg-card)',
                      color: recoveryTab === 'cin' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                    }}
                  >
                    <ScanFace size={15} /> Par CIN
                  </button>
                </div>
              )}

              {/* ---- TAB EMAIL ---- */}
              {recoveryTab === 'email' && (
                recoveryEmailSent ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <CheckCircle size={52} color="#1a5c28" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Email envoyé !</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                      Si un compte correspond à <strong>{recoveryInput}</strong>, un lien de réinitialisation a été envoyé.
                    </p>
                    <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ⏱ Le lien expire dans <strong>1 heure</strong>. Vérifiez vos spams.
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetRecovery}>Fermer</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Identifiant ou email</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="mohamed.alami ou votre@email.com"
                          value={recoveryInput}
                          onChange={e => setRecoveryInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={resetRecovery} disabled={recoveryLoading}>Annuler</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={recoveryLoading || !recoveryInput.trim()}>
                        {recoveryLoading ? <><Loader2 size={16} className="spin" /> Envoi...</> : <><Mail size={16} /> Envoyer le lien</>}
                      </button>
                    </div>
                  </form>
                )
              )}

              {/* ---- TAB CIN ---- */}
              {recoveryTab === 'cin' && (
                resetSuccess ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <CheckCircle size={52} color="#1a5c28" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Mot de passe mis à jour !</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                      Identité vérifiée par CIN. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetRecovery}>Se connecter</button>
                  </div>
                ) : cinVerified ? (
                  <form onSubmit={handleCinReset}>
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileCheck size={18} color="#16a34a" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>Identité vérifiée ✓</div>
                        <div style={{ fontSize: '0.78rem', color: '#166534' }}>{cinExtracted?.full_name} — CIN : {cinExtracted?.cin}</div>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nouveau mot de passe</label>
                      <div className="input-wrapper">
                        <Shield size={16} className="input-icon" />
                        <input type={showNewPwd ? 'text' : 'password'} placeholder="Minimum 6 caractères" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus />
                        <button type="button" className="password-toggle" onClick={() => setShowNewPwd(v => !v)}>
                          {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmer le mot de passe</label>
                      <div className="input-wrapper">
                        <Shield size={16} className="input-icon" />
                        <input type="password" placeholder="Répétez le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && <span className="field-error">Les mots de passe ne correspondent pas</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={resetRecovery}>Annuler</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={resetLoading || !newPassword || newPassword !== confirmPassword}>
                        {resetLoading ? <><Loader2 size={16} className="spin" /> Réinitialisation...</> : 'Réinitialiser le mot de passe'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCinVerify}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom d'utilisateur</label>
                      <div className="input-wrapper">
                        <User size={16} className="input-icon" />
                        <input type="text" placeholder="Votre identifiant de connexion" value={cinUsername} onChange={e => setCinUsername(e.target.value)} required autoFocus />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Photo de votre Carte Nationale (recto)</label>
                      <label
                        htmlFor="cin-upload"
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: 8, padding: '1.25rem', borderRadius: 8, cursor: 'pointer',
                          border: cinFile ? '2px solid var(--brand)' : '2px dashed var(--border)',
                          background: cinFile ? 'rgba(26,92,40,0.05)' : 'var(--bg-main)', transition: 'all 0.2s',
                        }}
                      >
                        {cinFile ? (
                          <>
                            <FileCheck size={28} color="var(--brand)" />
                            <span style={{ fontSize: '0.82rem', color: 'var(--brand)', fontWeight: 600 }}>{cinFile.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cliquez pour changer</span>
                          </>
                        ) : (
                          <>
                            <Upload size={28} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Déposer ou cliquer pour uploader</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG — Recto de la CIN</span>
                          </>
                        )}
                      </label>
                      <input id="cin-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { setCinFile(e.target.files?.[0] || null); setCinError(''); }} />
                    </div>
                    {cinError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626' }}>
                        <XCircle size={15} /> {cinError}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={resetRecovery} disabled={cinLoading}>Annuler</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={cinLoading || !cinUsername.trim() || !cinFile}>
                        {cinLoading ? <><Loader2 size={16} className="spin" /> Analyse IA...</> : <><ScanFace size={16} /> Vérifier ma CIN</>}
                      </button>
                    </div>
                  </form>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '460px' }}
            >
              {supportSent ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <CheckCircle size={52} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Message envoyé !</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Votre demande a bien été enregistrée. Notre équipe vous répondra sous 24h ouvrables.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetSupport}>
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <MessageSquare size={44} color="var(--brand)" style={{ margin: '0 auto 0.75rem' }} />
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Contacter le Support</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Notre équipe vous répond sous 24h ouvrables.
                    </p>
                  </div>

                  <form onSubmit={handleSupportSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Nom complet *</label>
                        <div className="input-wrapper">
                          <User size={16} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Votre nom"
                            value={supportForm.nom}
                            onChange={e => setSupportForm(f => ({ ...f, nom: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email *</label>
                        <div className="input-wrapper">
                          <Mail size={16} className="input-icon" />
                          <input
                            type="email"
                            placeholder="votre@email.com"
                            value={supportForm.email}
                            onChange={e => setSupportForm(f => ({ ...f, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sujet *</label>
                      <select
                        value={supportForm.sujet}
                        onChange={e => setSupportForm(f => ({ ...f, sujet: e.target.value }))}
                        style={{
                          width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                          color: 'var(--text-primary)', fontSize: '0.9rem',
                        }}
                      >
                        <option value="connexion">Problème de connexion</option>
                        <option value="autre">Autre demande</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Message *</label>
                      <textarea
                        placeholder="Décrivez votre problème ou question..."
                        value={supportForm.message}
                        onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                        rows={4}
                        required
                        style={{
                          width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                          color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical',
                          fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost" onClick={resetSupport} style={{ flex: 1 }} disabled={supportLoading}>
                        Annuler
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={supportLoading}>
                        {supportLoading
                          ? <><Loader2 size={16} className="spin" /> Envoi...</>
                          : <><Mail size={16} /> Envoyer le message</>
                        }
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
