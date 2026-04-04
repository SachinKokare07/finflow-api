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

## Deploy On Vercel

1. Push the `frontend/` folder to GitHub with the rest of the repo.
2. Import the repository in Vercel.
3. Set the root directory to `frontend`.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add an environment variable:
	- `VITE_API_URL = https://finflow-api-90cp.onrender.com`
7. Deploy.

The included [vercel.json](vercel.json) keeps React Router routes working on refresh.

## Backend Notes

The app expects the API contract described in [backend/README.md](../backend/README.md).

Seeded demo credentials:

- `admin@finflow.com` / `Admin@1234`
- `analyst@finflow.com` / `Analyst@1234`
- `viewer@finflow.com` / `Viewer@1234`
