# CIMR — Caisse Interprofessionnelle Marocaine de Retraite

> Système microservices de gestion de retraite — Portail affiliés & administration.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Java 17 · Spring Boot 3.2 · Spring Cloud Gateway |
| Frontend | React 18 · TypeScript · Vite |
| IA | Python · FastAPI · YOLOv8 (vérification CIN) |
| Base de données | PostgreSQL 15 (1 DB par service) |
| Messaging | Apache Kafka |
| Auth | JWT + RBAC (ROLE_ADMIN / ROLE_AFFILIE) |
| Conteneurs | Docker Compose |

## Démarrage rapide

```bash
# 1. Compiler tous les microservices Java
cd backend
mvn clean package -DskipTests

# 2. Lancer toute la stack (DB + Kafka + services)
docker compose up -d          # depuis la racine du projet

# 3. Lancer le frontend
cd frontend && npm install && npm run dev

# 4. (Optionnel) Lancer le service IA en natif
cd backend/ai-agent-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Points d'accès

| Composant | URL |
|-----------|-----|
| Portail Web | http://localhost:5173 (ou 5174) |
| API Gateway | http://localhost:8080 |
| Contributions API | http://localhost:8082/swagger-ui.html |
| Payments API | http://localhost:8084/swagger-ui.html |
| Reversions API | http://localhost:8085/swagger-ui.html |
| Admin API | http://localhost:8086/swagger-ui.html |
| Service IA | http://localhost:8000 |

## Comptes par défaut

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Administrateur | `TECHMAROC.ADMIN` | `admin2024` |
| Affilié | `MOHAMED.ALAMI` | `cimr2024` |

## Structure du projet

```
projet-fin-d-etude-main/
├── backend/                        # Tous les microservices
│   ├── pom.xml                     # POM parent Maven
│   ├── auth-service/               # Authentification JWT
│   ├── api-gateway/                # Spring Cloud Gateway (port 8080)
│   ├── affiliation-service/        # Gestion affiliés (port 8081)
│   ├── contribution-service/       # Cotisations & points (port 8082)
│   ├── liquidation-service/        # Demandes liquidation (port 8083)
│   ├── payment-service/            # Paiements & allocations (port 8084)
│   ├── reversion-service/          # Reversions (port 8085)
│   ├── admin-service/              # Notifications & audit (port 8086)
│   ├── saga-orchestrator/          # Orchestration saga Kafka
│   └── ai-agent-service/           # FastAPI · OCR CIN · YOLOv8 (port 8000)
├── frontend/                       # Application React/TypeScript
│   ├── src/
│   │   ├── api/                    # Clients HTTP (axios)
│   │   ├── components/             # Composants réutilisables
│   │   ├── contexts/               # Auth & Notifications
│   │   └── pages/                  # Pages par domaine métier
│   └── vite.config.ts
├── infra/
│   └── init-multiple-dbs.sh        # Init PostgreSQL multi-databases
├── k8s/                            # Manifestes Kubernetes
├── scripts/
│   ├── clean-start.ps1             # Rebuild + relance Docker
│   ├── rebuild-fast.ps1            # Compilation Maven rapide
│   ├── run-native.ps1              # Lancement natif (sans Docker)
│   └── start-ai.bat                # Lance le service IA
├── tools/                          # Maven local (apache-maven-3.9.6)
├── Dockerfile                      # Multi-stage build
├── docker-compose.yml
└── .env                            # Variables mail et frontend URL
```

## Microservices

### auth-service
JWT + RBAC. Initialisation des comptes par défaut au démarrage.

### api-gateway
Spring Cloud Gateway — point d'entrée unique, CORS configuré.

### affiliation-service
Gestion des affiliés, adhérents, et documents RH.

### contribution-service
Cotisations mensuelles, calcul de points, livrets PDF.

### liquidation-service
Demandes de liquidation (retraite normale, anticipée, invalidité).

### payment-service
Allocations et suivi des paiements.

### reversion-service
Reversions pension pour ayants droit.

### admin-service
Notifications en temps réel, logs d'audit, tickets support, emails.

### ai-agent-service (FastAPI)
Vérification d'identité par OCR sur CIN marocaine (YOLOv8).

## Conformité légale

- **Loi 64-12** : Réglementation des caisses de retraite
- **Loi 09-08 (CNDP)** : Protection des données personnelles

## Licence

Propriétaire — Usage interne CIMR uniquement.
