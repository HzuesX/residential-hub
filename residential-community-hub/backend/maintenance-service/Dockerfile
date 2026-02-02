FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/maintenance-service-2.0.0.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
