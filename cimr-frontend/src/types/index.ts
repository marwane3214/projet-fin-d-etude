// ============ AUTH ============
export type UserRole = 'ROLE_ADMIN' | 'ROLE_AFFILIE' | 'ROLE_ADHERENT' | 'ROLE_AGENT';

export interface AuthUser {
  token: string;
  username: string;
  nomComplexe?: string;
  affilieId?: string; // UUID — present for ROLE_AFFILIE users, null for admin/agent
  roles: UserRole[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

// ============ AFFILIATION ============
export interface Affilie {
  id?: string;
  numImmatriculation?: string;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  lieuNaissance?: string;
  sexe: 'M' | 'F';
  situationFamiliale: 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF';
  adresse: string;
  ville: string;
  telephone: string;
  email?: string;
  dateAffiliation: string;
  employeur?: string;
  salaireMensuel?: number;
  status: 'ACTIVE' | 'RETIRED' | 'DECEASED' | 'SUSPENDED' | 'RADIE';
  consentCndp?: boolean;
  dateConsent?: string | null;
  dateInscription?: string;
  bulletins?: BulletinAffiliation[];
  justificatifs?: Justificatif[];
}

export interface BulletinAffiliation {
  id: string;
  reference: string;
  dateCreation: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED';
}

export interface Justificatif {
  id: string;
  nom: string;
  typeDocument: string;
  urlStockage: string;
  dateUpload: string;
}

export interface Adherent {
  id?: string;
  raisonSociale: string;
  ice: string;
  identifiantFiscal?: string;
  adresse: string;
  telephone: string;
  email: string;
  dateAdhesion: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
}

// ============ CONTRIBUTIONS & POINTS ============
export interface Contribution {
  id?: string;
  affilieId: string;
  affilieNom?: string;
  periode: string; // YYYY-MM
  salaireMensuel: number;
  contributionSalariale: number;
  contributionPatronale: number;
  taux?: number;
  pointsAcquis?: number;
  statut?: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  createdAt?: string;
}

export interface PointsLedger {
  id?: string;
  affilieId: string;
  periode: string;
  pointsAcquis: number;
  dateAttribution?: string;
}

export interface PointValue {
  id?: string;
  year: number;
  value: number;
  dateApplication?: string;
}

export type PointsPurchaseStatut = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface PointsPurchase {
  id?: string;
  affilieId: string;
  affilieNom?: string;
  pointsGranted: number;
  montantVerse: number;
  referenceVirement: string;
  banque?: string;
  dateVirement: string;
  preuvePath?: string;
  statut: PointsPurchaseStatut;
  motifRejet?: string;
  dateAchat?: string;
  validePar?: string;
  dateValidation?: string;
  createdAt?: string;
}

export interface LivretIndividuel {
  affilieId: string;
  contributions: Contribution[];
  pointsLedger: PointsLedger[];
  pointsPurchase: PointsPurchase[];
  totalPoints: number;
  dateGeneration?: string;
}

// ============ LIQUIDATION ============
export type TypeLiquidation = 'NORMALE' | 'ANTICIPEE' | 'PROROGEE' | 'INVALIDITE';
export type StatutDossier = 'BROUILLON' | 'DEPOSE' | 'ATTENTE_DOCS' | 'EN_COURS' | 'VALIDE' | 'REJETE' | 'LIQUIDE' | 'RETRACTE';

export interface DemandeLiquidation {
  id?: string;
  affilieId: string;
  affilieNom?: string;
  typeLiquidation: TypeLiquidation;
  dateDepot: string;
  dateLiquidation?: string;
  montantPension?: number;
  statut: StatutDossier;
  motifRejet?: string;
  documents?: DossierDocument[];
  createdAt?: string;
}

export interface DossierDocument {
  id?: string;
  demandeLiquidationId: string;
  typeDocument: string;
  nomFichier: string;
  tailleFichier?: number;
  urlFichier?: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  uploadDate: string;
}

// ============ PAYMENTS ============
export interface Allocation {
  id?: string;
  affilieId: string;
  affilieNom?: string;
  affilieUsername?: string;
  typeAllocation: 'PENSION_MENSUELLE' | 'CAPITAL_UNIQUE' | 'PECULE';
  montant: number;
  dateDebut: string;
  dateFin?: string;
  statut: 'ACTIVE' | 'SUSPENDUE' | 'TERMINEE';
}

export interface Paiement {
  id?: string;
  allocationId: string;
  montant: number;
  datePaiement: string;
  modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES';
  reference?: string;
  statut: 'PLANIFIE' | 'EXECUTE' | 'ECHOUE' | 'ANNULE';
}

// ============ REVERSION ============
export interface AyantDroit {
  id?: string;
  affilieDecedéId: string;
  nom: string;
  prenom: string;
  cin: string;
  lienParente: 'CONJOINT' | 'ORPHELIN' | 'PARENT';
  dateNaissance: string;
  tauxReversion: number;
  montantReversion?: number;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  documents?: string[];
}

// ============ ADMIN & AUDIT ============
export interface AuditLog {
  id?: string;
  action: string;
  entite: string;
  entiteId: string;
  utilisateur: string;
  details?: string;
  adresseIp?: string;
  dateAction: string;
}

export interface UserConsent {
  id?: string;
  userId: string;
  typeConsent: string;
  consenti: boolean;
  dateConsent: string;
  dateRevocation?: string;
}

// ============ UTILS ============
export interface PageRequest {
  page: number;
  size: number;
  search?: string;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
