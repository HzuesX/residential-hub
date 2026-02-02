# Residential Community Hub - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment](#vps-deployment)
5. [SSL Configuration](#ssl-configuration)
6. [Domain Configuration](#domain-configuration)
7. [Monitoring](#monitoring)
8. [Backup Strategy](#backup-strategy)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB |
| Storage | 50 GB SSD | 100+ GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 100 Mbps | 1 Gbps |

### Required Software

- Docker 24.0+
- Docker Compose 2.20+
- Nginx 1.24+
- Git

### Domain Requirements

- Main domain: `yourdomain.com`
- API subdomain: `api.yourdomain.com`
- Optional: Tenant subdomains `*.yourdomain.com`

---

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply changes
sudo reboot
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/residential-hub
cd /opt/residential-hub

# Clone repository
sudo git clone https://github.com/iprincekumark/residential-community-hub.git .

# Set permissions
sudo chown -R $USER:$USER /opt/residential-hub
```

### 3. Configure Environment Variables

```bash
cd /opt/residential-hub/docker

# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

Required environment variables:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=residentialhub
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=princevrse@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## Docker Deployment

### 1. Build and Start Services

```bash
cd /opt/residential-hub/docker

# Build all services
docker-compose build

# Start in background
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Verify Services

```bash
# Check Eureka Server
curl http://localhost:8761/actuator/health

# Check API Gateway
curl http://localhost:8080/actuator/health

# Check User Service
curl http://localhost:8081/actuator/health
```

### 3. Database Migration

```bash
# Run Flyway migrations
docker-compose exec user-service ./mvnw flyway:migrate
```

---

## VPS Deployment

### 1. Nginx Configuration

Create `/etc/nginx/sites-available/residential-hub`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static files
    location / {
        root /opt/residential-hub/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if frontend needs direct API access)
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Gateway
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/residential-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. SSL Configuration

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### 3. Firewall Configuration

```bash
# Allow required ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8761/tcp    # Eureka (internal)
sudo ufw allow 8080/tcp    # API Gateway (internal)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Domain Configuration

### DNS Records

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| CNAME | * | yourdomain.com | 3600 |

### Wildcard SSL (for tenant subdomains)

```bash
# Obtain wildcard certificate
sudo certbot certonly --manual --preferred-challenges=dns \
  -d yourdomain.com -d *.yourdomain.com
```

---

## Monitoring

### 1. Docker Monitoring

```bash
# Install cAdvisor for container monitoring
docker run -d \
  --name=cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8081:8080 \
  google/cadvisor:latest
```

### 2. Application Metrics

Access actuator endpoints:
- Health: `https://api.yourdomain.com/actuator/health`
- Metrics: `https://api.yourdomain.com/actuator/metrics`
- Prometheus: `https://api.yourdomain.com/actuator/prometheus`

### 3. Log Aggregation

```bash
# View service logs
docker-compose logs -f --tail=100 user-service

# Search logs
docker-compose logs | grep ERROR
```

---

## Backup Strategy

### 1. Database Backup

Create backup script `/opt/residential-hub/scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backups"
DB_NAME="residentialhub"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup Redis
docker-compose exec -T redis redis-cli BGSAVE

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

Make executable and schedule:

```bash
chmod +x /opt/residential-hub/scripts/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/residential-hub/scripts/backup.sh" | sudo crontab -
```

### 2. File Backup

```bash
# Backup uploads and configuration
sudo tar -czf /opt/backups/files_$(date +%Y%m%d).tar.gz \
  /opt/residential-hub/docker/.env \
  /opt/residential-hub/frontend/dist
```

---

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
# Test database connection
docker-compose exec postgres psql -U postgres -d residentialhub -c "SELECT 1;"

# Check connection pool
docker-compose exec user-service ./mvnw spring-boot:run -Dspring-boot.run.arguments="--debug"
```

#### 3. Memory Issues

```bash
# Check memory usage
free -h

# Add swap space if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Health Check Commands

```bash
# Check all services
docker-compose ps

# Check Eureka registrations
curl http://localhost:8761/eureka/apps

# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/users/me
```

---

## Update Deployment

### Rolling Update

```bash
cd /opt/residential-hub

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
```

### Database Migration

```bash
# Backup first
/opt/residential-hub/scripts/backup.sh

# Run migrations
docker-compose exec user-service ./mvnw flyway:migrate
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (UFW)
- [ ] Configure SSL/TLS
- [ ] Set up fail2ban
- [ ] Disable root SSH login
- [ ] Use SSH keys only
- [ ] Regular security updates
- [ ] Database backups encrypted
- [ ] Environment variables secured
- [ ] API rate limiting enabled

---

## Support

For deployment support:
- Email: princevrse@gmail.com
- Twitter: [@iprincekumark](https://x.com/iprincekumark)
