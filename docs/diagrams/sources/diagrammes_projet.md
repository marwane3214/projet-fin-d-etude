# Diagrammes UML pour le Projet CIMR

Voici les diagrammes représentant l'architecture globale, les données et les interactions de votre système de gestion CIMR. Ils sont générés avec la syntaxe PlantUML.

## 1. Diagramme de Cas d'Utilisation

*Ce diagramme illustre les principales interactions entre les acteurs (Affilié et Administrateur) et le système.*

```plantuml
@startuml
left to right direction
actor "Affilié" as Affilie
actor "Administrateur" as Admin

rectangle "Système CIMR" {
  usecase "S'authentifier" as Auth
  
  usecase "Gérer son profil" as UC1
  usecase "Consulter le tableau de bord et les points" as UC2
  usecase "Acheter des points (dépôt de justificatif)" as UC3
  usecase "Demander une prestation de retraite" as UC4
  usecase "Consulter l'historique des cotisations" as UC5
  usecase "Simuler sa Pension exacte" as UC10
  usecase "Interagir avec l'Assistant IA" as UC11
  
  usecase "Mettre à jour la Valeur du Point" as UC6
  usecase "Valider/Rejeter les achats de points" as UC7
  usecase "Traiter les dossiers de liquidation" as UC8
  usecase "Gérer les affiliés" as UC9
  
  ' Dépendance d'authentification (Include)
  UC1 ..> Auth : <<include>>
  UC2 ..> Auth : <<include>>
  UC3 ..> Auth : <<include>>
  UC4 ..> Auth : <<include>>
  UC5 ..> Auth : <<include>>
  UC10 ..> Auth : <<include>>
  UC11 ..> Auth : <<include>>
  
  UC6 ..> Auth : <<include>>
  UC7 ..> Auth : <<include>>
  UC8 ..> Auth : <<include>>
  UC9 ..> Auth : <<include>>
}

' L'utilisateur interagit avec le système pour s'authentifier directement s'il le souhaite
Affilie -- Auth
Admin -- Auth

' Actions spécifiques de l'Affilié
Affilie -- UC1
Affilie -- UC2
Affilie -- UC3
Affilie -- UC4
Affilie -- UC5
Affilie -- UC10
Affilie -- UC11

' Actions spécifiques de l'Administrateur
Admin -- UC6
Admin -- UC7
Admin -- UC8
Admin -- UC9
@enduml
```

---

## 2. Diagramme de Classes (Modèle de Domaine Simplifié)

*Ce diagramme représente les entités métiers principales liées aux cotisations et à l'acquisition de points, correspondant à ce que nous avons configuré dans le backend.*

```plantuml
@startuml
class User {
  +UUID id
  +String username
  +UUID affilieId
  +String role
  +String email
}

class Contribution {
  +UUID id
  +UUID affilieId
  +String periode
  +BigDecimal salaireMensuel
  +BigDecimal contributionSalariale
  +BigDecimal contributionPatronale
  +String typeService
}

class PointsPurchase {
  +UUID id
  +UUID affilieId
  +String affilieNom
  +Double pointsGranted
  +BigDecimal montantVerse
  +String referenceVirement
  +String preuvePath
  +String statut
  +LocalDateTime dateAchat
  +validate()
  +reject(motif)
}

class PointsLedger {
  +UUID id
  +UUID affilieId
  +String periode
  +Double pointsAcquis
  +LocalDateTime dateAttribution
}

class PointValue {
  +Integer year
  +BigDecimal value
}

User "1" --> "*" PointsLedger : Détient
User "1" --> "*" Contribution : Effectue
User "1" --> "*" PointsPurchase : Sollicite
@enduml
```

---

## 3. Diagramme de Séquence (Achat et Validation de Points)

*Ce diagramme retrace le flux étape par étape lorsqu'un Affilié décide d'acheter des points supplémentaires via un virement bancaire, jusqu'à l'approbation de l'Administrateur.*

```plantuml
@startuml
autonumber
actor "Affilié" as Affilie
participant "Frontend React" as Front
participant "API Gateway (8080)" as API
participant "Contribution Service" as Contrib
database "Postgres DB (cimr_contributions)" as DB
actor "Administrateur" as Admin

== Demande par l'affilié ==
Affilie -> Front: Saisit montant et importe la preuve (PDF/Image)
Front -> API: POST /api/contributions/points/purchase (Multipart)
API -> Contrib: Route la requête vers le microservice
Contrib -> DB: Sauvegarde le document & crée PointsPurchase (Statut: EN_ATTENTE)
Contrib -->> Front: Retourne l'achat enregistré
Front -->> Affilie: Affiche le succès de l'envoi

== Phase d'Administration ==
note over Admin, DB: Phase d'Administration

Admin -> Front: Navigue sur la liste des achats
Front -> API: GET /api/contributions/points/purchase
API -> Contrib: Route la demande
Contrib -> DB: Récupère la liste des demandes
DB -->> Contrib: Liste des achats
Contrib -->> Front: Retourne les données JSON
Admin -> Front: Visualise la preuve et clique sur "Valider" (ID)
Front -> API: PUT /api/contributions/points/purchase/{id}/validate
API -> Contrib: Route vers endpoint de validation
Contrib -> DB: Met à jour statut = VALIDE
Contrib -> DB: Insert PointsLedger (Transfert des points acquis)
Contrib -->> Front: Retourne l'achat validé
Front -->> Admin: Affiche message succès
@enduml
```
