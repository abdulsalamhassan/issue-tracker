# API Contracts

All endpoints are rooted under `/api` unless otherwise noted. Responses use JSON and standard HTTP status codes.

## Auth

### POST /api/auth/register

Request body:
- `name` (string, required)
- `email` (string, required, unique)
- `password` (string, required)

Response 201:
```
{ "token": "<jwt>", "user": { "id": "<userId>", "name": "...", "email": "..." } }
```

Error cases:
- 400: validation error (missing/invalid fields)
- 409: email already exists
- 500: server error

### POST /api/auth/login

Request body:
- `email` (string, required)
- `password` (string, required)

Response 200:
```
{ "token": "<jwt>", "user": { "id": "<userId>", "name": "...", "email": "..." } }
```

Error cases:
- 400: validation error
- 401: invalid credentials
- 500: server error


## Projects

Note: Protected endpoints accept either `Authorization: Bearer <token>` or auth cookie.

### POST /api/projects

Request body:
- `name` (string, required)
- `key` (string, required, short uppercase identifier)
- `description` (string, optional)

Response 201:
```
{ "project": { "id": "<projectId>", "name": "...", "key": "...", "owner": "<userId>" } }
```

Error cases:
- 400: validation error
- 401: unauthorized
- 409: duplicate key
- 500: server error

### GET /api/projects/:projectId

Response 200:
```
{ "project": { "id": "...", "name": "...", "key": "...", "members": ["userId"] } }
```

Error cases:
- 401/403: unauthorized or forbidden
- 404: project not found

### POST /api/projects/:projectId/members

Request body:
- `memberId` (string - user id, required)

Response 200:
```
{ "project": { "id": "<projectId>", "members": ["<userId>"] } }
```


## Issues

Note: Protected endpoints accept either `Authorization: Bearer <token>` or auth cookie.

### POST /api/projects/:projectId/issues

Request body:
- `title` (string, required)
- `description` (string, optional)
- `assignees` (array of userIds, optional)
- `priority` (string: low|medium|high|critical)

Response 201:
```
{ "issue": { "id": "...", "title": "...", "status": "open", "project": "<projectId>" } }
```

Error cases:
- 400: validation error
- 401: unauthorized
- 404: project not found
- 500: server error

### GET /api/projects/:projectId/issues

Query params:
- `status` (optional)
- `priority` (optional)
- `assignedTo` (optional user id)
- `page` (optional, default `1`)
- `limit` (optional, max `100`)

Response 200:
```
{ "items": [ { "id": "...", "title": "...", "status": "..." } ], "total": 12, "page": 1, "limit": 20 }
```

### GET /api/issues/:issueId

Response 200:
```
{ "issue": { "id": "...", "title": "...", "description": "..." } }
```

Error cases:
- 404: issue not found

### PATCH /api/issues/:issueId/status

Request body:
- `status` (string: open|in_progress|closed|archived)

### PATCH /api/issues/:issueId/assign

Request body:
- `assigneeId` (string - user id)


## Health

### GET /health

Response 200:
```
{ "status": "ok" }
```
