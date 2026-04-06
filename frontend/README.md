# FinFlow Frontend

React client for the FinFlow API.

## What The App Includes

- Authentication screens (login + registration)
- Protected routing by role (`viewer`, `analyst`, `admin`)
- Transaction browser with filtering and pagination
- Dashboard insights for analyst/admin accounts
- User management tools for admins
- Profile and password update screens

## Run Locally

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default dev URL: `http://localhost:5173`

## Environment

- `VITE_API_URL` should point to the backend server
- If omitted, app uses `https://finflow-api-90cp.onrender.com`

## Production Build

```bash
npm run build
npm run preview
```

## Deploying To Vercel

1. Import the repository in Vercel.
2. Select `frontend` as the root directory.
3. Keep build command: `npm run build`.
4. Keep output directory: `dist`.
5. Configure env var: `VITE_API_URL=https://finflow-api-90cp.onrender.com`.

`vercel.json` already includes SPA rewrite behavior for React Router refreshes.

## API Contract

Expected backend behavior and endpoints are documented in `../backend/README.md`.

## Demo Accounts

- `admin@finflow.com` / `Admin@1234`
- `analyst@finflow.com` / `Analyst@1234`
- `viewer@finflow.com` / `Viewer@1234`
