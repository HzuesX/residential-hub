FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/analytics-service-2.0.0.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
