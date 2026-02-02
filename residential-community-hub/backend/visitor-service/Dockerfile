FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/visitor-service-2.0.0.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
