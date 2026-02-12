# Backend — DevTrack

Tech stack
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)

Environment variables (required)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWT tokens
- `PORT` - Optional server port (default 4000)
- `AUTH_COOKIE_NAME` - Optional cookie name (default `token`)

How to run locally
1. Copy `.env.example` to `.env` and fill values
2. Install dependencies
   ```bash
   cd backend
   npm install
   ```
3. Run dev server (uses `ts-node-dev`)
   ```bash
   npm run dev
   ```

Base API URL
- `http://localhost:4000`

Notes
- API endpoints are mounted under `/api` (for example `/api/auth/login`).
- JWT auth supports both HTTP-only cookie and `Authorization: Bearer <token>`.
- All write operations validate input and return normalized JSON errors: `{ "message": "..." }`.
- Centralized error handling ensures consistent responses and hides internal stack traces in production.
