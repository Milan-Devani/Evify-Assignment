# ⚡ Evify - EV Fleet Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_6-brightgreen.svg)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.72-cyan.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, resilient, full-stack Fleet Management Platform tailored for commercial Electric Vehicle (EV) fleets. The repository is cleanly separated into **backend**, **frontend** (React Web Dashboard), and **mobile** (React Native).

---

## 📁 Repository Structure

```
├── backend/                     # Node.js, Express & MongoDB API
│   ├── src/
│   │   ├── config/              # Database (Mongoose) & Winston Logger
│   │   ├── controllers/         # Vehicle, Fleet & Auth Controllers
│   │   ├── middleware/          # ErrorHandler (AppError), Validate & JWT Auth
│   │   ├── models/              # Vehicle & Fleet Mongoose Models
│   │   ├── routes/              # Express Routes with express-validator
│   │   ├── seeds/               # Database seed script (seed.js)
│   │   ├── lambda.js            # AWS Serverless Lambda handler
│   │   └── server.js            # Express server entry point
│   ├── tests/                   # Jest Unit & Supertest Integration Tests
│   ├── .env.example / .env      # Environment configuration
│   ├── deploy.sh                # Ubuntu EC2 deployment script
│   ├── user-data.sh             # AWS EC2 User-Data bootstrap script
│   ├── serverless.yml           # AWS Lambda configuration
│   └── package.json             # Backend dependencies & test scripts
│
├── frontend/                    # React Web Dashboard (Single Page App)
│   ├── public/                  # HTML template & icons
│   ├── src/
│   │   ├── components/          # Login, Navbar, VehicleList, Modals, Badges
│   │   ├── context/             # AuthContext with token persistence
│   │   ├── services/            # Axios API layer with JWT interceptors
│   │   ├── App.jsx & App.css    # Layout & routing
│   │   └── index.js             # Root React DOM render
│   └── package.json             # Frontend dependencies
│
├── mobile/                      # React Native Mobile App (iOS & Android)
│   ├── src/
│   │   ├── navigation/          # Native Stack Navigator (AppNavigator.tsx)
│   │   ├── screens/             # VehicleListScreen & VehicleDetailScreen
│   │   ├── services/            # Axios API service
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Status colors & battery utilities
│   ├── App.tsx                  # Root navigation container
│   └── package.json             # Mobile dependencies
│
├── .gitignore                   # Master gitignore
└── README.md                    # Documentation & API reference
```

---

