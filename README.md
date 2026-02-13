# DevTrack

DevTrack is a full-stack issue tracking application for managing projects, creating issues, assigning work, and tracking status across a team.

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT auth
- Deployment: Render (backend service configured in `render.yaml`)

## Key Features

- User authentication with register, login, logout, and current-user session endpoint
# DevTrack

DevTrack is a full-stack issue tracking application designed for small engineering teams to manage projects, track work, and visualize progress.

## Features

- User authentication (register, login, logout, current session)
- Project management with owners and members
- Issue lifecycle: create, assign, filter, and update status
- Dashboard with aggregated metrics across projects
- Responsive UI built with Next.js and Tailwind

## Tech stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT auth
- CI / Deployment: Render (backend defined in `render.yaml`)

## Repository layout

```
.
├─ frontend/          # Next.js application
├─ backend/           # Express API and business logic
├─ docs/              # Design, API, and setup notes
├─ render.yaml        # Render deployment blueprint (backend)
└─ README.md
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB instance (local or hosted)

## Environment

Backend (create `backend/.env`):

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-random-secret>
PORT=4000
AUTH_COOKIE_NAME=token
NODE_ENV=development
```

Frontend (optional, create `frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Local development

1. Start backend

```bash
cd backend
npm install
npm run dev
```

2. Start frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

## API overview

Base URL: `http://localhost:4000/api`

Primary endpoints:

- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- Projects: `/projects`, `/projects/:projectId`, `/projects/:projectId/members`, `/projects/metrics`
- Issues: `/projects/:projectId/issues`, `/issues/:issueId`, `/issues/:issueId/status`, `/issues/:issueId/assign`

Health check:

- `GET /health` -> `{ "status": "ok" }`

See `docs/api.md` for full request/response examples.

## Deployment

The `render.yaml` blueprint configures the backend service for Render. Key notes:

- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm run start`
- Ensure `MONGO_URI` and `JWT_SECRET` are set in Render environment variables.

## Notes & next steps

- The frontend uses an aggregated `/projects/metrics` endpoint to efficiently fetch dashboard data (one request instead of many).
- For production, ensure HTTPS and cookie/security settings are configured correctly.

## Contributing

Pull requests are welcome. Please open an issue for large changes before implementing.

## License

This project is provided under the MIT License. Add a `LICENSE` file if you intend to publish under MIT.
