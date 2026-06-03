# Codes PlantUML des 6 Diagrammes de Séquence Clés — Projet CIMR

Ce document regroupe les codes PlantUML complets pour documenter l'architecture microservices de votre projet CIMR. 

---

## 1. Authentification & Routage Gateway (Sécurité JWT)

Ce diagramme montre comment un utilisateur obtient son jeton JWT auprès d' `auth-service` et l'utilise pour accéder aux endpoints protégés via `api-gateway`.

```plantuml
@startuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam NoteBackgroundColor #FFF9C4
skinparam NoteBorderColor #FBC02D
skinparam SequenceLifeLineBorderColor #0D47A1
skinparam SequenceLifeLineBackgroundColor #90CAF9
skinparam ArrowColor #1565C0
skinparam ActorBorderColor #0D47A1
skinparam ActorBackgroundColor #E3F2FD

skinparam participant {
    BackgroundColor #E3F2FD
    BorderColor #0D47A1
}
skinparam database {
    BackgroundColor #E8F5E9
    BorderColor #2E7D32
}

autonumber
actor "Utilisateur (Affilié/Admin)" as User
participant "React Frontend" as Front
participant "API Gateway (8080)" as Gateway
participant "Auth Service (8079)" as Auth
database "Postgres (Auth DB)" as DB

== Phase de Connexion (Login) ==

User -> Front: Saisit identifiants (ex: login, password)
activate Front
Front -> Gateway: POST /api/auth/login
activate Gateway
Gateway -> Auth: Route vers /auth/login
activate Auth
Auth -> DB: Vérifie l'utilisateur & mot de passe hashé
activate DB
DB --> Auth: Utilisateur valide (rôles & infos)
deactivate DB
Auth -> Auth: Génère le token JWT (Signé, expire dans 24h)
Auth --> Gateway: 200 OK + JWT Token + Infos Rôle
deactivate Auth
Gateway --> Front: Retourne Token + Profil
deactivate Gateway
Front -> Front: Stocke le JWT dans LocalStorage / State
Front --> User: Affiche le Tableau de bord adapté au rôle
deactivate Front

== Requête Autorisée ultérieure (Accès ressource protégée) ==

User -> Front: Demande à consulter son livret
activate Front
Front -> Gateway: GET /api/contributions/livret (Headers: Authorization Bearer <JWT>)
activate Gateway
Gateway -> Gateway: Intercepte la requête & Extrait le JWT
Gateway -> Gateway: Valide la signature et l'expiration du JWT
alt JWT Invalide ou Expiré
    Gateway --> Front: 401 Unauthorized
    Front --> User: Redirige vers la page de login
else JWT Valide
    Gateway -> Gateway: Extrait le rôle et l'injecte dans les headers de route
    Gateway -> Contrib: Transmet GET /contributions/livret (Header: X-User-Role=ROLE_AFFILIE)
    activate Contrib
    Contrib -> Contrib: Traite la requête
    Contrib --> Gateway: 200 OK (Données du livret)
    deactivate Contrib
    Gateway --> Front: Données JSON
    Front --> User: Affiche le livret de retraite
end
deactivate Gateway
deactivate Front
@enduml
```

---

## 2. Affiliation & Analyse OCR de la CIN par l'IA (YOLOv8 & FastAPI)

Ce diagramme illustre le flux d'analyse de la carte CIN marocaine via le service IA (FastAPI) lors du processus d'affiliation.

