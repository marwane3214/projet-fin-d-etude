# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY auth-service/pom.xml auth-service/
COPY api-gateway/pom.xml api-gateway/
COPY affiliation-service/pom.xml affiliation-service/
COPY contribution-service/pom.xml contribution-service/
COPY liquidation-service/pom.xml liquidation-service/
COPY payment-service/pom.xml payment-service/
COPY reversion-service/pom.xml reversion-service/
COPY admin-service/pom.xml admin-service/
COPY saga-orchestrator/pom.xml saga-orchestrator/

RUN mvn -pl contribution-service -am dependency:go-offline
COPY contribution-service/src contribution-service/src
RUN mvn -pl contribution-service -DskipTests clean package

# Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/contribution-service/target/*.jar app.jar
ENTRYPOINT ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
