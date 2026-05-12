import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Eye, EyeOff, Loader2, Upload, ScanFace, FileCheck, Key, CheckCircle } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import logoImage from '../assets/image.png';

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

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryFile, setRecoveryFile] = useState<File | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<{cin: string, name: string, verified: boolean} | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleIDUpload = async () => {
    if (!recoveryFile || !recoveryUsername.trim()) {
      toast.error("Veuillez saisir votre identifiant et uploader votre CIN.");
      return;
    }
    setRecoveryLoading(true);

    const formData = new FormData();
    formData.append('file', recoveryFile);
    formData.append('username', recoveryUsername);

    try {
      const response = await fetch(`${AI_API_URL}/api/ai/verify-id`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        const cin = data.extracted.cin !== "Non détecté" ? data.extracted.cin : "CIN INCONNU";

        setRecoveryResult({
          cin: cin,
          name: data.extracted.full_name !== "Not Found" ? data.extracted.full_name : "Inconnu",
          verified: data.extracted.verified
        });

      } else {
        toast.error("Échec de l'analyse de la carte d'identité.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au service d'analyse AI.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setResetLoading(true);
    try {
      const response = await fetch(`${AI_API_URL}/api/ai/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: recoveryUsername,
          new_password: newPassword
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResetSuccess(true);
        toast.success("Mot de passe réinitialisé !");
      } else {
        toast.error("Échec de la réinitialisation.");
      }
    } catch (error) {
      toast.error("Erreur service.");
    } finally {
      setResetLoading(false);
    }
  };

  const resetRecovery = () => {
    setResetSuccess(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowRecoveryModal(false);
    setRecoveryFile(null);
    setRecoveryUsername('');
    setRecoveryResult(null);
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
              <img src={logoImage} alt="Portail CIMR" style={{ width: 100, marginBottom: '1rem' }} />
              <h1>Portail CIMR</h1>
            </div>
            <h2>Caisse Interprofessionnelle<br />Marocaine de Retraite</h2>
            <p>Votre espace sécurisé pour gérer vos droits de retraite, consulter vos cotisations et effectuer vos démarches en ligne.</p>
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-dot" />
                <span>Consultation en temps réel</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-dot" />
                <span>Demandes en ligne</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-dot" />
                <span>Sécurité CNDP certifiée</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="login-form-panel">
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
              <span onClick={() => setShowRecoveryModal(true)} style={{cursor: 'pointer'}}>Mot de passe oublié ?</span>
              <span>Contacter le support</span>
            </div>

            <div className="login-demo-info">
              <p><strong>Comptes de démonstration :</strong></p>
              <div className="demo-accounts">
                <div className="demo-account">
                  <span className="demo-role">Affilié</span>
                  <code>mohamed.alami / cimr2024</code>
                </div>
                <div className="demo-account">
                  <span className="demo-role">Admin</span>
                  <code>techmaroc.admin / admin2024</code>
                </div>
              </div>
            </div>
          </form>
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
              style={{ maxWidth: '400px', textAlign: 'center' }}
            >
              {!recoveryResult ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <ScanFace size={48} color="var(--brand)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Vérification d'Identité</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Pour récupérer votre mot de passe, veuillez entrer votre identifiant et fournir une photo de votre Carte d'Identité Nationale (CIN).
                    </p>
                  </div>

                  <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Identifiant du compte</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Ex: mohamed.alami"
                        value={recoveryUsername}
                        onChange={(e) => setRecoveryUsername(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRecoveryFile(e.target.files?.[0] || null)}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                      }}
                    />
                    <div style={{
                      border: '2px dashed var(--brand)', borderRadius: 'var(--radius-md)', padding: '2rem',
                      background: recoveryFile ? 'var(--info-bg)' : 'var(--bg-main)', transition: 'all 0.3s'
                    }}>
                      {recoveryFile ? (
                        <>
                          <FileCheck size={32} color="var(--brand)" style={{ margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600, color: 'var(--brand)', margin: 0 }}>{recoveryFile.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Prêt pour l'analyse</p>
                        </>
                      ) : (
                        <>
                          <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Cliquez pour sélectionner une photo de votre CIN</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={resetRecovery} disabled={recoveryLoading}>
                      Annuler
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleIDUpload}
                      disabled={!recoveryFile || !recoveryUsername.trim() || recoveryLoading}
                    >
                      {recoveryLoading ? <><Loader2 size={18} className="spin" /> Analyse...</> : "Valider l'identité"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    {resetSuccess ? (
                      <>
                        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Succès !</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
                        </p>
                      </>
                    ) : (
                      <>
                        <Key size={48} color="var(--brand)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Définir un nouveau mot de passe</h3>

                        {recoveryResult.verified ? (
                          <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} style={{ textAlign: 'left', marginTop: '1rem' }}>
                            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                              OUI - VÉRIFICATION RÉUSSIE
                            </div>
                            <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                              User: <strong>{recoveryUsername}</strong> | CIN: <strong>{recoveryResult.cin}</strong>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label style={{ fontSize: '0.8rem' }}>Nouveau mot de passe</label>
                              <div className="input-wrapper">
                                <Shield size={16} className="input-icon" />
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                              <label style={{ fontSize: '0.8rem' }}>Confirmer le mot de passe</label>
                              <div className="input-wrapper">
                                <Shield size={16} className="input-icon" />
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="btn btn-primary"
                              style={{ width: '100%' }}
                              disabled={resetLoading || !newPassword || newPassword !== confirmPassword}
                            >
                              {resetLoading ? <Loader2 size={18} className="spin" /> : "Changer le mot de passe"}
                            </button>
                          </form>
                        ) : (
                          <div style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                              NON - ÉCHEC DE LA VÉRIFICATION
                            </div>
                            <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem' }}>
                              L'identifiant <strong>{recoveryUsername}</strong> ne correspond pas à la carte d'identité fournie.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <button className="btn btn-ghost" onClick={resetRecovery} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {resetSuccess ? "Retour à la connexion" : "Annuler"}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
