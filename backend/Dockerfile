# ── Stage 1: build ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache de dependências — só re-baixa se o pom.xml mudar
COPY pom.xml ./
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: run ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S vigisus && adduser -S vigisus -G vigisus
USER vigisus

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
