# CIMR — Caisse Interprofessionnelle Marocaine de Retraite

> Production-grade microservices system for pension fund management.

## Architecture

- **Backend**: Java 17 + Spring Boot 3.2
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL 15 (per-service ownership)
- **Eventing**: Apache Kafka
- **Queue**: Redis
- **Auth**: OAuth2 / JWT + RBAC
- **Containers**: Docker + Kubernetes

## Quick Start (Docker Compose)

```bash
# 1. Clone the repository
git clone <repo-url> && cd ProjetFinEtude

# 2. Build all services
mvn clean package -DskipTests

# 3. Start infrastructure + all services
docker-compose up -d

# 4. Start the React frontend
cd cimr-frontend && npm install && npm run dev
```

### Access Points

| Component | URL |
|-----------|-----|
| React UI | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Affiliation API | http://localhost:8081/swagger-ui.html |
| Contribution API | http://localhost:8082/swagger-ui.html |
| Liquidation API | http://localhost:8083/swagger-ui.html |
| Payment API | http://localhost:8084/swagger-ui.html |
| Kafka UI | http://localhost:8090 |
| pgAdmin | http://localhost:5050 |

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@cimr.ma | admin123 |
| Affilié | affilie@test.ma | test123 |

## Project Structure

```
ProjetFinEtude/
├── docker-compose.yml          # Full stack orchestration
├── pom.xml                     # Parent Maven POM
├── affiliation-service/        # Affilié & Adhérent management
├── contribution-service/       # Cotisations & Points
├── liquidation-service/        # Liquidation requests & processing
├── payment-service/            # Allocations & Payments
├── auth-service/               # OAuth2/JWT Authentication
├── api-gateway/                # Spring Cloud Gateway
├── saga-orchestrator/          # Saga pattern orchestration
├── cimr-frontend/              # React SPA
├── k8s/                        # Kubernetes manifests
├── postman/                    # Postman collection
└── docs/                       # Documentation
```

## Microservices

### 1. Affiliation Service (Port 8081)
Manages affiliés, adhérents (enterprises), and their relationships.
- CIMR Article: Registration of employees (Art. 6-12)

### 2. Contribution Service (Port 8082)
Records cotisations and calculates retirement points.
- CIMR Article: Contribution rules (Art. 13-20)

### 3. Liquidation Service (Port 8083)
Handles pension liquidation requests and document validation.
- CIMR Article: Liquidation conditions (Art. 21-30)

### 4. Payment Service (Port 8084)
Manages allocation schedules and payment processing.
- CIMR Article: Payment of pensions (Art. 31-38)


## Legal Compliance

- **Law 64-12**: Pension fund regulation
- **Law 09-08 (CNDP)**: Data protection and privacy
  - Consent management ✓
  - Right to access ✓
  - Right to rectification ✓
  - Right to deletion/anonymization ✓
  - PII redaction in logs ✓

## CI/CD

GitHub Actions pipeline:
1. Build → Test → Package
2. Docker image build & push
3. DB migration (Flyway)
4. Deploy to Kubernetes

## License

Proprietary — CIMR Internal Use Only
