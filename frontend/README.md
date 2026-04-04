# FinFlow Frontend

A polished React + Tailwind client for the deployed FinFlow API.

## Features

- JWT login and registration
- Role-aware navigation for viewer, analyst, and admin users
- Dashboard analytics with summary cards, trend bars, and recent activity
- Transaction listing, filters, create/edit/delete flows
- Admin user management and profile/password actions

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment

- `VITE_API_URL` defaults to `https://finflow-api-90cp.onrender.com`

## Backend Notes

The app expects the API contract described in [backend/README.md](../backend/README.md).

Seeded demo credentials:

- `admin@finflow.com` / `Admin@1234`
- `analyst@finflow.com` / `Analyst@1234`
- `viewer@finflow.com` / `Viewer@1234`
