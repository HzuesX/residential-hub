# 🏘️ Residential Community Hub

A production-ready, enterprise-grade, multi-tenant SaaS platform for residential community management. Built with Java Spring Boot microservices architecture and React frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

## 🎯 Overview

Residential Community Hub is a comprehensive digital platform that transforms how residential societies operate, communicate, and stay secure. Designed as a multi-tenant SaaS solution, it enables:

- **Project Owners** to manage multiple societies with full platform control
- **Society Admins** to manage their communities efficiently
- **Residents** to access services and connect with their community
- **Security Staff** to manage visitor entry/exit seamlessly

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Refresh token rotation for enhanced security
- Role-Based Access Control (RBAC) with 5 roles:
  - `PROJECT_OWNER` - Full platform control
  - `SOCIETY_ADMIN` - Full society management
  - `SOCIETY_WORKER` - Limited society access
  - `RESIDENT` - Personal community access
  - `SECURITY` - Gate management

### 🏢 Multi-Tenant Architecture
- Strict tenant isolation
- Society-level data separation
- Subscription management with trial periods
- Scalable to handle 1M+ users

### 🚪 Visitor Management
- Real-time visitor registration and approval
- Digital entry passes with QR codes
- Pre-approved visitor lists
- Vehicle tracking
- Entry/exit timestamps
- Host notifications

### 🔧 Maintenance Workflow
- Multi-category request submission
- Priority-based routing (Low, Medium, High, Urgent)
- Status tracking with workflow
- Cost estimation and tracking
- Vendor assignment
- Photo attachments

### 📢 Announcements & Notifications
- Targeted announcements by role
- Category-based filtering
- Priority levels with visual indicators
- Push notifications
- Email alerts
- SMS integration

### 👥 Society Social Network
- Private, society-only social feed
- Posts with images
- Reactions and comments
- Direct messaging
- Profile photos

### 💳 Payments & Billing
- Society-level billing
- Multiple payment types (Maintenance, Utilities, Events)
- Stripe integration
- Subscription management
- Invoice generation

### 📊 Analytics & Reporting
- Real-time dashboards
- Visitor statistics
- Maintenance completion rates
- Payment tracking
- User engagement metrics
- Exportable reports

### 📝 Audit Logging
- Complete audit trail
- User action tracking
- IP address logging
- Data change history

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │  Mobile App │  │   Admin     │             │
│  │   (React)   │  │  (Future)   │  │   Panel     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                    ┌──────▼──────┐
                    │  API Gateway │
                    │   (Nginx)    │
                    │  Rate Limit  │
                    │  Auth Filter │
                    └──────┬──────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                     MICROSERVICES LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  User    │ │ Visitor  │ │Maintenance│ │Notification│         │
│  │ Service  │ │ Service  │ │ Service   │ │  Service   │         │
│  │  :8081   │ │  :8082   │ │  :8083    │ │   :8084    │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│  ┌────┴────────────┴────────────┴────────────┴─────┐           │
│  │         Analytics  Audit  Payment  Social        │           │
│  │         :8085      :8086   :8087     :8088       │           │
│  └──────────────────────────────────────────────────┘           │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │Service Discovery│                          │
│                    │  (Eureka)   │                              │
│                    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │PostgreSQL│ │  Redis   │ │ RabbitMQ │ │   S3     │           │
│  │(Primary) │ │ (Cache)  │ │ (Queue)  │ │(Storage) │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Service Boundaries

