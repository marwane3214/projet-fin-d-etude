# Documentation — Portail CIMR

Ce dossier regroupe toute la documentation du projet de fin d'études.

## Structure

| Dossier | Contenu |
|---|---|
| [`reports/`](reports/) | Rapport PFE (PDF, LaTeX, Markdown) et archives |
| [`diagrams/uml/`](diagrams/uml/) | Diagrammes UML rendus (classe, séquences) en PNG |
| [`diagrams/sources/`](diagrams/sources/) | Sources éditables des diagrammes (`.drawio`, `.puml`, Gantt) |
| [`screenshots/`](screenshots/) | Captures d'écran de l'application |
| [`assets/`](assets/) | Logos (CIMR, EMSI) et logos technologiques |
| [`sample-data/`](sample-data/) | Jeux de données de test (import CSV des contributions) |
| [`architecture-microservices.md`](architecture-microservices.md) | Description du rôle de chaque microservice |

## Le projet en bref

Portail de gestion des retraites **CIMR** — architecture microservices.

- **Backend** : 9 microservices Spring Boot 3.x (Java 21) + PostgreSQL + Apache Kafka
- **Frontend** : React 19 + TypeScript + Vite
- **Service IA** : Python (OCR + assistant) — `backend/ai-agent-service/`
- **Infra** : Docker Compose, manifests Kubernetes (`k8s/`)
