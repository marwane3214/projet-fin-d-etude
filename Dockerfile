# Dockerfile optimisé pour l'exécution rapide
# On utilise JRE Alpine (pas JDK) pour des images ~50% plus légères.

FROM eclipse-temurin:17-jre-alpine AS auth-service
WORKDIR /app
COPY auth-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS api-gateway
WORKDIR /app
COPY api-gateway/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS affiliation-service
WORKDIR /app
COPY affiliation-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS contribution-service
WORKDIR /app
COPY contribution-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS liquidation-service
WORKDIR /app
COPY liquidation-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS payment-service
WORKDIR /app
COPY payment-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS reversion-service
WORKDIR /app
COPY reversion-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS admin-service
WORKDIR /app
COPY admin-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre-alpine AS saga-orchestrator
WORKDIR /app
COPY saga-orchestrator/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