| Service | Port | Responsibility |
|---------|------|----------------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | Routing, Auth, Rate Limiting |
| User Service | 8081 | Authentication, User Management, Societies |
| Visitor Service | 8082 | Visitor Management, Entry/Exit |
| Maintenance Service | 8083 | Service Requests, Workflow |
| Notification Service | 8084 | Push, Email, SMS |
| Analytics Service | 8085 | Reporting, Dashboards |
| Audit Service | 8086 | Audit Logging |
| Payment Service | 8087 | Billing, Subscriptions |
| Social Service | 8088 | Posts, Comments, Messages |

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Primary language |
| Spring Boot 3 | Microservices framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Data persistence |
| Spring Cloud Gateway | API Gateway |
| Netflix Eureka | Service Discovery |
| PostgreSQL | Primary database |
| Redis | Caching & sessions |
| RabbitMQ | Message queuing |
| Flyway | Database migrations |
| Docker | Containerization |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| TypeScript | Type-safe development |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| TanStack Query | Server state |
| Zustand | Client state |
| Recharts | Data visualization |

## 📁 Project Structure

```
residential-community-hub/
├── backend/                          # Spring Boot Microservices
│   ├── pom.xml                       # Parent POM
│   ├── eureka-server/               # Service Discovery
│   ├── api-gateway/                 # API Gateway
│   ├── user-service/                # User Management
│   ├── visitor-service/             # Visitor Management
│   ├── maintenance-service/         # Maintenance Requests
│   ├── notification-service/        # Notifications
│   ├── analytics-service/           # Analytics & Reports
│   ├── audit-service/               # Audit Logging
│   ├── payment-service/             # Payments & Billing
│   └── social-service/              # Social Features
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/              # UI Components
│   │   ├── pages/                   # Route Pages
│   │   ├── contexts/                # React Contexts
│   │   ├── hooks/                   # Custom Hooks
│   │   ├── lib/                     # Utilities
│   │   └── types/                   # TypeScript Types
│   ├── public/
│   └── package.json
│
├── database/                         # Database Migrations
│   └── migrations/
│       └── V1__Initial_Schema.sql
│
├── docker/                          # Docker Configuration
│   ├── docker-compose.yml
│   └── .env.example
│
└── docs/                            # Documentation
    ├── README.md
    ├── README_ProjectExplanation.md
    └── README_Deployment.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 20+
- Maven 3.8+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/iprincekumark/residential-community-hub.git
cd residential-community-hub
```

#### 2. Set Up Environment Variables
```bash
cp docker/.env.example docker/.env
# Edit docker/.env with your configuration
```

#### 3. Start Infrastructure Services
```bash
cd docker
docker-compose up -d postgres redis rabbitmq
```

#### 4. Build and Run Backend Services

Start services in order:

```bash
# 1. Eureka Server
cd backend/eureka-server
./mvnw spring-boot:run

# 2. API Gateway
cd ../api-gateway
./mvnw spring-boot:run

# 3. User Service
cd ../user-service
./mvnw spring-boot:run

# 4. Start other services similarly...
```

#### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761

### Demo Credentials

**Project Owner (Super Admin)**
- Username: `iprincekumark`
- Password: `ADMIN@mI5jVTCZn`

## 🔐 Environment Variables

See [docker/.env.example](docker/.env.example) for complete list of environment variables.

Key variables:
- `DB_*` - Database configuration
- `REDIS_*` - Redis configuration
- `JWT_SECRET` - JWT signing secret
- `STRIPE_*` - Payment gateway credentials
- `SMTP_*` - Email configuration

## 📚 API Documentation

API documentation is available via Swagger UI at:
- User Service: http://localhost:8081/swagger-ui.html
- Visitor Service: http://localhost:8082/swagger-ui.html
- (Other services follow same pattern)

### Authentication

All API requests (except login/register) require a Bearer token:

```http
Authorization: Bearer <access_token>
```

### Common Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00"
}
```

## 🚀 Deployment

See [README_Deployment.md](docs/README_Deployment.md) for detailed deployment instructions.

Quick deployment with Docker:

```bash
cd docker
docker-compose up -d
```

## 🔒 Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting with Redis
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secrets management via environment variables
- HTTPS/TLS for all communications

## 👨‍💻 Founder

**Prince** - Full Stack Engineer crafting scalable applications with modern technologies.

- Twitter: [@iprincekumark](https://x.com/iprincekumark)
- Email: princevrse@gmail.com

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for better communities
