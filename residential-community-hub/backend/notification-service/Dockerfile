FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/notification-service-2.0.0.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
