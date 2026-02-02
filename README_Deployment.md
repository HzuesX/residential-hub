# Residential Community Hub - Deployment Guide

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [VPS Deployment](#vps-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Java 17+ and Maven 3.8+
- PostgreSQL 14+
- Redis 7+
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/iprincekumark/residential-community-hub.git
cd residential-community-hub
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE residential_hub;"
psql -U postgres -c "CREATE USER rch_user WITH PASSWORD 'your_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE residential_hub TO rch_user;"

# Create Redis instance
redis-server --daemonize yes
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd residential-community-hub

# Build the project
mvn clean install

# Start services (in separate terminals)
cd user-service && mvn spring-boot:run
cd visitor-service && mvn spring-boot:run
cd maintenance-service && mvn spring-boot:run
# ... start other services
```

### Step 4: Frontend Setup

```bash
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points

- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761
- H2 Console: http://localhost:8081/h2-console (dev only)

## Production Deployment

### Option 1: VPS Deployment (Recommended)

#### Server Requirements

- Ubuntu 22.04 LTS or CentOS 8
- 4 CPU cores, 8GB RAM minimum
- 50GB SSD storage
- Static IP address

#### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y docker docker-compose nginx certbot python3-certbot-nginx

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

#### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/iprincekumark/residential-community-hub.git
cd residential-community-hub

# Create production environment file
cp docker/.env.example docker/.env
nano docker/.env  # Edit with your values
```

#### Step 3: Environment Variables

Create `.env` file in `docker/` directory:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=residential_hub
DB_USERNAME=rch_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_256_bit_secret_key_here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=rch_admin
RABBITMQ_PASSWORD=your_rabbitmq_password

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Stripe (Payments)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=residential-hub-uploads
AWS_REGION=us-east-1
```

#### Step 4: Deploy with Docker Compose

```bash
cd docker

# Create Docker network
docker network create rch-network

# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify services are running
docker-compose ps
docker-compose logs -f
```

#### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/residential-hub`:

```nginx
upstream api_gateway {
    server localhost:8080;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://api_gateway/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
    }

    # Static files
    location /static/ {
        alias /var/www/residential-hub/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/residential-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: SSL/TLS with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## Docker Deployment

### Production Docker Compose

```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - rch-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - rch-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USERNAME}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - rch-network
    restart: unless-stopped

  # Service Discovery
  eureka-server:
    build:
      context: ../residential-community-hub
      dockerfile: eureka-server/Dockerfile
    ports:
      - "8761:8761"
    networks:
      - rch-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # API Gateway
  api-gateway:
    build:
      context: ../residential-community-hub
      dockerfile: api-gateway/Dockerfile
    ports:
      - "8080:8080"
    environment:
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - rch-network
    restart: unless-stopped

  # Microservices
  user-service:
    build:
      context: ../residential-community-hub
      dockerfile: user-service/Dockerfile
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PASSWORD: ${REDIS_PASSWORD}
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      eureka-server:
        condition: service_healthy
    networks:
      - rch-network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ../app
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    environment:
      VITE_API_URL: http://api-gateway:8080
    networks:
      - rch-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  rch-network:
    external: true
```

### Frontend Dockerfile

```dockerfile
# app/Dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Frontend Nginx Config

```nginx
# app/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

## Environment Configuration

### Development

```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_ENABLE_MOCKS=true
VITE_DEBUG=true
```

### Production

```bash
# .env.production
VITE_API_URL=https://api.your-domain.com
VITE_ENABLE_MOCKS=false
VITE_DEBUG=false
```

## SSL/TLS Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already configured by certbot)
sudo systemctl status certbot.timer
```

### Using Custom SSL Certificate

```bash
# Place certificates in /etc/nginx/ssl/
sudo mkdir -p /etc/nginx/ssl
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-key.pem /etc/nginx/ssl/key.pem

# Update nginx config
sudo nano /etc/nginx/sites-available/residential-hub
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service

# View last 100 lines
docker-compose logs --tail=100 user-service
```

### System Monitoring

```bash
# Install monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# - Prometheus: http://your-domain.com:9090
# - Grafana: http://your-domain.com:3000
# - AlertManager: http://your-domain.com:9093
```

### Health Checks

```bash
# API Gateway health
curl http://localhost:8080/actuator/health

# Service health via Eureka
curl http://localhost:8761/eureka/apps
```

## Backup & Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="residential_hub"

docker exec postgres pg_dump -U rch_user $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Automated Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Restore from Backup

```bash
# Restore database
gunzip < backup_20240101_020000.sql.gz | docker exec -i postgres psql -U rch_user residential_hub
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Verify credentials
docker-compose exec postgres psql -U rch_user -d residential_hub -c "SELECT 1;"
```

#### 3. Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Debug nginx SSL
sudo nginx -t
```

### Performance Tuning

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_visitors_society_id ON visitors(society_id);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_maintenance_society_id ON maintenance_requests(society_id);
CREATE INDEX idx_users_society_id ON users(society_id);
CREATE INDEX idx_announcements_society_id ON announcements(society_id);
```

#### JVM Tuning

```bash
# Add to docker-compose.yml for Java services
environment:
  JAVA_OPTS: "-Xms512m -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication"
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Firewall configured (only 80, 443 open)
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Health checks working
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Documentation updated

## Support

For deployment support:
- Email: princevrse@gmail.com
- Twitter: [@iprincekumark](https://x.com/iprincekumark)
