# FinFlow Backend

Express API for the FinFlow finance platform.

## Core Responsibilities

- Authenticate users and issue JWT tokens
- Enforce role permissions (`viewer`, `analyst`, `admin`)
- Handle transaction CRUD with soft-delete behavior
- Provide dashboard analytics (summary, trends, categories, weekly comparison)
- Expose user management endpoints for admin workflows

## Stack

- Node.js 18+
- Express 4
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Validation (`express-validator`)
- Security (`helmet`, `cors`, `express-rate-limit`)
- Logging (`winston`, `morgan`)
- Testing (`jest`, `supertest`)

## Local Run

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Default local API URL: `http://localhost:5000`

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port (default `5000`) |
| `NODE_ENV` | No | `development`, `production`, or `test` |
| `MONGO_URI` | Yes | Mongo connection string |
| `JWT_SECRET` | Yes | Token signing secret |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window in ms |
| `RATE_LIMIT_MAX` | No | Requests allowed per window |
| `CORS_ORIGIN` | No | Allowed origin(s) |

## API Base Path

All endpoints are mounted under:

```text
/api
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/by-category`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/recent`
- `GET /api/dashboard/weekly`
- `GET /api/users`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/change-password`
- `PATCH /api/users/:id/deactivate`

## Seed Data

Run:

```bash
npm run seed
```

Seed command creates demo users and transaction history for testing analytics.

Demo credentials:

- `admin@finflow.com` / `Admin@1234`
- `analyst@finflow.com` / `Analyst@1234`
- `viewer@finflow.com` / `Viewer@1234`

## Testing

```bash
npm test
```

The test suite covers authentication, transactions, and dashboard behavior.

## Health Endpoint

```text
GET /health
```

Use this route for uptime checks in deployment environments.
