FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/audit-service-2.0.0.jar app.jar

EXPOSE 8086

ENTRYPOINT ["java", "-jar", "app.jar"]
