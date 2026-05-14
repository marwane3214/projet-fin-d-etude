import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard:     'Tableau de bord',
  affilies:      'Affiliés',
  contributions: 'Cotisations',
  points:        'Achat de points',
  simulation:    'Simulation',
  liquidations:  'Liquidation',
  payments:      'Paiements',
  notifications: 'Notifications',
  profile:       'Mon profil',
  settings:      'Paramètres',
  'audit-logs':  'Audit',
  reversions:    'Réversions',
  new:           'Nouveau',
  edit:          'Modifier',
  detail:        'Détail',
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <div className="breadcrumb-bar">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/dashboard" aria-label="Accueil">
            <Home size={13} />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className={`breadcrumb-item ${crumb.isLast ? 'active' : ''}`}>
            <span className="breadcrumb-separator">
              <ChevronRight size={12} />
            </span>
            {crumb.isLast ? (
              <span>{crumb.label}</span>
            ) : (
              <Link to={crumb.path}>{crumb.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
