FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/social-service-2.0.0.jar app.jar

EXPOSE 8088

ENTRYPOINT ["java", "-jar", "app.jar"]
