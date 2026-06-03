1. Service Affiliation
- Rôle : gérer l’inscription et le suivi des affiliés et adhérents.
- Fonctions :
- Création et mise à jour des fiches affiliés (CIN, matricule CIMR, employeur, coordonnées).
- Gestion des bulletins d’affiliation.
- Mise à jour mensuelle des informations personnelles (adresse, statut familial).
- Stockage des consentements CNDP.
- Upload et gestion des documents justificatifs.

2. Service Contributions & Points
- Rôle : enregistrer les contributions mensuelles et stocker les points acquis.
- Fonctions :
- Saisie mensuelle des contributions salariales et patronales.
- Association des contributions à chaque affilié.
- Stockage des points (déjà calculés par la CIMR, pas besoin de recalcul).
- Historique des contributions et points par période.
- Gestion des achats de points (si prévu par les formulaires).

3. Service Liquidation
- Rôle : gérer les demandes de liquidation des droits de retraite.
- Fonctions :
- Soumission des demandes de liquidation (normale, anticipée, prorogée, invalidité).
- Gestion des options : pension, capital, mixte.
- Vérification des pièces justificatives (acte de décès, acte de naissance, RIB, etc.).
- Application des délais légaux (rétractation 3 mois, prescription 5 ans).
- Génération du dossier de liquidation validé.

4. Service Allocations & Paiements
- Rôle : gérer le versement des pensions et allocations.
- Fonctions :
- Planification des paiements mensuels.
- Conversion pension → pécule (paiement unique).
- Suivi de l’historique des paiements.
- Intégration avec les banques (simulation ou API).
- Suspension/reprise des paiements selon déclarations de vie.

5. Services Adapters (CNSS, Banque, Assurance)
- Rôle : interopérabilité avec les systèmes externes.
- Fonctions :
- Vérification des plafonds CNSS et attestations de salaires.
- Intégration bancaire (validation IBAN/BIC, simulation virement).
- Attestations des compagnies d’assurance (capitalisation, remboursements).
- Stockage des attestations externes.



V2 :

 Couverture des fonctionnalités du règlement CIMR
1. Affiliation
- Articles concernés : Article 4 (Adhésion et Affiliation), Bulletins d’adhésion et d’affiliation.
- Service correspondant : Affiliation Service
- Fonctions couvertes :
- Création et gestion des affiliés.
- Affiliation des salariés et membres non-salariés.
- Suspension et radiation d’affiliés (Article 5, Article 6, Article 7).
- Mise à jour mensuelle des informations personnelles.

2. Contributions & Droits acquis
- Articles concernés : Article 6 (Calcul des contributions), Article 7 (Versements), Livret individuel.
- Service correspondant : Contributions & Points Service
- Fonctions couvertes :
- Enregistrement des contributions salariales et patronales.
- Stockage des points acquis (déjà calculés par la CIMR).
- Gestion des achats de points (Moubakkir, Mousabbak).
- Historique des droits par affilié.

3. Liquidation des droits
- Articles concernés : Titre 2, Articles 13–21 (Liquidation, âge normal, anticipation, prorogation, invalidité).
- Service correspondant : Liquidation Service
- Fonctions couvertes :
- Soumission des demandes de liquidation.
- Gestion des options : pension, capital, mixte.
- Application des délais légaux (rétractation, prescription).
- Vérification des pièces justificatives.

4. Allocations & Paiements
- Articles concernés : Article 28 (Modalités de paiement), Article 29 (Prescription).
- Service correspondant : Allocations & Payments Service
- Fonctions couvertes :
- Versement des pensions mensuelles.
- Conversion en pécule (Article 20).
- Historique des paiements.
- Suspension/reprise selon déclarations de vie.

5. Interopérabilité externe
- Articles concernés : Référence CNSS, compagnies d’assurance, banques.
- Service correspondant : Adapters Service
- Fonctions couvertes :
- Vérification plafonds CNSS.
- Attestations de salaires.
- Intégration bancaire (IBAN/BIC).
- Attestations compagnies d’assurance.