```plantuml
@startuml
skinparam BoxPadding 15
skinparam ParticipantPadding 15
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam ArrowColor #263238
skinparam SequenceLifeLineBorderColor #37474F

skinparam actor {
    BackgroundColor #ECEFF1
    BorderColor #37474F
}
skinparam participant {
    BackgroundColor #E8F5E9
    BorderColor #2E7D32
}
skinparam participant<<AI>> {
    BackgroundColor #F8BBD0
    BorderColor #C2185B
}

autonumber
actor "Affilié / Employeur" as User
participant "React Frontend" as Front
participant "API Gateway (8080)" as Gateway
participant "AI Agent Service (FastAPI:8000)" as AI <<AI>>
participant "Affiliation Service (8081)" as Affil
database "Postgres (Affiliation DB)" as DB

User -> Front: Remplit formulaire + Téléverse Scan CIN (Image/PDF)
activate Front
Front -> Gateway: POST /api/affiliation/register (Form Data)
activate Gateway

== Étape 1 : Analyse automatique par l'IA ==
Gateway -> AI: POST /analyze-id-card (file)
activate AI
note over AI: Exécute YOLOv8 pour détecter la zone CIN\nApplique OCR (EasyOCR/Tesseract) pour extraire :\n- Nom, Prénom, N° CIN, Date de naissance
AI --> Gateway: 200 OK { extractedData: { cin: "AB12345", nom: "Alami"... }, validityScore: 98% }
deactivate AI

== Étape 2 : Traitement de l'Affiliation ==
Gateway -> Affil: POST /affilies (Form Data + ExtractedData)
activate Affil
alt Score IA trop faible (< 70%)
    Affil -> DB: Crée dossier (Statut: A_VERIFIER_MANUELLEMENT)
    activate DB
    DB --> Affil: OK
    deactivate DB
    Affil --> Gateway: Réponse d'attente (Besoin validation manuelle)
    Gateway --> Front: Message: "Document en cours de vérification manuelle"
else Score IA Excellent
    Affil -> DB: Enregistre l'affilié (Statut: ACTIF)
    activate DB
    DB --> Affil: OK
    deactivate DB
    Affil --> Gateway: 201 Created (Affilié Enregistré)
    deactivate Affil
    Gateway --> Front: Succès (Dossier validé automatiquement)
end
deactivate Gateway
Front --> User: Affiche confirmation de réussite
deactivate Front
@enduml
```

---

## 3. Achat de Points & Validation de Preuve

Ce diagramme décrit la soumission manuelle d'une preuve de paiement par l'affilié et sa validation par l'administrateur.

```plantuml
@startuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam NoteBackgroundColor #FFF9C4
skinparam NoteBorderColor #FBC02D
skinparam SequenceLifeLineBorderColor #0D47A1
skinparam SequenceLifeLineBackgroundColor #90CAF9
skinparam ArrowColor #1565C0
skinparam ActorBorderColor #0D47A1
skinparam ActorBackgroundColor #E3F2FD

skinparam participant {
    BackgroundColor #E3F2FD
    BorderColor #0D47A1
}
skinparam database {
    BackgroundColor #E8F5E9
    BorderColor #2E7D32
}

autonumber
actor "Affilié" as Affilie
participant "React Frontend" as Front
participant "API Gateway (8080)" as API
participant "Contribution Service (8082)" as Contrib
database "Postgres DB" as DB
actor "Administrateur" as Admin

== Soumission de la demande par l'Affilié ==
Affilie -> Front: Saisit montant & importe la preuve (PDF)
activate Front
Front -> API: POST /api/contributions/points/purchase (Multipart)
activate API
API -> Contrib: Route vers /points/purchase
activate Contrib
Contrib -> DB: Sauvegarde le document & crée PointsPurchase (Statut: EN_ATTENTE)
activate DB
DB --> Contrib: OK
deactivate DB
Contrib --> API: Achat enregistré (201)
deactivate Contrib
API --> Front: Réponse d'enregistrement
deactivate API
Front --> Affilie: Affiche le succès de l'envoi
deactivate Front

== Phase de Validation Administrative ==
Admin -> Front: Navigue sur "Achats en attente"
activate Front
Front -> API: GET /api/contributions/points/purchase
activate API
API -> Contrib: Route la demande
activate Contrib
Contrib -> DB: Récupère la liste (Statut == EN_ATTENTE)
activate DB
DB --> Contrib: Liste des achats
deactivate DB
Contrib --> API: Liste JSON
deactivate Contrib
API --> Front: Données JSON
deactivate API
Front --> Admin: Affiche la liste des demandes
deactivate Front

Admin -> Front: Visualise la preuve & clique sur "Valider"
activate Front
Front -> API: PUT /api/contributions/points/purchase/{id}/validate
activate API
API -> Contrib: Route vers validation
activate Contrib
Contrib -> DB: Met à jour statut = VALIDE
activate DB
Contrib -> DB: Crée PointsLedger (crédit des points associés)
DB --> Contrib: OK
deactivate DB
Contrib --> API: Achat validé avec succès
deactivate Contrib
API --> Front: 200 OK
deactivate API
Front --> Admin: Notification succès et mise à jour de la table
deactivate Front
@enduml
```

