import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, Globe, Database, Monitor, Moon, Sun, Save, Check, Lock, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Settings persisted in localStorage
const STORAGE_KEY = 'cimr_settings';

interface AppSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifLiquidation: boolean;
  notifPaiement: boolean;
  notifReversion: boolean;
  notifSystem: boolean;
  notifSound: boolean;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCompact: boolean;
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  // Language
  language: 'fr' | 'ar';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: 'MAD' | 'EUR';
  // Security
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  // Privacy
  analyticsEnabled: boolean;
  dataSharingEnabled: boolean;
}

const defaultSettings: AppSettings = {
  emailNotifications: true,
  pushNotifications: true,
  notifLiquidation: true,
  notifPaiement: true,
  notifReversion: true,
  notifSystem: true,
  notifSound: true,
  theme: 'light',
  sidebarCompact: false,
  animationsEnabled: true,
  fontSize: 'medium',
  language: 'fr',
  dateFormat: 'DD/MM/YYYY',
  currency: 'MAD',
  sessionTimeout: 30,
  twoFactorEnabled: false,
  loginAlerts: true,
  analyticsEnabled: true,
  dataSharingEnabled: false,
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const ToggleSwitch = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 0', borderBottom: '1px solid var(--border-light)',
  }}>
    <div>
      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</div>
      {description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '48px', height: '26px', borderRadius: '99px',
        background: value ? 'var(--brand)' : 'var(--border)',
        position: 'relative', transition: 'background 0.3s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px',
        left: value ? '25px' : '3px',
        transition: 'left 0.3s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'language' | 'security' | 'privacy'>('notifications');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  // Apply theme immediately whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.setAttribute('data-theme', 'dark') : root.removeAttribute('data-theme');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  // Apply font size immediately — set on html so rem units scale everywhere
  useEffect(() => {
    const sizes = { small: '13px', medium: '14px', large: '16px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  // Auto-save whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveAll = () => {
    saveSettings(settings);
    setSaved(true);
    toast.success('Paramètres sauvegardés');

  };

  const handleResetAll = () => {
    if (window.confirm('Réinitialiser tous les paramètres par défaut ?')) {
      setSettings(defaultSettings);
      saveSettings(defaultSettings);
      toast.success('Paramètres réinitialisés');
    }
  };

  const tabs = [
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Apparence', icon: Palette },
    { id: 'language' as const, label: 'Langue & Région', icon: Globe },
    { id: 'security' as const, label: 'Sécurité', icon: Shield },
    { id: 'privacy' as const, label: 'Confidentialité', icon: Database },
  ];
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Configurer l'application selon vos préférences</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={handleResetAll}>Réinitialiser</button>
          <button className="btn btn-primary" onClick={handleSaveAll}>
            {saved ? <><Check size={16} /> Sauvegardé</> : <><Save size={16} /> Sauvegarder</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Tab Navigation */}
        <motion.div
          className="form-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ padding: '0.5rem' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
                background: activeTab === tab.id ? 'var(--info-bg)' : 'transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Right: Content */}
        <motion.div
          key={activeTab}
          className="form-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* === NOTIFICATIONS === */}
          {activeTab === 'notifications' && (
            <>
              <h3 className="form-section-title"><Bell size={20} /> Préférences de Notifications</h3>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Canaux
                </h4>
                <ToggleSwitch
                  value={settings.emailNotifications}
                  onChange={v => updateSetting('emailNotifications', v)}
                  label="Notifications par Email"
                  description="Recevoir les alertes et résumés par email"
                />
                <ToggleSwitch
                  value={settings.pushNotifications}
                  onChange={v => updateSetting('pushNotifications', v)}
                  label="Notifications Push"
                  description="Notifications en temps réel dans le navigateur"
                />
                <ToggleSwitch
                  value={settings.notifSound}
                  onChange={v => updateSetting('notifSound', v)}
                  label={settings.notifSound ? "Son activé" : "Son désactivé"}
                  description="Émettre un son lors de nouvelles notifications"
                />
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Catégories
                </h4>
                <ToggleSwitch
                  value={settings.notifLiquidation}
                  onChange={v => updateSetting('notifLiquidation', v)}
                  label="Liquidation"
                  description="Nouvelles demandes, changements de statut"
                />
                <ToggleSwitch
                  value={settings.notifPaiement}
                  onChange={v => updateSetting('notifPaiement', v)}
                  label="Paiements"
                  description="Paiements exécutés, échéances, échecs"
                />
                <ToggleSwitch
                  value={settings.notifReversion}
                  onChange={v => updateSetting('notifReversion', v)}
                  label="Réversion"
                  description="Demandes d'ayants-droit, approbations"
                />
                <ToggleSwitch
                  value={settings.notifSystem}
                  onChange={v => updateSetting('notifSystem', v)}
                  label="Système"
                  description="Maintenance, mises à jour, alertes de sécurité"
                />
              </div>
            </>
          )}

          {/* === APPEARANCE === */}
          {activeTab === 'appearance' && (
            <>
              <h3 className="form-section-title"><Palette size={20} /> Apparence</h3>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Thème de l'interface
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { value: 'light' as const, label: 'Clair', icon: Sun, colors: ['#ffffff', '#f8fafc'] },
                    { value: 'dark' as const, label: 'Sombre', icon: Moon, colors: ['#0f172a', '#1e293b'] },
                    { value: 'system' as const, label: 'Système', icon: Monitor, colors: ['#ffffff', '#0f172a'] },
                  ].map(theme => (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                        padding: '1.5rem 1rem',
                        border: `2px solid ${settings.theme === theme.value ? 'var(--brand)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: settings.theme === theme.value ? 'var(--info-bg)' : '#fff',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {theme.colors.map((c, i) => (
                          <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: '1px solid var(--border)' }} />
                        ))}
                      </div>
                      <theme.icon size={20} style={{ color: settings.theme === theme.value ? 'var(--brand)' : 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: settings.theme === theme.value ? 'var(--brand)' : 'var(--text-secondary)' }}>
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  Taille du texte
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { value: 'small' as const, label: 'Petit', size: '13px' },
                    { value: 'medium' as const, label: 'Moyen', size: '15px' },
                    { value: 'large' as const, label: 'Grand', size: '17px' },
                  ].map(fs => (
                    <button
                      key={fs.value}
                      onClick={() => updateSetting('fontSize', fs.value)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: `2px solid ${settings.fontSize === fs.value ? 'var(--brand)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: settings.fontSize === fs.value ? 'var(--info-bg)' : '#fff',
                        fontWeight: 600, fontSize: fs.size, cursor: 'pointer',
                        color: settings.fontSize === fs.value ? 'var(--brand)' : 'var(--text-secondary)',
                      }}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              <ToggleSwitch
                value={settings.sidebarCompact}
                onChange={v => updateSetting('sidebarCompact', v)}
                label="Barre latérale compacte"
                description="Réduire la barre latérale par défaut"
              />
              <ToggleSwitch
                value={settings.animationsEnabled}
                onChange={v => updateSetting('animationsEnabled', v)}
                label="Animations"
                description="Activer les transitions et animations de l'interface"
              />
            </>
          )}

          {/* === LANGUAGE === */}
          {activeTab === 'language' && (
            <>
              <h3 className="form-section-title"><Globe size={20} /> Langue & Région</h3>

              <div className="form-grid cols-2" style={{ gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Langue de l'interface</label>
                  <select
                    className="form-control"
                    value={settings.language}
                    onChange={e => updateSetting('language', e.target.value as AppSettings['language'])}
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ar">🇲🇦 Arabe (العربية)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Format de date</label>
                  <select
                    className="form-control"
                    value={settings.dateFormat}
                    onChange={e => updateSetting('dateFormat', e.target.value as AppSettings['dateFormat'])}
                  >
                    <option value="DD/MM/YYYY">JJ/MM/AAAA (31/12/2024)</option>
                    <option value="YYYY-MM-DD">AAAA-MM-JJ (2024-12-31)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Devise</label>
                  <select
                    className="form-control"
                    value={settings.currency}
                    onChange={e => updateSetting('currency', e.target.value as AppSettings['currency'])}
                  >
                    <option value="MAD">🇲🇦 Dirham Marocain (MAD)</option>
                    <option value="EUR">🇪🇺 Euro (EUR)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuseau horaire</label>
                  <input type="text" value="Africa/Casablanca (GMT+1)" disabled style={{ background: 'var(--bg-input)', cursor: 'not-allowed' }} />
                </div>
              </div>
            </>
          )}

          {/* === SECURITY === */}
          {activeTab === 'security' && (
            <>
              <h3 className="form-section-title"><Shield size={20} /> Sécurité</h3>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Délai d'expiration de la session (minutes)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    min={5} max={120} step={5}
                    value={settings.sessionTimeout}
                    onChange={e => updateSetting('sessionTimeout', Number(e.target.value))}
                    style={{ flex: 1, height: '6px', borderRadius: '99px', cursor: 'pointer', accentColor: 'var(--brand)' }}
                  />
                  <span style={{
                    background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                    fontWeight: 700, fontSize: '0.9rem', minWidth: '60px', textAlign: 'center',
                  }}>
                    {settings.sessionTimeout} min
                  </span>
                </div>
              </div>

              <ToggleSwitch
                value={settings.twoFactorEnabled}
                onChange={v => {
                  updateSetting('twoFactorEnabled', v);
                  toast(v ? 'Authentification 2FA activée' : 'Authentification 2FA désactivée', { icon: v ? '🔒' : '🔓' });
                }}
                label="Authentification à deux facteurs (2FA)"
                description="Ajouter une couche de sécurité supplémentaire lors de la connexion"
              />
              <ToggleSwitch
                value={settings.loginAlerts}
                onChange={v => updateSetting('loginAlerts', v)}
                label="Alertes de connexion"
                description="Recevoir un email lors de chaque connexion à votre compte"
              />

              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Lock size={18} style={{ color: 'var(--brand)' }} />
                  <strong style={{ color: 'var(--brand)', fontSize: '0.9rem' }}>Sessions Actives</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #dbeafe' }}>
                    <span>🖥️ Windows — Chrome 122 (Session actuelle)</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>📱 Android — App Mobile</span>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => toast.success('Session déconnectée')}
                    >
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === PRIVACY === */}
          {activeTab === 'privacy' && (
            <>
              <h3 className="form-section-title"><Database size={20} /> Confidentialité & Données</h3>

              <div style={{
                padding: '1.25rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)',
                border: '1px solid #fef3c7', marginBottom: '1.5rem',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <Shield size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Conformité CNDP — Loi 09-08</strong>
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                    Vos données personnelles sont protégées conformément à la loi 09-08 relative à la protection 
                    des données à caractère personnel. Vous avez le droit d'accéder, de rectifier et de supprimer vos données.
                  </p>
                </div>
              </div>

              <ToggleSwitch
                value={settings.analyticsEnabled}
                onChange={v => updateSetting('analyticsEnabled', v)}
                label="Analytics d'utilisation"
                description="Nous aider à améliorer l'application en partageant des données d'usage anonymes"
              />
              <ToggleSwitch
                value={settings.dataSharingEnabled}
                onChange={v => updateSetting('dataSharingEnabled', v)}
                label="Partage de données"
                description="Autoriser le partage de données anonymisées avec des partenaires CIMR"
              />

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => {
                  const blob = new Blob([JSON.stringify({ username: 'admin', settings, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'cimr_data_export.json';
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(url);
                  toast.success('Données exportées avec succès');
                }}>
                  <Eye size={16} /> Exporter mes données
                </button>
                <button className="btn btn-danger" onClick={() => {
                  if (window.confirm('⚠️ Cette action est irréversible. Voulez-vous vraiment supprimer toutes vos données ?')) {
                    toast.error('Demande de suppression envoyée à l\'administrateur');
                  }
                }}>
                  <Trash2 size={16} /> Supprimer mon compte
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
