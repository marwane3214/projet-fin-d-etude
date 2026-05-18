import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Shield, Calendar, Key,
  Save, Camera, Clock, Activity, Check, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api/notifications';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();

  // Load profile from localStorage or fallback
  const savedProfile = JSON.parse(localStorage.getItem(`cimr_profile_${user?.username}`) || 'null');

  // Profile form
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(savedProfile || {
    displayName: user?.username || '',
    email: `${user?.username?.replace('.', '')}@cimr.ma`,
    phone: '0661234567',
    address: '12 Rue Hassan II, Casablanca',
    city: 'Casablanca',
    dateNaissance: '1985-06-15',
  });

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Activity log — read from localStorage (tracked on login/save/password change)
  const ACTIVITY_KEY = `cimr_activity_${user?.username}`;
  const storedActivity: { action: string; date: string; ip: string; iconKey: string }[] =
    JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
  const iconMap: Record<string, React.ElementType> = { Activity, User, Key, Shield, Camera };
  const activityLog = storedActivity.length > 0
    ? storedActivity.map(a => ({ ...a, icon: iconMap[a.iconKey] ?? Activity }))
    : [{ action: 'Connexion initiale', date: new Date().toLocaleString('fr-FR'), ip: 'localhost', icon: Activity }];

  const trackActivity = (action: string, iconKey: string) => {
    const existing: { action: string; date: string; ip: string; iconKey: string }[] =
      JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
    const entry = { action, date: new Date().toLocaleString('fr-FR'), ip: 'localhost', iconKey };
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify([entry, ...existing].slice(0, 10)));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // Simulate API call and save to local storage for persistence
    await new Promise(r => setTimeout(r, 600));
    
    if (user?.username) {
      localStorage.setItem(`cimr_profile_${user.username}`, JSON.stringify(profileData));
      trackActivity('Modification du profil', 'User');
    }
    
    setSavingProfile(false);
    setIsEditing(false);
    toast.success('Profil mis à jour avec succès');

    // Notify admin silently
    if (!isAdmin) {
      notificationApi.createNotification({
        userId: 'admin',
        title: 'Modification du profil affilié',
        message: `L'affilié ${user?.username} a mis à jour ses informations personnelles (email, téléphone, adresse).`,
        type: 'AFFILIE',
      }).catch(() => {});
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setSavingPassword(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSavingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
    toast.success('Mot de passe modifié avec succès');

    // Notify admin silently
    if (!isAdmin) {
      notificationApi.createNotification({
        userId: 'admin',
        title: 'Changement de mot de passe',
        message: `L'affilié ${user?.username} a modifié son mot de passe.`,
        type: 'SECURITY',
      }).catch(() => {});
    }
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' };
    if (pw.length < 6) return { label: 'Faible', color: 'var(--danger)', width: '25%' };
    if (pw.length < 8) return { label: 'Moyen', color: 'var(--warning)', width: '50%' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw))
      return { label: 'Fort', color: 'var(--success)', width: '100%' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw))
      return { label: 'Bon', color: 'var(--brand)', width: '75%' };
    return { label: 'Moyen', color: 'var(--warning)', width: '50%' };
  };

  const pwStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mon Profil</h1>
          <p>Gérer vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Avatar Card */}
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '3rem', fontWeight: 800, color: '#fff',
            position: 'relative',
          }}>
            {user?.username?.charAt(0).toUpperCase()}
            <button
              style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#fff', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)', cursor: 'pointer',
              }}
              title="Changer la photo"
              onClick={() => toast('Fonctionnalité photo à venir', { icon: '📷' })}
            >
              <Camera size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.username}</h3>
          <span className={`badge badge-${isAdmin ? 'info' : 'success'}`} style={{ fontSize: '0.8rem' }}>
            {isAdmin ? 'Administrateur' : 'Affilié'}
          </span>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Mail size={16} /> {profileData.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Phone size={16} /> {profileData.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} /> {profileData.city}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Calendar size={16} /> Membre depuis Mars 2024
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rôles</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {user?.roles?.map((role, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '6px',
                  fontSize: '0.7rem', fontWeight: 700,
                  background: 'var(--brand)', color: '#fff',
                }}>
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Information */}
          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="form-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                <User size={20} /> Informations Personnelles
              </h3>
              {!isEditing ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>Modifier</button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Annuler</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={savingProfile}>
                    <Save size={14} /> {savingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              )}
            </div>

            <div className="form-grid cols-2">
              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" value={user?.username || ''} disabled style={{ background: 'var(--bg-input)', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Adresse</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group">
                <label>Date de Naissance</label>
                <input
                  type="date"
                  value={profileData.dateNaissance}
                  onChange={e => setProfileData({ ...profileData, dateNaissance: e.target.value })}
                  disabled={!isEditing}
                  style={!isEditing ? { background: 'var(--bg-input)', cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>
          </motion.div>

          {/* Security — Change Password */}
          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordSection ? '1.5rem' : 0 }}>
              <h3 className="form-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                <Key size={20} /> Sécurité du Compte
              </h3>
              <button
                className={`btn ${showPasswordSection ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? 'Annuler' : 'Changer le mot de passe'}
              </button>
            </div>

            {showPasswordSection && (
              <form onSubmit={handleChangePassword}>
                <div className="form-grid cols-2" style={{ marginBottom: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Mot de passe actuel</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Entrez votre mot de passe actuel"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Min. 6 caractères"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Force</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: pwStrength.color }}>{pwStrength.label}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: pwStrength.width, height: '100%', background: pwStrength.color, borderRadius: '99px', transition: 'all 0.3s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Répétez le mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <span className="field-error">Les mots de passe ne correspondent pas</span>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Check size={12} /> Les mots de passe correspondent
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                    <Key size={16} /> {savingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </form>
            )}

            {!showPasswordSection && (
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                  Dernière modification: il y a 4 jours
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Shield size={14} />
                  Authentification active
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity Log */}
          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="form-section-title" style={{ marginBottom: '1rem' }}>
              <Clock size={20} /> Activité Récente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {activityLog.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 0',
                  borderBottom: i < activityLog.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', flexShrink: 0,
                  }}>
                    <item.icon size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.action}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>IP: {item.ip}</span>
                    <span style={{ minWidth: '140px', textAlign: 'right' }}>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