---

## 4. Orchestration SAGA pour la Liquidation de Pension (Kafka)

Ce diagramme illustre le traitement complexe d'une demande de départ en retraite en utilisant Kafka et un orchestrateur de transactions distribuées SAGA.

```plantuml
@startuml
skinparam BoxPadding 15
skinparam ParticipantPadding 15
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam ArrowColor #E65100
skinparam SequenceLifeLineBorderColor #E65100
skinparam SequenceLifeLineBackgroundColor #FFE0B2

skinparam participant {
    BackgroundColor #FFF3E0
    BorderColor #E65100
}
skinparam queue {
    BackgroundColor #E1BEE7
    BorderColor #8E24AA
}

autonumber
actor "Affilié (Futur Retraité)" as User
participant "Liquidation Service (8083)" as Liq
participant "Saga Orchestrator" as Saga
queue "Kafka Topic: liquidation-events" as Kafka
participant "Contribution Service (8082)" as Contrib
participant "Payment Service (8084)" as Pay

User -> Liq: Soumet demande de liquidation (retraite)
activate Liq
Liq -> Liq: Valide les conditions d'âge
Liq -> Saga: Démarre la SAGA de Liquidation
activate Saga

== Étape 1 : Récupération des Points ==
Saga -> Kafka: Publie événement [GetPointsRequestEvent]
activate Kafka
deactivate Kafka
Kafka -> Contrib: Consomme [GetPointsRequestEvent]
activate Contrib
Contrib -> Contrib: Calcule le cumul exact des points acquis
Contrib -> Kafka: Publie réponse [GetPointsResponseEvent] (ex: 5200 points)
deactivate Contrib
Kafka -> Saga: Consomme [GetPointsResponseEvent]

== Étape 2 : Calcul et Initialisation Pension ==
Saga -> Saga: Calcule le montant de la pension mensuelle\n(points * valeur_point_actuelle)
Saga -> Kafka: Publie événement [CreateAllocationRequestEvent] (Montant: 4500 DH)
activate Kafka
deactivate Kafka
Kafka -> Pay: Consomme [CreateAllocationRequestEvent]
activate Pay
Pay -> Pay: Enregistre le dossier de paiement mensuel récurrent
Pay -> Kafka: Publie réponse [CreateAllocationResponseEvent] (SUCCÈS)
deactivate Pay
Kafka -> Saga: Consomme [CreateAllocationResponseEvent]

== Étape 3 : Finalisation de la SAGA ==
alt Succès Global de la SAGA
    Saga -> Liq: Confirme la validation finale de la liquidation
    Liq --> User: 200 OK (Demande acceptée, premier paiement prévu le 1er du mois)
else Échec ou Annulation (Transaction de Compensation)
    Saga -> Kafka: Publie événement de compensation [CancelAllocationRequestEvent]
    Saga -> Liq: Notifie l'échec de la liquidation
    Liq --> User: 400 Bad Request / Notification d'échec
end
deactivate Saga
deactivate Liq
@enduml
```

---

## 5. Réversion de Pension (Ayants Droit & Loi 64-12)

Ce diagramme représente la demande de transfert de pension suite au décès de l'affilié vers son conjoint survivant ou ses orphelins.