## 📑 Table of Contents
1. [Project Overview & Live URL](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Quick Start & Setup Instructions](#3-quick-start--setup-instructions)
   - [Backend API Setup](#backend-setup)
   - [Web Dashboard Setup](#web-dashboard-setup)
   - [React Native Mobile App Setup](#mobile-app-setup)
4. [Key Design Decisions & Architecture](#4-key-design-decisions--architecture)
5. [10 Improvements With More Time](#5-10-improvements-with-more-time)
6. [AI Usage Disclosure & Workflow](#6-ai-usage-disclosure)
7. [API Endpoints Documentation](#7-api-endpoints-documentation)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [AWS Deployment Guide](#9-aws-deployment-guide)

---

## 1. Project Overview

Evify provides real-time visibility, telemetry tracking, battery monitoring, and maintenance management for electric vehicle fleets.

### 🌐 Live API & Demo
- **Live Backend API**: `http://51.21.127.52:5000/api`
- **Health Check Endpoint**: `http://51.21.127.52:5000/health`
- **Vehicles Endpoint**: `http://51.21.127.52:5000/api/vehicles`
- **Demo Manager Credentials**:
  - **Email**: `admin@evify.com`
  - **Password**: `password123`

---

## 2. Technology Stack

### Backend Core (`backend/`)
- **Runtime**: Node.js (v18+ LTS)
- **Framework**: Express.js 4.18
- **Database & ODM**: MongoDB / Mongoose 6.9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: `express-validator` (Request layer) + Mongoose Schema validators (Data layer)
- **Security**: `helmet` (HTTP headers), `cors` (Cross-Origin Resource Sharing)
- **Logging**: `winston` (multi-transport structured JSON & color console) + `morgan`
- **Testing**: `jest`, `supertest`, `mongodb-memory-server`

### Web Dashboard (`frontend/`)
- **Library**: React 18
- **State & Auth**: React Context API (`AuthContext`) with custom hooks (`useAuth`)
- **HTTP Client**: Axios with automated Bearer token injection and 401 response interceptors
- **Styling**: Responsive CSS Grid / Flexbox with battery visualizers and status badges

### Mobile Application (`mobile/`)
- **Framework**: React Native 0.72 with TypeScript
- **Navigation**: React Navigation 6 (Native Stack Navigator)
- **Features**: Native SafeAreaView, FlatList with pull-to-refresh, infinite pagination, dynamic status badges

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Node.js `v18.x` or higher
- MongoDB instance running locally (e.g. `mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection string.

---

### Backend Setup

1. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Seed database with sample fleets and electric vehicles**:
   ```bash
   npm run seed
   ```
   *Creates 3 fleets (Downtown, Airport, Residential) and 5 sample EVs with varying battery levels and statuses.*

4. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5000`.

5. **Run automated test suite**:
   ```bash
   npm test
   ```

---

### Web Dashboard Setup

1. **Navigate to the frontend directory and install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm start
   ```
   The dashboard will automatically open at `http://localhost:3000`.

3. **Login**:
   - Use the **Auto-Fill** button or enter `admin@evify.com` / `password123`.

---

### Mobile App Setup

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   npm install
   ```

2. **Run on iOS (macOS only)**:
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

3. **Run on Android**:
   ```bash
   npm run android
   ```

---

## 4. Key Design Decisions & Architecture

### 1. MongoDB & Mongoose Schema Architecture
- **Why MongoDB?** EV telemetry parameters evolve rapidly. A document-oriented model allows flexible schemas without disruptive migrations.
- **Relational Integrity via Virtuals & References**: Fleets and Vehicles maintain referential integrity via MongoDB `ObjectId` references. Mongoose virtuals (`fleet.vehicles`) enable reverse vehicle population without duplicating data.
- **Performance Indexes**: A compound index `{ fleet: 1, status: 1 }` is applied on the `Vehicle` collection to ensure sub-millisecond filtering across thousands of active vehicles.

### 2. Stateless JWT Authentication
- **Why JWT?** Seamless token sharing across both web dispatch portals and mobile driver/technician apps without server session state.

### 3. Clean MVC Pattern & Layer Separation
- **`models/`**: Defines data structures, schema hooks (pre-save uppercase transformation), validation rules, and virtuals.
- **`controllers/`**: Pure business logic orchestrating requests, database queries, and responses.
- **`routes/`**: Route declarations cleanly coupled with request validation chains.
- **`middleware/`**: Cross-cutting concerns (Auth, Validation, Global Error Handling).

### 4. Robust Two-Tier Validation Strategy
1. **Tier 1 (HTTP Request Validation)**: `express-validator` validates incoming fields (regex on registration number, MongoId checks, status enum verification) *before* reaching controller code.
2. **Tier 2 (Database Schema Constraints)**: Mongoose schema guarantees integrity at the persistence level.

### 5. Centralized Error Handling & Structured Logging
- Custom `AppError` class differentiates operational errors from internal programming bugs.
- Central error middleware captures Mongoose `CastError`, duplicate key `11000`, validation failures, and JWT expirations.
- Winston outputs readable color logs in local development and structured JSON in production for ELK/CloudWatch ingestion.

---

## 5. 10 Improvements With More Time

1. **Live Telemetry WebSockets (Socket.io / MQTT)**: Stream real-time GPS coordinates, live charging wattage, and real-time battery drain without polling.
2. **Geofencing & Map Dashboard (Mapbox / Leaflet)**: Visual map view showing vehicle pins, active geofence alerts, and depot boundaries.
3. **Role-Based Access Control (RBAC)**: Distinct permissions for `SuperAdmin`, `FleetManager`, `MaintenanceTechnician`, and `Driver`.
4. **Automated Maintenance Scheduling Engine**: Trigger maintenance tickets based on accumulated odometer reading, battery temperature anomalies, or calendar intervals.
5. **Redis Telemetry Caching**: Cache hot fleet statistics and aggregate counts in Redis with cache invalidation on vehicle CRUD.
6. **Battery Health Analytics & AI Prediction**: Machine learning regression models predicting Remaining Useful Life (RUL) and charging degradation.
7. **Rate Limiting & DDoS Shield**: Integration of `express-rate-limit` with Redis store for endpoint throttling and brute-force protection.
8. **Export & Reporting Suite (CSV / PDF)**: Export vehicle utilization reports, uptime percentages, and maintenance costs.
9. **Push Notifications (FCM / APNs)**: Real-time mobile alerts for low battery warnings (<15%) and critical maintenance tickets.
10. **OpenAPI / Swagger 3.0 Interactive Docs**: Auto-generated interactive Swagger UI hosted at `/api/docs`.

---

## 6. AI Usage Disclosure

During the development of the Evify Fleet Management Platform, generative AI coding assistance was utilized as a pair-programming partner:
- **Scaffolding & Architecture**: Generated boilerplate configurations for Express, Winston logging, and Mongoose schema definitions.
- **Test Generation**: Produced comprehensive unit tests and Supertest integration test scenarios covering edge cases.
- **Frontend & Mobile UI**: Scaffolded React components, CSS layouts, and React Native TypeScript screen structures.
- **Human Verification**: All code, database indexes, security rules, regex expressions, and error handling paths were reviewed, validated, and tested for architectural soundness and correctness.

---

## 7. API Endpoints Documentation

Base URL: `http://localhost:5000/api`

### Summary Table

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service health, uptime, and environment check |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get profile of authenticated user |
| `GET` | `/api/fleets` | Public | List all fleets with populated vehicles |
| `POST` | `/api/fleets` | Public | Create a new fleet |
| `GET` | `/api/fleets/:id` | Public | Get single fleet by ID |
| `GET` | `/api/vehicles` | Public | List vehicles with filters (`fleet`, `status`) and pagination |
| `POST` | `/api/vehicles` | Protected | Create a new electric vehicle |
| `GET` | `/api/vehicles/:id` | Public | Get single vehicle details |
| `PUT` | `/api/vehicles/:id` | Protected | Update vehicle specifications or status |
| `DELETE`| `/api/vehicles/:id` | Protected | Remove a vehicle from the fleet |

---

## 8. Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port for Express server |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGO_URI` | Yes | `mongodb://127.0.0.1:27017/evify_fleet_db` | MongoDB connection URI |
| `JWT_SECRET` | Yes | *fallback secret* | Private signing key for JSON Web Tokens |
| `JWT_EXPIRE` | No | `7d` | Expiration time for JWT tokens |
| `CLIENT_URL` | No | `http://localhost:3000` | Allowed CORS origin for web dashboard |
| `REACT_APP_API_URL` | No | `/api` | Base API URL for React Frontend |
| `API_BASE_URL` | No | `http://10.0.2.2:5000/api` | Base API URL for Mobile App |

---

## 9. AWS Deployment Guide

### Option A: AWS Elastic Beanstalk (PaaS)
1. Initialize: `eb init -p node.js-18 evify-backend --region us-east-1`
2. Create environment: `eb create evify-prod-env --instance-types t3.small`
3. Set environment variables with `eb setenv`
4. Deploy: `eb deploy`

### Option B: AWS EC2 with PM2 & Nginx (IaaS)
1. Launch Ubuntu 22.04 LTS instance.
2. Run [`backend/deploy.sh`](backend/deploy.sh) or use [`backend/user-data.sh`](backend/user-data.sh) for automatic setup.
3. Manage with `pm2 status`, `pm2 logs`, `pm2 restart`.

### Option C: AWS Lambda & API Gateway (Serverless)
1. Configure [`backend/serverless.yml`](backend/serverless.yml).
2. Deploy with `serverless deploy --stage production`.

### Option D: Cloud Database with MongoDB Atlas
1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist IP addresses and get connection string.
3. Configure `MONGO_URI` in `.env`.

---

## 📄 License
This project is licensed under the MIT License.
