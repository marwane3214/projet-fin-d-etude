FROM eclipse-temurin:17-jre-alpine AS auth-service
WORKDIR /app
COPY auth-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS api-gateway
WORKDIR /app
COPY api-gateway/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS affiliation-service
WORKDIR /app
COPY affiliation-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS contribution-service
WORKDIR /app
COPY contribution-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS liquidation-service
WORKDIR /app
COPY liquidation-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS payment-service
WORKDIR /app
COPY payment-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS reversion-service
WORKDIR /app
COPY reversion-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM maven:3.9-eclipse-temurin-17-alpine AS admin-service-build
WORKDIR /build
COPY pom.xml .
COPY auth-service/pom.xml auth-service/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY affiliation-service/pom.xml affiliation-service/pom.xml
COPY contribution-service/pom.xml contribution-service/pom.xml
COPY liquidation-service/pom.xml liquidation-service/pom.xml
COPY payment-service/pom.xml payment-service/pom.xml
COPY reversion-service/pom.xml reversion-service/pom.xml
COPY admin-service/pom.xml admin-service/pom.xml
COPY saga-orchestrator/pom.xml saga-orchestrator/pom.xml
COPY admin-service/src admin-service/src
RUN mvn clean package -pl admin-service -DskipTests -q

FROM eclipse-temurin:17-jre-alpine AS admin-service
WORKDIR /app
COPY --from=admin-service-build /build/admin-service/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]

FROM eclipse-temurin:17-jre-alpine AS saga-orchestrator
WORKDIR /app
COPY saga-orchestrator/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