```plantuml
@startuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam NoteBackgroundColor #E1F5FE
skinparam NoteBorderColor #0288D1
skinparam SequenceLifeLineBorderColor #006064
skinparam SequenceLifeLineBackgroundColor #B2EBF2
skinparam ArrowColor #006064

skinparam participant {
    BackgroundColor #E0F7FA
    BorderColor #006064
}

autonumber
actor "Ayant Droit (Veuve/Orphelin)" as Beneficiaire
participant "React Frontend" as Front
participant "API Gateway (8080)" as Gateway
participant "Reversion Service (8085)" as Rev
participant "Payment Service (8084)" as Pay
database "Postgres (Reversion DB)" as DB

Beneficiaire -> Front: Soumet demande de réversion + Certificat Décès + Acte de mariage/naissance
activate Front
Front -> Gateway: POST /api/reversions/apply (Multipart)
activate Gateway
Gateway -> Rev: Route la requête vers Reversion Service
activate Rev

== Étape 1 : Vérification des droits et éligibilité ==
Rev -> DB: Vérifie si l'affilié décédé possédait une pension active
activate DB
DB --> Rev: Infos Pension (ex: Pension de base = 6000 DH)
deactivate DB

note over Rev: Calcule la quote-part selon la législation :\n- Conjoint survivant : 50% de la pension\n- Orphelins : Quote-part partagée

Rev -> DB: Enregistre le dossier de Réversion (Statut: VALIDE)
activate DB
DB --> Rev: OK
deactivate DB

== Étape 2 : Mise à jour du Paiement ==
Rev -> Pay: POST /allocations/reversion (Montant calculé, ID Bénéficiaire)
activate Pay
note over Pay: Stoppe la pension de l'affilié décédé\nCrée la nouvelle pension pour l'ayant droit
Pay --> Rev: 201 Created (Nouvelle allocation active)
deactivate Pay

Rev --> Gateway: Réversion traitée & Activée
deactivate Rev
Gateway --> Front: 200 OK
deactivate Gateway
Front --> Beneficiaire: Affiche la confirmation et le montant de la nouvelle pension (Réversion)
deactivate Front
@enduml
```

---

## 6. Flux de Notification et de Logs d'Audit Asynchrones (Kafka)

Ce diagramme explique comment le système trace les activités sensibles et notifie les utilisateurs en arrière-plan sans bloquer les requêtes principales.

```plantuml
@startuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10
skinparam DefaultFontName "Helvetica"
skinparam DefaultFontSize 13
skinparam ArrowColor #37474F
skinparam SequenceLifeLineBorderColor #37474F

skinparam participant {
    BackgroundColor #ECEFF1
    BorderColor #37474F
}
skinparam queue {
    BackgroundColor #FFF9C4
    BorderColor #FBC02D
}

autonumber
actor "Utilisateur" as User
participant "Contribution Service" as Contrib
queue "Kafka: audit-notifications-topic" as Kafka
participant "Admin Service (8086)" as Admin
database "Postgres (Audit Log DB)" as DB
participant "Serveur SMTP / Mail" as Mail

User -> Contrib: Déclare ou paye sa cotisation
activate Contrib
Contrib -> Contrib: Traite le paiement localement
Contrib -> Kafka: Publie événement [ContributionValidatedEvent] (Infos: Affilié, Montant, Date)
Contrib --> User: Retourne succès immédiat (Expérience fluide)
deactivate Contrib

== Traitement Asynchrone en Arrière-plan ==
activate Kafka
deactivate Kafka
Kafka -> Admin: Consomme l'événement [ContributionValidatedEvent]
activate Admin

par Parallélisme : Notification & Audit
    
    ' Branche Audit Log
    Admin -> DB: Insère la ligne d'audit (Historique de sécurité non modifiable)
    activate DB
    DB --> Admin: OK
    deactivate DB
    
    ' Branche Notification Mail
    Admin -> Mail: Envoie la requête d'expédition de mail
    activate Mail
    Mail -> User: Reçoit l'email "Confirmation de cotisation et calcul de vos points"
    deactivate Mail
    
end

deactivate Admin
@enduml
```
