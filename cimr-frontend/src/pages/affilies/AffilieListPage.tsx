import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { affilieApi } from '../../api/affilies';
import type { Affilie } from '../../types';

export default function AffilieListPage() {
  const [affilies, setAffilies] = useState<Affilie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  useEffect(() => {
    loadAffilies();
  }, []);

  const loadAffilies = async () => {
    setLoading(true);
    try {
      const data = await affilieApi.getAll({ search });
      setAffilies(data);
    } catch {
      // Données de démonstration si API indisponible
      setAffilies([
        { id: '1', numImmatriculation: '882910', nom: 'Alami', prenom: 'Mohamed', cin: 'BE123456', dateNaissance: '1975-05-15', sexe: 'M', situationFamiliale: 'MARIE', adresse: '12 Rue Hassan II', ville: 'Casablanca', telephone: '0661234567', email: 'm.alami@email.ma', dateAffiliation: '2005-01-01', employeur: 'TECH MAROC SA', salaireMensuel: 12000, status: 'ACTIVE' },
        { id: '2', numImmatriculation: '882911', nom: 'Benali', prenom: 'Fatima', cin: 'BK789012', dateNaissance: '1980-03-22', sexe: 'F', situationFamiliale: 'CELIBATAIRE', adresse: '45 Av Mohammed V', ville: 'Rabat', telephone: '0662345678', email: 'f.benali@email.ma', dateAffiliation: '2010-06-15', employeur: 'MAROC TELECOM', salaireMensuel: 15000, status: 'ACTIVE' },
        { id: '3', numImmatriculation: '882912', nom: 'Chakir', prenom: 'Hassan', cin: 'JC345678', dateNaissance: '1968-11-08', sexe: 'M', situationFamiliale: 'MARIE', adresse: '78 Bd Zerktouni', ville: 'Casablanca', telephone: '0663456789', email: 'h.chakir@email.ma', dateAffiliation: '1995-03-01', employeur: 'OCP GROUP', salaireMensuel: 25000, status: 'RETIRED' },
        { id: '4', numImmatriculation: '882913', nom: 'Daoudi', prenom: 'Rachid', cin: 'DA901234', dateNaissance: '1972-07-30', sexe: 'M', situationFamiliale: 'DIVORCE', adresse: '23 Rue Ibn Batouta', ville: 'Fès', telephone: '0664567890', email: 'r.daoudi@email.ma', dateAffiliation: '2000-09-01', employeur: 'BMCE BANK', salaireMensuel: 18000, status: 'ACTIVE' },
        { id: '5', numImmatriculation: '882914', nom: 'El Fassi', prenom: 'Amina', cin: 'EF567890', dateNaissance: '1985-12-03', sexe: 'F', situationFamiliale: 'MARIE', adresse: '56 Av Hassan II', ville: 'Marrakech', telephone: '0665678901', email: 'a.elfassi@email.ma', dateAffiliation: '2012-01-15', employeur: 'MANAGEM', salaireMensuel: 20000, status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = affilies.filter(a => {
    const q = search.toLowerCase();
    return !q || a.nom.toLowerCase().includes(q) || a.prenom.toLowerCase().includes(q)
      || a.cin?.toLowerCase().includes(q) || a.numImmatriculation?.toLowerCase().includes(q);
  });



  const getStatusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'success';
      case 'RETIRED': return 'info';
      case 'SUSPENDED': return 'warning';
      case 'RADIE': return 'danger';
      default: return 'info';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'ACTIF';
      case 'RETIRED': return 'RETRAITE';
      case 'SUSPENDED': return 'SUSPENDU';
      case 'RADIE': return 'RADIE';
      default: return s;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestion des Affiliés</h1>
          <p>{filtered.length} affilié(s) trouvé(s)</p>
        </div>
        <Link to="/affilies/new" className="btn btn-primary">
          <Plus size={18} /> Nouvel Affilié
        </Link>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, CIN, matricule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <motion.div
        className="table-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>CIN</th>
                <th>Ville</th>
                <th>Employeur</th>
                <th>Salaire</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td className="td-mono">{a.numImmatriculation}</td>
                  <td className="td-name">{a.nom} {a.prenom}</td>
                  <td className="td-mono">{a.cin}</td>
                  <td>{a.ville}</td>
                  <td>{a.employeur}</td>
                  <td className="td-number">{a.salaireMensuel?.toLocaleString('fr-MA')} MAD</td>
                  <td><span className={`badge badge-${getStatusColor(a.status)}`}>{getStatusLabel(a.status)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/affilies/${a.id}`} className="action-btn action-view" title="Consulter">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/affilies/${a.id}/edit`} className="action-btn action-edit" title="Modifier">
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="empty-state">Aucun affilié trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      <div className="pagination">
        <button className="btn btn-sm btn-ghost"><ChevronLeft size={16} /> Précédent</button>
        <span className="pagination-info">Page 1 sur 1</span>
        <button className="btn btn-sm btn-ghost">Suivant <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
