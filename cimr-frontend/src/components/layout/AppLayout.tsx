import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, Wallet, FileText, CreditCard,
  Heart, ShieldCheck, LogOut, Bell, Search, Menu, X, ChevronDown, Settings, ShoppingCart, Calculator
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AiAssistant from '../ai/AiAssistant';
import logoImage from '../../assets/image.png';
import { notificationApi } from '../../api/notifications';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
  { path: '/affilies', label: 'Affiliés', icon: Users, roles: ['ROLE_ADMIN'] },
  { path: '/contributions', label: 'Cotisations', icon: Wallet, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
  { path: '/contributions/points', label: 'Achat de points', icon: ShoppingCart, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
  { path: '/simulation', label: 'Simulation', icon: Calculator, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
  { path: '/liquidations', label: 'Liquidation', icon: FileText, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
  { path: '/payments', label: 'Paiements', icon: CreditCard, roles: ['ROLE_ADMIN', 'ROLE_AFFILIE'] },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user?.username) {
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    // Note: Admin service (notifications) has been decommissioned as requested
    setUnreadCount(0);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const filteredNav = navItems.filter(item =>
    item.roles.some(role => user?.roles?.includes(role as any))
  );

  const goTo = (path: string) => {
    setProfileOpen(false);
    navigate(path);
  };

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Sidebar Overlay for mobile */}
      {mobileMenuOpen && <div className="modal-overlay" style={{ zIndex: 95 }} onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logoImage} alt="Portail CIMR" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            {sidebarOpen && <span className="sidebar-logo-text">Portail CIMR</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={22} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}

          <button className="sidebar-link logout" onClick={handleLogout}>
            <LogOut size={22} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-sm mobile-only" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="topbar-search hide-mobile">
              <Search size={18} />
              <input type="text" placeholder="Rechercher dossiers, affiliés..." />
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-notification" onClick={() => navigate('/notifications')}>
              <Bell size={22} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <div
              ref={profileRef}
              className="topbar-profile"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ position: 'relative' }}
            >
              <div className="topbar-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info hide-mobile">
                <span className="topbar-user-name">{user?.username}</span>
                <span className="topbar-user-role">{isAdmin ? 'Administrateur' : 'Affilié'}</span>
              </div>
              <ChevronDown size={16} className="hide-mobile" />

              {profileOpen && (
                <div className="topbar-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => goTo('/profile')}>
                    <Users size={16} /> Mon profil
                  </button>
                  <button onClick={() => goTo('/settings')}>
                    <Settings size={16} /> Paramètres
                  </button>
                  <button onClick={() => goTo('/notifications')}>
                    <Bell size={16} /> Notifications
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <AiAssistant />

      <style>{`
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
