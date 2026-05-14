# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy the parent pom
COPY pom.xml .

# Copy all module poms to satisfy Maven validation
COPY auth-service/pom.xml auth-service/
COPY api-gateway/pom.xml api-gateway/
COPY affiliation-service/pom.xml affiliation-service/
COPY contribution-service/pom.xml contribution-service/
COPY liquidation-service/pom.xml liquidation-service/
COPY payment-service/pom.xml payment-service/
COPY reversion-service/pom.xml reversion-service/
COPY admin-service/pom.xml admin-service/
COPY saga-orchestrator/pom.xml saga-orchestrator/

# Go offline with dependencies for the specific service
RUN mvn -pl affiliation-service -am dependency:go-offline

# Copy the source code for the specific service
COPY affiliation-service/src affiliation-service/src

# Build the service
RUN mvn -pl affiliation-service -DskipTests clean package

# Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/affiliation-service/target/*.jar app.jar
ENTRYPOINT ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
