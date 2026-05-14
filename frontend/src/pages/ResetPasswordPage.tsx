import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import logoImage from '../assets/image.png';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setChecking(false);
      return;
    }
    authApi.validateResetToken(token)
      .then(valid => setTokenValid(valid))
      .catch(() => setTokenValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Mot de passe réinitialisé !');
    } catch {
      toast.error('Lien invalide ou expiré. Veuillez faire une nouvelle demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape login-bg-shape-1" />
      <div className="login-bg-shape login-bg-shape-2" />

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <img src={logoImage} alt="CIMR" style={{ width: 100, marginBottom: '1rem' }} />
              <h1>Portail CIMR</h1>
            </div>
            <h2>Caisse Interprofessionnelle<br />Marocaine de Retraite</h2>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form">
            <div className="login-form-header">
              <h3>Nouveau mot de passe</h3>
              <p>Définissez votre nouveau mot de passe CIMR</p>
            </div>

            {checking && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#1a5c28' }} />
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Vérification du lien...</p>
              </div>
            )}

            {!checking && tokenValid === false && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <XCircle size={52} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Lien invalide ou expiré</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Ce lien de réinitialisation est invalide ou a expiré (validité : 1 heure).
                </p>
                <button className="login-submit" onClick={() => navigate('/login')}>
                  Retour à la connexion
                </button>
              </div>
            )}

            {!checking && tokenValid && !success && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <div className="input-wrapper">
                    <Shield size={18} className="input-icon" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Minimum 6 caractères"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <div className="input-wrapper">
                    <Shield size={18} className="input-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Répétez le mot de passe"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="field-error">Les mots de passe ne correspondent pas</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                >
                  {loading
                    ? <><Loader2 size={18} className="spin" /> Réinitialisation...</>
                    : 'Réinitialiser le mot de passe'
                  }
                </button>
              </form>
            )}

            {!checking && success && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <CheckCircle size={52} color="#1a5c28" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ color: '#1a5c28', marginBottom: '0.5rem' }}>Mot de passe mis à jour !</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <button className="login-submit" onClick={() => navigate('/login')}>
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
