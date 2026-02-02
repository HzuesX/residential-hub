FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/api-gateway-2.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
