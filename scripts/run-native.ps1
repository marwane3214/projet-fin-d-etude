# Script de lancement NATIF pour le projet Portail CIMR
# Ce script lance tous les microservices sur Windows directement, sans Docker.

$ROOT        = Split-Path $PSScriptRoot -Parent
$BACKEND     = "$ROOT\backend"
$DB_URL_BASE = "jdbc:postgresql://localhost:5435/"
$KAFKA       = "localhost:9092"
$MVN         = "$ROOT\tools\apache-maven-3.9.6\bin\mvn.cmd"

# 1. Tuer les anciens processus Java s'ils existent
# Stop-Process -Name "java" -ErrorAction SilentlyContinue

Write-Host "--- Lancement de l'infrastructure Docker (DB, Kafka) ---"
docker compose up -d

Write-Host "--- Attente des bases de données (5 sec) ---"
Start-Sleep -s 5

Write-Host "--- Lancement des microservices Java ---"

# Liste des services et leurs ports
$services = @(
    @{"name"="auth-service";         "port"=8079; "db"="cimr_auth"},
    @{"name"="affiliation-service";  "port"=8081; "db"="cimr_affiliation"},
    @{"name"="contribution-service"; "port"=8082; "db"="cimr_contributions"},
    @{"name"="liquidation-service";  "port"=8083; "db"="cimr_liquidation"},
    @{"name"="payment-service";      "port"=8084; "db"="cimr_payments"},
    @{"name"="reversion-service";    "port"=8085; "db"="cimr_reversion"},
    @{"name"="admin-service";        "port"=8086; "db"="cimr_admin"},
    @{"name"="saga-orchestrator";    "port"=8087; "db"=""}
)

foreach ($s in $services) {
    Write-Host "Lancement de $($s.name)..."
    $env:SPRING_DATASOURCE_URL      = "$($DB_URL_BASE)$($s.db)"
    $env:SPRING_DATASOURCE_USERNAME = "cimr"
    $env:SPRING_DATASOURCE_PASSWORD = "cimr_secret_2024"
    $env:SPRING_KAFKA_BOOTSTRAP_SERVERS = $KAFKA
    $env:SERVER_PORT = $s.port

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BACKEND\$($s.name)'; & '$MVN' spring-boot:run"
    Start-Sleep -s 2
}

Write-Host "--- Lancement de l'API Gateway ---"
$env:AUTH_SERVICE_URL         = "http://localhost:8079"
$env:AFFILIATION_SERVICE_URL  = "http://localhost:8081"
$env:CONTRIBUTION_SERVICE_URL = "http://localhost:8082"
$env:LIQUIDATION_SERVICE_URL  = "http://localhost:8083"
$env:PAYMENT_SERVICE_URL      = "http://localhost:8084"
$env:REVERSION_SERVICE_URL    = "http://localhost:8085"
$env:ADMIN_SERVICE_URL        = "http://localhost:8086"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BACKEND\api-gateway'; & '$MVN' spring-boot:run"

Write-Host ""
Write-Host "TOUT EST LANCE !"
Write-Host "1. Vos services tournent dans des fenetres separees."
Write-Host "2. Votre Frontend : cd frontend && npm run dev"
Write-Host "3. Votre IA       : cd backend/ai-agent-service && python app.py"
