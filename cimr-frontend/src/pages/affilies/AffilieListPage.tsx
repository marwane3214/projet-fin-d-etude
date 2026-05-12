import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { affilieApi } from '../../api/affilies';
import type { Affilie } from '../../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const DEMO: Affilie[] = [
  { id: '1', numImmatriculation: '882910', nom: 'Alami', prenom: 'Mohamed', cin: 'BE123456', dateNaissance: '1975-05-15', sexe: 'M', situationFamiliale: 'MARIE', adresse: '12 Rue Hassan II', ville: 'Casablanca', telephone: '0661234567', email: 'm.alami@email.ma', dateAffiliation: '2005-01-01', employeur: 'TECH MAROC SA', salaireMensuel: 12000, status: 'ACTIVE' },
  { id: '2', numImmatriculation: '882911', nom: 'Benali', prenom: 'Fatima', cin: 'BK789012', dateNaissance: '1980-03-22', sexe: 'F', situationFamiliale: 'CELIBATAIRE', adresse: '45 Av Mohammed V', ville: 'Rabat', telephone: '0662345678', email: 'f.benali@email.ma', dateAffiliation: '2010-06-15', employeur: 'MAROC TELECOM', salaireMensuel: 15000, status: 'ACTIVE' },
  { id: '3', numImmatriculation: '882912', nom: 'Chakir', prenom: 'Hassan', cin: 'JC345678', dateNaissance: '1968-11-08', sexe: 'M', situationFamiliale: 'MARIE', adresse: '78 Bd Zerktouni', ville: 'Casablanca', telephone: '0663456789', email: 'h.chakir@email.ma', dateAffiliation: '1995-03-01', employeur: 'OCP GROUP', salaireMensuel: 25000, status: 'RETIRED' },
  { id: '4', numImmatriculation: '882913', nom: 'Daoudi', prenom: 'Rachid', cin: 'DA901234', dateNaissance: '1972-07-30', sexe: 'M', situationFamiliale: 'DIVORCE', adresse: '23 Rue Ibn Batouta', ville: 'Fès', telephone: '0664567890', email: 'r.daoudi@email.ma', dateAffiliation: '2000-09-01', employeur: 'BMCE BANK', salaireMensuel: 18000, status: 'ACTIVE' },
  { id: '5', numImmatriculation: '882914', nom: 'El Fassi', prenom: 'Amina', cin: 'EF567890', dateNaissance: '1985-12-03', sexe: 'F', situationFamiliale: 'MARIE', adresse: '56 Av Hassan II', ville: 'Marrakech', telephone: '0665678901', email: 'a.elfassi@email.ma', dateAffiliation: '2012-01-15', employeur: 'MANAGEM', salaireMensuel: 20000, status: 'ACTIVE' },
  { id: '6', numImmatriculation: '882915', nom: 'Idrissi', prenom: 'Youssef', cin: 'ID112233', dateNaissance: '1977-08-14', sexe: 'M', situationFamiliale: 'MARIE', adresse: '10 Rue Allal Ben Abdellah', ville: 'Meknès', telephone: '0666789012', email: 'y.idrissi@email.ma', dateAffiliation: '2003-04-20', employeur: 'LAFARGE MAROC', salaireMensuel: 22000, status: 'ACTIVE' },
  { id: '7', numImmatriculation: '882916', nom: 'Karimi', prenom: 'Nadia', cin: 'KA334455', dateNaissance: '1983-01-09', sexe: 'F', situationFamiliale: 'CELIBATAIRE', adresse: '88 Bd Lalla Yacout', ville: 'Casablanca', telephone: '0667890123', email: 'n.karimi@email.ma', dateAffiliation: '2011-09-01', employeur: 'ATTIJARIWAFA', salaireMensuel: 19000, status: 'SUSPENDED' },
  { id: '8', numImmatriculation: '882917', nom: 'Lahlou', prenom: 'Omar', cin: 'LA556677', dateNaissance: '1965-04-25', sexe: 'M', situationFamiliale: 'MARIE', adresse: '34 Rue de la Liberté', ville: 'Tanger', telephone: '0668901234', email: 'o.lahlou@email.ma', dateAffiliation: '1990-07-01', employeur: 'SNEP', salaireMensuel: 28000, status: 'RETIRED' },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  ACTIVE:    { label: 'Actif',      badge: 'badge-success' },
  RETIRED:   { label: 'Retraité',   badge: 'badge-info'    },
  SUSPENDED: { label: 'Suspendu',   badge: 'badge-warning' },
  RADIE:     { label: 'Radié',      badge: 'badge-danger'  },
};

