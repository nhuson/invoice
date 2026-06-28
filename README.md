# SimpleInvoice
## Running with Docker (recommended)

Requires Docker with Compose.

```bash
cp .env.example .env          # optional: review/adjust values
docker compose up --build -d  # starts db + backend + frontend
docker compose exec backend npm run seed   # seed reviewer user + sample invoices
```

Then open:

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost:8080            |
| Backend API    | http://localhost:3000/v1         |
| Swagger / docs | http://localhost:3000/v1/docs    |
| PostgreSQL     | localhost:5432                   |

Stop with `docker compose down` (add `-v` to also drop the database volume).

### Exposed ports

- `8080` → frontend (nginx)
- `3000` → backend (NestJS)
- `5432` → PostgreSQL

All ports are configurable through `.env` (`FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT`).

## Running locally without Docker

You need Node 20+ and a running PostgreSQL instance.

### Backend

```bash
cd backend
cp .env.example .env          # point DB_* / DATABASE_URL at your Postgres
npm install
npm run seed                  # create reviewer user + sample data
npm run start:dev             # http://localhost:3000  (Swagger at /v1/docs)
```

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3000/v1
npm install
npm run dev                   # http://localhost:5173
```
