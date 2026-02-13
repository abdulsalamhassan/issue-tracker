# DevTrack

DevTrack is a full-stack issue tracking application for managing projects, creating issues, assigning work, and tracking status across a team.

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT auth
- Deployment: Render (backend service configured in `render.yaml`)

## Key Features

- User authentication with register, login, logout, and current-user session endpoint
- Cookie-based and Bearer-token authentication support
- Project management with ownership and member access
- Issue lifecycle management: create, filter, assign, and advance status
- Dashboard metrics across projects and issue states
- Responsive UI for dashboard, project list, issue list, and issue detail views

## Repository Structure

```text
.
|- frontend/          # Next.js application
|- backend/           # Express API and business logic
|- docs/              # Design, API, and setup notes
|- render.yaml        # Render deployment blueprint (backend)
`- README.md
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB instance (local or hosted)

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` with:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-random-secret>
PORT=4000
AUTH_COOKIE_NAME=token
NODE_ENV=development
```

Notes:
- `MONGO_URI` and `JWT_SECRET` are required.
- `PORT` defaults to `4000`.
- In production, cookies are configured as `Secure` and `SameSite=None`.

### Frontend (`frontend/.env.local`)

Optional:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If unset, the frontend defaults to `http://localhost:4000/api`.

## Local Development

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` by default.

### 2. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Available Scripts

### Backend (`backend/package.json`)

- `npm run dev` - Run API in watch mode with `ts-node-dev`
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled API from `dist/server.js`
- `npm test` - Build test TS config and run Node test runner

### Frontend (`frontend/package.json`)

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build production assets
- `npm run start` - Start production server
- `npm run lint` - Run Next.js lint checks

## API Overview

Base URL: `http://localhost:4000/api`

Main endpoint groups:

- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- Projects: `/projects`, `/projects/:projectId`, `/projects/:projectId/members`
- Issues: `/projects/:projectId/issues`, `/issues/:issueId`, `/issues/:issueId/status`, `/issues/:issueId/assign`

Health check:

- `GET /health` -> `{ "status": "ok" }`

For request/response examples, see `docs/api.md`.

## Deployment (Render)

`render.yaml` defines a backend web service:

- Service name: `devtrack-backend`
- Root directory: `backend`
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm run start`
- Health check path: `/health`

Required Render environment variables:

- `MONGO_URI`
- `JWT_SECRET`

Configured defaults in blueprint:

- `NODE_ENV=production`
- `AUTH_COOKIE_NAME=token`

## Additional Documentation

- `docs/setup.md` - Setup notes
- `docs/api.md` - API contracts and examples
- `docs/design.md` - High-level design notes
