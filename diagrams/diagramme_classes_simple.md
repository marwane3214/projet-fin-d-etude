# Diagramme de Classes Simplifié & Organisé (En Français) — Projet CIMR

Ce document contient le code source PlantUML pour le diagramme de classes rédigé entièrement en français, incluant le profil de l'Administrateur, avec tous les types techniques `UUID` remplacés par le format conceptuel `ID`, et tous les types monétaires au format `Double`.

---

## Code Source PlantUML

```plantuml
@startuml
' --- Configuration Visuelle ---
skinparam classAttributeIconSize 0
skinparam nodesep 60
skinparam ranksep 60
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 12

' Définition des couleurs verte épurée
skinparam class {
    BackgroundColor #FFFFFF
    BorderColor #2E7D32
    HeaderBackgroundColor #43A047
    HeaderFontColor #FFFFFF
}

package "Gestion des Comptes & Profils" #F3E5F5 {
  class Utilisateur {
    +ID id
    +String nomUtilisateur
    +String email
    +String role
  }

  class Affilié {
    +ID id
    +String numAffilié
    +String cin
    +String nom
    +String prenom
    +String statut
    +Date dateAdhesion
  }

  class Administrateur {
    +ID id
    +String matricule
    +String nom
    +String prenom
    +String departement
  }
}

package "Gestion des Cotisations & Points" #E1F5FE {
  class Cotisation {
    +ID id
    +String periode
    +Double salaireMensuel
    +Double partSalariale
    +Double partPatronale
  }

  class AchatPoints {
    +ID id
    +Double montantVerse
    +Double pointsAcquis
    +String referenceVirement
    +String statut
    +Date dateAchat
  }

  class LivretPoints {
    +ID id
    +String periode
    +Double pointsAcquis
    +Date dateAttribution
  }
}

package "Gestion des Prestations (Retraite)" #FFF3E0 {
  class DemandeLiquidation {
    +ID id
    +Date dateDemande
    +String typeRetraite
    +Double totalPoints
    +Double pensionCalculee
    +String statut
  }

  class PensionRetraite {
    +ID id
    +Double montantMensuel
    +Date dateDebut
    +String statut
    +String rib
  }

  class Versement {
    +ID id
    +Double montantVerse
    +Date datePaiement
    +String reference
    +String statut
  }
}

package "Gestion de la Réversion" #E0F2F1 {
  class DossierReversion {
    +ID id
    +String beneficiaireNom
    +String lienParente
    +Double quotePart
    +String statut
  }
}

' --- Relations de Profils & Comptes ---
Utilisateur "1" --> "0..1" Affilié : "Est lié au profil"
Utilisateur "1" --> "0..1" Administrateur : "Est lié au profil"

' --- Relations Métiers de l'Affilié ---
Affilié "1" *-- "*" Cotisation : "Effectue"
Affilié "1" *-- "*" AchatPoints : "Demande"
Affilié "1" *-- "*" LivretPoints : "Possède"
Affilié "1" --> "0..1" DemandeLiquidation : "Formule"
Affilié "1" --> "0..1" PensionRetraite : "Reçoit"
PensionRetraite "1" *-- "*" Versement : "Génère"
Affilié "1" --> "*" DossierReversion : "Bénéficie de (ayants droit)"

' --- Relations de Validation de l'Administrateur ---
Administrateur "1" --> "*" AchatPoints : "Valide / Rejette"
Administrateur "1" --> "*" DemandeLiquidation : "Examine & Traite"
Administrateur "1" --> "*" DossierReversion : "Décide sur"

@enduml
```
