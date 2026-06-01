import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, Globe, Database, Monitor, Moon, Sun, Save, Check, Lock, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { setLanguage, t } = useLanguage();
  const s = t.settings;
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
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
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
    toast.success(s.save);
  };

  const handleResetAll = () => {
    if (window.confirm(s.reset + ' ?')) {
      setSettings(defaultSettings);
      saveSettings(defaultSettings);
      setLanguage('fr');
      toast.success(s.reset);
    }
  };

  const tabs = [
    { id: 'notifications' as const, label: s.tabNotifications, icon: Bell },
    { id: 'appearance' as const, label: s.tabAppearance, icon: Palette },
    { id: 'language' as const, label: s.tabLanguage, icon: Globe },
    { id: 'security' as const, label: s.tabSecurity, icon: Shield },
    { id: 'privacy' as const, label: s.tabPrivacy, icon: Database },
  ];
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{s.title}</h1>
          <p>{s.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={handleResetAll}>{s.reset}</button>
          <button className="btn btn-primary" onClick={handleSaveAll}>
            {saved ? <><Check size={16} /> {s.saved}</> : <><Save size={16} /> {s.save}</>}
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
              <h3 className="form-section-title"><Bell size={20} /> {s.tabNotifications}</h3>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  {s.sectionChannels}
                </h4>
                <ToggleSwitch value={settings.emailNotifications} onChange={v => updateSetting('emailNotifications', v)} label={s.emailNotif} description={s.emailNotifDesc} />
                <ToggleSwitch value={settings.pushNotifications} onChange={v => updateSetting('pushNotifications', v)} label={s.pushNotif} description={s.pushNotifDesc} />
                <ToggleSwitch value={settings.notifSound} onChange={v => updateSetting('notifSound', v)} label={settings.notifSound ? s.soundOn : s.soundOff} description={s.soundDesc} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  {s.sectionCategories}
                </h4>
                <ToggleSwitch value={settings.notifLiquidation} onChange={v => updateSetting('notifLiquidation', v)} label={t.nav.liquidations} description="" />
                <ToggleSwitch value={settings.notifPaiement} onChange={v => updateSetting('notifPaiement', v)} label={t.nav.payments} description="" />
                <ToggleSwitch value={settings.notifReversion} onChange={v => updateSetting('notifReversion', v)} label={t.nav.reversions} description="" />
                <ToggleSwitch value={settings.notifSystem} onChange={v => updateSetting('notifSystem', v)} label="Système" description="" />
              </div>
            </>
          )}

          {/* === APPEARANCE === */}
          {activeTab === 'appearance' && (
            <>
              <h3 className="form-section-title"><Palette size={20} /> {s.tabAppearance}</h3>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  {s.theme}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { value: 'light' as const, label: s.light, icon: Sun, colors: ['#ffffff', '#f8fafc'] },
                    { value: 'dark' as const, label: s.dark, icon: Moon, colors: ['#0f172a', '#1e293b'] },
                    { value: 'system' as const, label: s.system, icon: Monitor, colors: ['#ffffff', '#0f172a'] },
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
                  {s.fontSize}
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { value: 'small' as const, label: s.small, size: '13px' },
                    { value: 'medium' as const, label: s.medium, size: '15px' },
                    { value: 'large' as const, label: s.large, size: '17px' },
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

              <ToggleSwitch value={settings.sidebarCompact} onChange={v => updateSetting('sidebarCompact', v)} label={s.compactSidebar} description={s.compactSidebarDesc} />
              <ToggleSwitch value={settings.animationsEnabled} onChange={v => updateSetting('animationsEnabled', v)} label={s.animations} description={s.animationsDesc} />
            </>
          )}

          {/* === LANGUAGE === */}
          {activeTab === 'language' && (
            <>
              <h3 className="form-section-title"><Globe size={20} /> {s.tabLanguage}</h3>
              <div className="form-grid cols-2" style={{ gap: '1.5rem' }}>
                <div className="form-group">
                  <label>{s.language}</label>
                  <select
                    className="form-control"
                    value={settings.language}
                    onChange={e => {
                      const lang = e.target.value as AppSettings['language'];
                      updateSetting('language', lang);
                      setLanguage(lang);
                      toast.success(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Langue changée en Français');
                    }}
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ar">🇲🇦 Arabe (العربية)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{s.dateFormat}</label>
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
                  <label>{s.currency}</label>
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
                  <label>{s.timezone}</label>
                  <input type="text" value="Africa/Casablanca (GMT+1)" disabled style={{ background: 'var(--bg-input)', cursor: 'not-allowed' }} />
                </div>
              </div>
            </>
          )}

          {/* === SECURITY === */}
          {activeTab === 'security' && (
            <>
              <h3 className="form-section-title"><Shield size={20} /> {s.tabSecurity}</h3>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>{s.sessionTimeout}</label>
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
                  toast(s.twoFactor, { icon: v ? '🔒' : '🔓' });
                }}
                label={s.twoFactor}
                description={s.twoFactorDesc}
              />
              <ToggleSwitch value={settings.loginAlerts} onChange={v => updateSetting('loginAlerts', v)} label={s.loginAlerts} description={s.loginAlertsDesc} />

              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Lock size={18} style={{ color: 'var(--brand)' }} />
                  <strong style={{ color: 'var(--brand)', fontSize: '0.9rem' }}>{s.activeSessions}</strong>
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
              <h3 className="form-section-title"><Database size={20} /> {s.tabPrivacy}</h3>
              <div style={{ padding: '1.25rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #fef3c7', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Shield size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>{s.cndpTitle}</strong>
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{s.cndpDesc}</p>
                </div>
              </div>
              <ToggleSwitch value={settings.analyticsEnabled} onChange={v => updateSetting('analyticsEnabled', v)} label={s.analytics} description={s.analyticsDesc} />
              <ToggleSwitch value={settings.dataSharingEnabled} onChange={v => updateSetting('dataSharingEnabled', v)} label={s.dataSharing} description={s.dataSharingDesc} />
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => {
                  const blob = new Blob([JSON.stringify({ username: 'admin', settings, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'cimr_data_export.json';
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(url);
                  toast.success(s.exportData);
                }}>
                  <Eye size={16} /> {s.exportData}
                </button>
                <button className="btn btn-danger" onClick={() => {
                  if (window.confirm('⚠️ ' + s.deleteAccount + ' ?')) {
                    toast.error(s.deleteAccount);
                  }
                }}>
                  <Trash2 size={16} /> {s.deleteAccount}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
