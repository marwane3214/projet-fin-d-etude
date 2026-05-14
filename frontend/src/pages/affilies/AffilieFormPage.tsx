import { useNavigate, useParams } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { affilieApi } from '../../api/affilies';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const affilieSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis (min 2 caractères)'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  cin: z.string().min(5, 'CIN invalide').max(15),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  lieuNaissance: z.string().optional(),
  sexe: z.enum(['M', 'F']),
  situationFamiliale: z.enum(['CELIBATAIRE', 'MARIE', 'DIVORCE', 'VEUF']),
  adresse: z.string().min(5, 'Adresse requise'),
  ville: z.string().min(2, 'Ville requise'),
  telephone: z.string().min(10, 'Téléphone requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  dateAffiliation: z.string().min(1, 'Date d\'affiliation requise'),
  employeur: z.string().optional(),
  salaireMensuel: z.coerce.number().min(0).optional(),
  consentementCndp: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
}).refine((_data: any) => {
  // We can't easily know if it's Edit in refine unless we pass it, but we can do it in the schema context or just check if we are creating
  return true; // Simplified for now, will handle below
}, {});

type AffilieForm = z.infer<typeof affilieSchema>;

export default function AffilieFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [originalData, setOriginalData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AffilieForm>({
    resolver: zodResolver(affilieSchema) as unknown as Resolver<AffilieForm>,
    defaultValues: {
      sexe: 'M',
      situationFamiliale: 'CELIBATAIRE',
    },
  });

  useEffect(() => {
    if (isEdit) {
      affilieApi.getById(id).then(data => {
        setOriginalData(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reset(data as any);
      }).catch(() => toast.error('Affilié introuvable'));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: AffilieForm) => {
    setLoading(true);
    try {
      const { consentementCndp, username, password, ...baseData } = data;
      const payload = isEdit && originalData ? {
        id: originalData.id,
        numImmatriculation: originalData.numImmatriculation,
        dateInscription: originalData.dateInscription,
        status: originalData.status || 'ACTIVE',
        nom: baseData.nom,
        prenom: baseData.prenom,
        cin: baseData.cin,
        dateNaissance: baseData.dateNaissance,
        lieuNaissance: baseData.lieuNaissance,
        sexe: baseData.sexe,
        situationFamiliale: baseData.situationFamiliale,
        adresse: baseData.adresse,
        ville: baseData.ville,
        telephone: baseData.telephone,
        email: baseData.email,
        dateAffiliation: baseData.dateAffiliation,
        employeur: baseData.employeur,
        salaireMensuel: baseData.salaireMensuel,
        consentCndp: consentementCndp ?? originalData.consentCndp,
        dateConsent: consentementCndp ? new Date().toISOString() : originalData.dateConsent,
      } : {
        ...baseData,
        username,
        password,
        status: 'ACTIVE',
        consentCndp: consentementCndp,
        dateConsent: consentementCndp ? new Date().toISOString() : null
      };

      if (isEdit) {
        await affilieApi.update(id, payload);
        toast.success('Affilié modifié avec succès');
      } else {
        await affilieApi.create(payload);
        toast.success('Affilié créé avec succès');
      }
      navigate('/affilies');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Save error:', err);
      const msg = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-back">
          <button className="btn btn-ghost" onClick={() => navigate('/affilies')}>
            <ArrowLeft size={18} /> Retour
          </button>
          <div>
            <h1>{isEdit ? 'Modifier l\'Affilié' : 'Nouvel Affilié'}</h1>
            <p>{isEdit ? 'Mettre à jour les informations' : 'Enregistrer un nouvel affilié dans le système CIMR'}</p>
          </div>
        </div>
      </div>

      <motion.form
        className="form-card"
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="form-section">
          <h3 className="form-section-title">Identité</h3>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Nom *</label>
              <input {...register('nom')} placeholder="Ex: Alami" />
              {errors.nom && <span className="field-error">{errors.nom.message}</span>}
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input {...register('prenom')} placeholder="Ex: Mohamed" />
              {errors.prenom && <span className="field-error">{errors.prenom.message}</span>}
            </div>
            <div className="form-group">
              <label>CIN *</label>
              <input {...register('cin')} placeholder="Ex: BE123456" />
              {errors.cin && <span className="field-error">{errors.cin.message}</span>}
            </div>
          </div>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Date de Naissance *</label>
              <input type="date" {...register('dateNaissance')} />
              {errors.dateNaissance && <span className="field-error">{errors.dateNaissance.message}</span>}
            </div>
            <div className="form-group">
              <label>Lieu de Naissance</label>
              <input {...register('lieuNaissance')} placeholder="Ex: Casablanca" />
            </div>
            <div className="form-group">
              <label>Sexe *</label>
              <select {...register('sexe')}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Situation Familiale *</label>
              <select {...register('situationFamiliale')}>
                <option value="CELIBATAIRE">Célibataire</option>
                <option value="MARIE">Marié(e)</option>
                <option value="DIVORCE">Divorcé(e)</option>
                <option value="VEUF">Veuf/Veuve</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Coordonnées</h3>
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Adresse *</label>
              <input {...register('adresse')} placeholder="Ex: 12 Rue Hassan II" />
              {errors.adresse && <span className="field-error">{errors.adresse.message}</span>}
            </div>
            <div className="form-group">
              <label>Ville *</label>
              <input {...register('ville')} placeholder="Ex: Casablanca" />
              {errors.ville && <span className="field-error">{errors.ville.message}</span>}
            </div>
          </div>
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Téléphone *</label>
              <input {...register('telephone')} placeholder="Ex: 0661234567" />
              {errors.telephone && <span className="field-error">{errors.telephone.message}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email')} placeholder="Ex: m.alami@email.ma" />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Affiliation</h3>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Date d'Affiliation *</label>
              <input type="date" {...register('dateAffiliation')} />
              {errors.dateAffiliation && <span className="field-error">{errors.dateAffiliation.message}</span>}
            </div>
            <div className="form-group">
              <label>Employeur</label>
              <input {...register('employeur')} placeholder="Ex: TECH MAROC SA" />
            </div>
            <div className="form-group">
              <label>Salaire Mensuel (MAD)</label>
              <input type="number" {...register('salaireMensuel')} placeholder="Ex: 12000" />
            </div>
          </div>
        </div>

        {/* Account Credentials - Only for new affiliates */}
        {!isEdit && (
          <div className="form-section">
            <h3 className="form-section-title">Informations de Connexion</h3>
            <div className="form-grid cols-2">
              <div className="form-group">
                <label>Nom d'utilisateur (Login)</label>
                <input
                  {...register('username')}
                  placeholder="ex: m.alami"
                  autoComplete="off"
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="field-error">{errors.username.message}</span>}
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="******"
                  autoComplete="new-password"
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="field-error">{errors.password.message}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3 className="form-section-title">Consentement CNDP (Loi 09-08)</h3>
          <label className="checkbox-label">
            <input type="checkbox" {...register('consentementCndp')} />
            <span>J'autorise la CIMR à collecter et traiter mes données personnelles conformément à la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.</span>
          </label>
        </div>

        {isEdit && (
          <>
            <div className="form-section">
              <h3 className="form-section-title">Bulletins d'Affiliation</h3>
              <div className="data-table-simple">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="td-mono">BULL-2024-0042</td>
                      <td>12/03/2024</td>
                      <td><span className="badge badge-success">VALIDÉ</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Documents Justificatifs</h3>
              <div className="data-table-simple">
                <table>
                  <thead>
                    <tr>
                      <th>Nom du document</th>
                      <th>Type</th>
                      <th>Date Upload</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CNI_Recto_Verso.pdf</td>
                      <td>CIN</td>
                      <td>10/03/2024</td>
                      <td><a href="#" className="link">Voir</a></td>
                    </tr>
                    <tr>
                      <td>RIB_Banque_Populaire.pdf</td>
                      <td>RIB</td>
                      <td>11/03/2024</td>
                      <td><a href="#" className="link">Voir</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: '1rem' }}>
                + Ajouter un document
              </button>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/affilies')}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} /> {loading ? 'Enregistrement...' : (isEdit ? 'Sauvegarder' : 'Créer l\'Affilié')}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
