# FinFlow Workspace

FinFlow is a full-stack finance tracking project with role-based access.
The repository is split into two deployable apps:

- `backend/`: Express + MongoDB API
- `frontend/`: React + Vite client

## Live Environment

- Frontend: https://finflow-api.vercel.app/login
- Backend: https://finflow-api-90cp.onrender.com

## What This Project Covers

- JWT authentication with role-aware route protection
- Transaction lifecycle: create, read, update, soft-delete
- Analytics endpoints for summary, trends, and category grouping
- User administration for role and activation management
- Automated tests for key backend workflows

## Repository Layout

```text
finflow-api/
  backend/   # API, business logic, tests, seeding
  frontend/  # SPA client, guarded routes, dashboard views
```

## Quick Start

1. Install backend dependencies and run API:

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

2. In a separate terminal, install and run frontend:

```bash
cd frontend
npm install
npm run dev
```

## Where To Read Next

- API details and endpoint examples: `backend/README.md`
- Frontend routes, build, and deployment notes: `frontend/README.md`

## Demo Credentials (Seed Data)

- admin@finflow.com / Admin@1234
- analyst@finflow.com / Analyst@1234
- viewer@finflow.com / Viewer@1234

## Notes

- API base path is `/api`.
- The backend includes a `/health` route for availability checks.
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
