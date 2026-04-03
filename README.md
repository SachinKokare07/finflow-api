# FinFlow API

A production-ready **Finance Dashboard Backend** built with Node.js, Express, and MongoDB. Supports role-based access control, financial record management, and aggregated dashboard analytics.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
  - [Auth](#auth-endpoints)
  - [Transactions](#transaction-endpoints)
  - [Dashboard](#dashboard-endpoints)
  - [Users](#user-endpoints)
- [Role Permissions Matrix](#role-permissions-matrix)
- [Error Handling](#error-handling)
- [Running Tests](#running-tests)
- [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js 18+                         |
| Framework    | Express 4                           |
| Database     | MongoDB + Mongoose                  |
| Auth         | JWT (jsonwebtoken)                  |
| Validation   | express-validator                   |
| Security     | helmet, cors, express-rate-limit    |
| Logging      | winston, morgan                     |
| Testing      | Jest + Supertest                    |

---

## Architecture

```
src/
├── config/
│   └── db.js                  # MongoDB connection with retry logic
├── controllers/
│   ├── authController.js      # Thin layer — delegates to services
│   ├── transactionController.js
│   ├── dashboardController.js
│   └── userController.js
├── middlewares/
│   ├── auth.js                # authenticate (JWT) + authorize (RBAC)
│   ├── errorHandler.js        # Global error handler + 404 handler
│   ├── rateLimiter.js         # Per-route rate limiting
│   └── validate.js            # express-validator result runner
├── models/
│   ├── User.js                # User schema with bcrypt pre-save hook
│   └── Transaction.js         # Transaction schema with soft delete
├── routes/
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   ├── dashboardRoutes.js
│   └── userRoutes.js
├── services/
│   ├── authService.js         # Business logic for auth
│   ├── transactionService.js  # CRUD + filter builder
│   ├── dashboardService.js    # MongoDB aggregation pipelines
│   └── userService.js         # User management logic
├── utils/
│   ├── helpers.js             # AppError class, catchAsync, sendSuccess
│   ├── logger.js              # Winston logger
│   └── seeder.js              # Database seeder
├── validators/
│   ├── authValidators.js
│   ├── transactionValidators.js
│   └── userValidators.js
├── app.js                     # Express app setup (no listen call)
└── server.js                  # DB connect + graceful shutdown
```

**Request flow:**
```
Request → Rate Limiter → Auth Middleware → RBAC Middleware → Validator → Controller → Service → Model → MongoDB
                                                                                         ↓
                                                                               Global Error Handler
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SachinKokare07/finflow-api
cd finflow-api

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Seed the database with sample data
npm run seed

# 5. Start the development server
npm run dev
```

The API will be running at `http://localhost:5000`.

### Health Check

```
GET http://localhost:5000/health
```

---

## Environment Variables

| Variable               | Required | Default       | Description                         |
|------------------------|----------|---------------|-------------------------------------|
| `PORT`                 | No       | `5000`        | Server port                         |
| `NODE_ENV`             | No       | `development` | Environment (`development`, `production`, `test`) |
| `MONGO_URI`            | Yes      | —             | MongoDB connection string            |
| `JWT_SECRET`           | Yes      | —             | Secret key for signing JWTs          |
| `JWT_EXPIRES_IN`       | No       | `7d`          | JWT expiration (e.g. `1d`, `7d`)    |
| `RATE_LIMIT_WINDOW_MS` | No       | `900000`      | Rate limit window in ms (15 min)    |
| `RATE_LIMIT_MAX`       | No       | `100`         | Max requests per window per IP      |
| `CORS_ORIGIN`          | No       | `*`           | Allowed CORS origin(s)              |

---

## Seeding the Database

```bash
npm run seed
```

Creates 3 users and ~70 realistic transactions across 6 months:

| Role    | Email                  | Password       |
|---------|------------------------|----------------|
| admin   | admin@finflow.com      | Admin@1234     |
| analyst | analyst@finflow.com    | Analyst@1234   |
| viewer  | viewer@finflow.com     | Viewer@1234    |

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:

```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### Register

```
POST /api/auth/register
```

**Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@1234",
  "role": "analyst"
}
```

`role` is optional. Defaults to `viewer`. Accepted values: `viewer`, `analyst`, `admin`.

**Response `201`:**

```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "analyst" }
}
```

---

#### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "email": "jane@example.com",
  "password": "Secure@1234"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGci...",
  "user": { ... }
}
```

---

#### Get My Profile

```
GET /api/auth/me
```

**Auth required.** Returns the currently authenticated user's profile.

---

### Transaction Endpoints

#### List Transactions

```
GET /api/transactions
```

**Auth required.** Accessible by all roles.

**Query Parameters:**

| Param       | Type   | Description                                 |
|-------------|--------|---------------------------------------------|
| `page`      | int    | Page number (default: 1)                    |
| `limit`     | int    | Items per page (default: 10, max: 100)      |
| `type`      | string | Filter by `income` or `expense`             |
| `category`  | string | Filter by category (e.g. `salary`, `rent`)  |
| `startDate` | ISO date | Filter from date                          |
| `endDate`   | ISO date | Filter to date                            |
| `minAmount` | float  | Minimum amount filter                       |
| `maxAmount` | float  | Maximum amount filter                       |
| `search`    | string | Search in description (case-insensitive)    |
| `sortBy`    | string | Sort field (default: `date`)                |
| `sortOrder` | string | `asc` or `desc` (default: `desc`)           |

**Response `200`:**

```json
{
  "success": true,
  "message": "Transactions retrieved.",
  "transactions": [ { ... } ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### Get Single Transaction

```
GET /api/transactions/:id
```

**Auth required.** All roles.

---

#### Create Transaction

```
POST /api/transactions
```

**Auth required.** Roles: `analyst`, `admin`.

**Body:**

```json
{
  "amount": 3500.00,
  "type": "income",
  "category": "salary",
  "date": "2024-06-01",
  "description": "June salary"
}
```

Valid categories: `salary`, `freelance`, `investment`, `business`, `rent`, `utilities`, `groceries`, `transport`, `healthcare`, `entertainment`, `education`, `insurance`, `taxes`, `other`

---

#### Update Transaction

```
PATCH /api/transactions/:id
```

**Auth required.** Roles: `analyst` (own only), `admin` (any).

All body fields are optional. Only send the fields you want to change.

---

#### Delete Transaction (Soft Delete)

```
DELETE /api/transactions/:id
```

**Auth required.** Roles: `analyst` (own only), `admin` (any).

Records are **not physically deleted**. They are flagged with `isDeleted: true` and excluded from all queries. This preserves audit history.

---

### Dashboard Endpoints

All dashboard endpoints require authentication and `analyst` or `admin` role.

#### Financial Summary

```
GET /api/dashboard/summary
```

**Response `200`:**

```json
{
  "success": true,
  "summary": {
    "income": 24500.00,
    "expense": 8750.00,
    "netBalance": 15750.00,
    "incomeCount": 12,
    "expenseCount": 28,
    "totalTransactions": 40,
    "savingsRate": 64.29
  }
}
```

---

#### Category Breakdown

```
GET /api/dashboard/by-category
```

**Query Params:** `type` (income|expense), `startDate`, `endDate`

**Response `200`:**

```json
{
  "success": true,
  "categories": [
    {
      "category": "salary",
      "categoryTotal": 18000,
      "breakdown": [
        { "type": "income", "total": 18000, "count": 3 }
      ]
    }
  ]
}
```

---

#### Monthly Trends

```
GET /api/dashboard/trends?months=6
```

Returns monthly income and expense totals for the past N months (default: 6, max: 24).

---

#### Recent Activity

```
GET /api/dashboard/recent?limit=10
```

Returns the most recently created transactions with user details populated.

---

#### Weekly Comparison

```
GET /api/dashboard/weekly
```

Compares the current week's totals to the previous week.

**Response `200`:**

```json
{
  "success": true,
  "thisWeek": { "income": 1200, "expense": 450 },
  "lastWeek": { "income": 3000, "expense": 890 }
}
```

---

### User Endpoints

#### List Users

```
GET /api/users?page=1&limit=10&role=analyst&isActive=true
```

**Auth required.** Role: `admin` only.

---

#### Get Single User

```
GET /api/users/:id
```

**Auth required.** Role: `admin` only.

---

#### Update User

```
PATCH /api/users/:id
```

**Auth required.** All roles (non-admins can only update themselves and cannot change `role` or `isActive`).

**Body:**

```json
{
  "name": "New Name",
  "role": "analyst",
  "isActive": true
}
```

---

#### Change Password

```
PATCH /api/users/:id/change-password
```

**Auth required.** Users can only change their own password.

**Body:**

```json
{
  "currentPassword": "OldPass@1234",
  "newPassword": "NewPass@1234"
}
```

---

#### Deactivate User

```
PATCH /api/users/:id/deactivate
```

**Auth required.** Role: `admin` only. Admins cannot deactivate themselves.

---

## Role Permissions Matrix

| Action                        | Viewer | Analyst       | Admin |
|-------------------------------|--------|---------------|-------|
| Register / Login              | ✓      | ✓             | ✓     |
| View own profile              | ✓      | ✓             | ✓     |
| List transactions             | ✓      | ✓             | ✓     |
| Create transaction            | ✗      | ✓             | ✓     |
| Update own transaction        | ✗      | ✓             | ✓     |
| Update any transaction        | ✗      | ✗             | ✓     |
| Delete own transaction        | ✗      | ✓ (soft)      | ✓     |
| Delete any transaction        | ✗      | ✗             | ✓     |
| Dashboard summary             | ✗      | ✓             | ✓     |
| Category breakdown            | ✗      | ✓             | ✓     |
| Monthly trends                | ✗      | ✓             | ✓     |
| Recent activity               | ✗      | ✓             | ✓     |
| Weekly comparison             | ✗      | ✓             | ✓     |
| List all users                | ✗      | ✗             | ✓     |
| Update own profile            | ✓      | ✓             | ✓     |
| Update any user               | ✗      | ✗             | ✓     |
| Change own password           | ✓      | ✓             | ✓     |
| Deactivate user               | ✗      | ✗             | ✓     |

---

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

In `development` mode, a `stack` field is also included for debugging.

| Status Code | Meaning                                         |
|-------------|-------------------------------------------------|
| 400         | Bad request (invalid ID format, bad input)      |
| 401         | Unauthenticated (missing/expired/invalid token) |
| 403         | Forbidden (insufficient role)                   |
| 404         | Resource not found                              |
| 409         | Conflict (duplicate email)                      |
| 422         | Validation error (missing/invalid fields)       |
| 429         | Too many requests (rate limit exceeded)         |
| 500         | Internal server error                           |

---

## Running Tests

Tests use a **separate** MongoDB database (`finflow_test`) and never touch your development data.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Test coverage includes:
- Auth: register, login, JWT verification
- Transactions: CRUD, RBAC enforcement, soft delete, filtering, pagination
- Dashboard: summary calculations, category breakdown, trend endpoints, access control

---

## Design Decisions & Assumptions

**Soft Delete over Hard Delete**
Transactions are never physically removed. Setting `isDeleted: true` preserves audit history, enables recovery, and mirrors how real financial systems work. A pre-query middleware ensures soft-deleted records are invisible in all normal queries.

**Service Layer Separation**
Controllers are intentionally thin — they only extract request data and call services. All business logic lives in the service layer. This makes the logic unit-testable without spinning up HTTP.

**MongoDB Aggregation for Analytics**
Dashboard endpoints use native MongoDB aggregation pipelines (`$group`, `$match`, `$sum`) instead of fetching records into Node.js and computing in JavaScript. This keeps analytics fast regardless of record volume.

**JWT Stateless Auth**
No session store is used. The token payload contains `userId` and `role`. The role is re-validated against the database on each request via `authenticate` middleware, so a deactivated user cannot use an existing token.

**Password Validation**
Passwords must contain uppercase, lowercase, and a number (minimum 8 characters). This is enforced at both the validator layer and communicated with a clear error message.

**Rate Limiting**
Auth endpoints (login/register) have a stricter limit (10 requests per 15 minutes) than general API endpoints (100 per 15 minutes) to protect against brute-force attacks.

**Pagination Defaults**
All list endpoints default to `page=1, limit=10` with a hard cap of 100 per page.

**Assumptions Made**
- Categories are a fixed enum (not user-defined) to ensure data consistency in aggregations.
- Viewers are not permitted to access dashboard analytics — those are analyst/admin features.
- An admin cannot deactivate their own account (to prevent lockout).
- Timestamps (`createdAt`, `updatedAt`) are managed automatically by Mongoose.
