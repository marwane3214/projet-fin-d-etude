# Diagramme de Classes Global & Détaillé — Projet CIMR

Ce document contient le code source PlantUML pour le diagramme de classes global de votre application microservices. Ce diagramme intègre à la fois les contrôleurs REST et les entités du domaine métier de chaque service, ainsi que leurs relations.

---

## Code Source PlantUML

```plantuml
@startuml
' --- Configuration Globale du Diagramme ---
skinparam classAttributeIconSize 0
skinparam nodesep 80
skinparam ranksep 80
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 12

' Style des Paquetages
skinparam package {
    BackgroundColor #FAFAFA
    BorderColor #9E9E9E
    FontSize 14
    FontStyle bold
}

' Style des Classes
skinparam class {
    BackgroundColor #FFFFFF
    BorderColor #1E88E5
    HeaderBackgroundColor #1E88E5
    HeaderFontColor #FFFFFF
    FontSize 12
}

' Styles des contrôleurs (rose/bleu)
skinparam class<<Controller>> {
    BackgroundColor #FCE4EC
    BorderColor #C2185B
    HeaderBackgroundColor #D81B60
}

' Style des tables/entités (vert)
skinparam class<<Entity>> {
    BackgroundColor #E8F5E9
    BorderColor #2E7D32
    HeaderBackgroundColor #43A047
}

' Style pour le service d'IA
skinparam class<<AIService>> {
    BackgroundColor #ECEFF1
    BorderColor #37474F
    HeaderBackgroundColor #546E7A
}

package "Auth Service" #F3E5F5 {
  class AuthController <<Controller>> {
    +login(LoginRequest): ResponseEntity
    +register(RegisterRequest): ResponseEntity
    +validateToken(String): TokenValidation
  }
  
  class User <<Entity>> {
    +UUID id
    +String username
    +String passwordHash
    +String email
    +String role
    +UUID affilieId
  }
}

package "Affiliation Service" #E8F5E9 {
  class AffilieController <<Controller>> {
    +create(CreateAffilieRequest): ResponseEntity
    +updatePersonalInfo(UUID, Map): Affilie
    +getById(UUID): Affilie
    +suspend(UUID): Affilie
  }
  
  class Affilie <<Entity>> {
    +UUID id
    +String numAffilie
    +String cin
    +String nom
    +String prenom
    +String email
    +String telephone
    +String statut
    +LocalDateTime dateAdhesion
  }
}

package "AI Agent Service" #ECEFF1 {
  class AIController <<AIService>> {
    +analyzeIDCard(MultipartFile): Map
    +verifyBankTransfer(MultipartFile): VerificationResult
    +getBotResponse(String): String
  }
}

package "Contribution Service" #E1F5FE {
  class ContributionController <<Controller>> {
    +recordContribution(Contribution): ResponseEntity
    +submitPurchase(UUID, double, double, String, MultipartFile): ResponseEntity
    +validate(UUID): ResponseEntity
    +getLivret(UUID): ResponseEntity
  }
  
  class Contribution <<Entity>> {
    +UUID id
    +UUID affilieId
    +String periode
    +BigDecimal salaireMensuel
    +BigDecimal contributionSalariale
    +BigDecimal contributionPatronale
    +String typeService
  }
  
  class PointsPurchase <<Entity>> {
    +UUID id
    +UUID affilieId
    +String affilieNom
    +Double pointsGranted
    +BigDecimal montantVerse
    +String referenceVirement
    +String preuvePath
    +String statut
    +LocalDateTime dateAchat
  }
  
  class PointsLedger <<Entity>> {
    +UUID id
    +UUID affilieId
    +String periode
    +Double pointsAcquis
    +LocalDateTime dateAttribution
  }
  
  class PointValue <<Entity>> {
    +Integer year
    +BigDecimal value
  }
}

package "Liquidation Service" #FFF3E0 {
  class LiquidationController <<Controller>> {
    +create(DemandeLiquidation): ResponseEntity
    +updateStatus(UUID, String): ResponseEntity
    +calculatePension(UUID): BigDecimal
  }
  
  class DemandeLiquidation <<Entity>> {
    +UUID id
    +UUID affilieId
    +LocalDateTime dateDemande
    +String typeRetraite
    +Double totalPoints
    +BigDecimal pensionCalculee
    +String statut
  }
}

package "Payment Service" #FFE082 {
  class PaymentController <<Controller>> {
    +createAllocation(Allocation): ResponseEntity
    +process(UUID): ResponseEntity
    +getHistory(UUID): List<Paiement>
  }
  
  class Allocation <<Entity>> {
    +UUID id
    +UUID affilieId
    +BigDecimal montantMensuel
    +LocalDate dateDebut
    +String statut
    +String modePaiement
    +String rib
  }
  
  class Paiement <<Entity>> {
    +UUID id
    +UUID allocationId
    +BigDecimal montantVerse
    +LocalDateTime datePaiement
    +String referencePaiement
    +String statut
  }
}

package "Reversion Service" #E0F2F1 {
  class ReversionController <<Controller>> {
    +apply(DossierReversion): ResponseEntity
    +getDossier(UUID): DossierReversion
  }
  
  class DossierReversion <<Entity>> {
    +UUID id
    +UUID affilieDecedeId
    +String beneficiaireNom
    +String lienParente
    +BigDecimal quotePart
    +String statut
    +LocalDateTime dateDemande
  }
}

' --- Relations de Données (Concepts de base de données) ---
User "1" --> "0..1" Affilie : "Représente"
Affilie "1" --> "*" Contribution : "Effectue"
Affilie "1" --> "*" PointsPurchase : "Sollicite"
Affilie "1" --> "*" PointsLedger : "Détient"
Affilie "1" --> "0..1" DemandeLiquidation : "Formule"
Affilie "1" --> "0..1" Allocation : "Reçoit"
Allocation "1" --> "*" Paiement : "Génère"
Affilie "1" --> "*" DossierReversion : "Concerne"

' --- Interactions entre Contrôleurs et Services ---
AffilieController ..> AIController : "Fait analyser la CIN par"
ContributionController ..> AIController : "Fait auditer le virement par"
LiquidationController ..> ContributionController : "Récupère les points de"
LiquidationController ..> PaymentController : "Déclenche la pension dans"
ReversionController ..> PaymentController : "Modifie l'allocation dans"

@enduml
```
