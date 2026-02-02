FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/eureka-server-2.0.0.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]