export default function AffilieListPage() {
  const [affilies, setAffilies]     = useState<Affilie[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [villeFilter, setVilleFilter]   = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  useEffect(() => { loadAffilies(); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter, villeFilter]);

  const loadAffilies = async () => {
    setLoading(true);
    try {
      const data = await affilieApi.getAll({ search });
      setAffilies(data);
    } catch {
      setAffilies(DEMO);
    } finally {
      setLoading(false);
    }
  };

  const villes = useMemo(() => [...new Set(affilies.map(a => a.ville).filter(Boolean))].sort(), [affilies]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return affilies.filter(a => {
      const matchSearch = !q
        || a.nom.toLowerCase().includes(q)
        || a.prenom.toLowerCase().includes(q)
        || a.cin?.toLowerCase().includes(q)
        || a.numImmatriculation?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || a.status === statusFilter;
      const matchVille  = !villeFilter  || a.ville === villeFilter;
      return matchSearch && matchStatus && matchVille;
    });
  }, [affilies, search, statusFilter, villeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilters = [
    statusFilter && { key: 'status', label: `Statut: ${STATUS_CONFIG[statusFilter]?.label ?? statusFilter}`, clear: () => setStatusFilter('') },
    villeFilter  && { key: 'ville',  label: `Ville: ${villeFilter}`,  clear: () => setVilleFilter('') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => { setStatusFilter(''); setVilleFilter(''); setSearch(''); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestion des Affiliés</h1>
          <p>{filtered.length} affilié(s) sur {affilies.length}</p>
        </div>
        <Link to="/affilies/new" className="btn btn-primary">
          <Plus size={15} /> Nouvel Affilié
        </Link>
      </div>

      <motion.div className="table-container" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* ── Toolbar ── */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="table-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Nom, CIN, matricule..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ padding: 0, color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal size={14} />
              Filtres
              {activeFilters.length > 0 && (
                <span style={{
                  background: 'var(--brand)',
                  color: '#fff',
                  borderRadius: '99px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0 5px',
                  lineHeight: '16px',
                  minWidth: 16,
                  textAlign: 'center',
                }}>{activeFilters.length}</span>
              )}
            </button>
          </div>
          <div className="table-toolbar-right">
            <select
              className="page-size-select"
              value={pageSize}
              onChange={e => { setPageSize(+e.target.value); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="filter-panel">
            <div>
              <label>Statut</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Ville</label>
              <select value={villeFilter} onChange={e => setVilleFilter(e.target.value)}>
                <option value="">Toutes les villes</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Active filter chips ── */}
        {activeFilters.length > 0 && (
          <div className="filter-chips">
            {activeFilters.map(f => (
              <span key={f.key} className="filter-chip">
                {f.label}
                <button onClick={f.clear}><X size={11} /></button>
              </span>
            ))}
            <button className="filter-chips-clear" onClick={clearAll}>Tout effacer</button>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="loading-state">
            <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
            Chargement...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>CIN</th>
                <th>Ville</th>
                <th>Employeur</th>
                <th style={{ textAlign: 'right' }}>Salaire</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => (
                <tr key={a.id}>
                  <td className="td-mono">{a.numImmatriculation}</td>
                  <td className="td-name">{a.nom} {a.prenom}</td>
                  <td className="td-mono">{a.cin}</td>
                  <td>{a.ville}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 450 }}>{a.employeur}</td>
                  <td className="td-number">{a.salaireMensuel?.toLocaleString('fr-MA')} MAD</td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[a.status]?.badge ?? 'badge-info'}`}>
                      {STATUS_CONFIG[a.status]?.label ?? a.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/affilies/${a.id}`} className="action-btn action-view" title="Consulter">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/affilies/${a.id}/edit`} className="action-btn action-edit" title="Modifier">
                        <Edit size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">Aucun affilié ne correspond aux critères</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ── Pagination ── */}
        <div className="table-footer">
          <span className="pagination-info">
            {filtered.length === 0 ? '0 résultat' : (
              <>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length}
              </>
            )}
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              title="Page précédente"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              title="Page suivante"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
