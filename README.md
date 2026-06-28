# SimpleInvoice

A full-stack invoicing application. Users sign in (or register), browse a searchable, sortable,
paginated list of invoices, open an invoice to see its line items and totals, and create new
invoices. All money math and the overdue status are computed on the server so the client never
has to be trusted with the numbers.

- **Frontend** — React 18 + TypeScript (Vite), React Router, Ant Design, axios
- **Backend** — NestJS + TypeScript, TypeORM, PostgreSQL, JWT auth, Swagger
- **Database** — PostgreSQL 16

## Architecture

```
┌────────────┐        REST / JSON         ┌────────────┐      TypeORM      ┌────────────┐
│  Frontend  │  ───────────────────────►  │  Backend   │  ──────────────►  │ PostgreSQL │
│  (React +  │   Bearer JWT, /v1 prefix   │ (NestJS)   │                   │            │
│   antd)    │  ◄───────────────────────  │            │  ◄──────────────  │            │
└────────────┘                            └────────────┘                   └────────────┘
```

- **Backend** is a NestJS app organised by feature module: `auth` (login, register, JWT guard),
  `users`, and `invoices` (controller → service → TypeORM repository). Request validation uses
  `class-validator` DTOs through a global `ValidationPipe`; all errors pass through a single
  exception filter that returns a consistent `{ statusCode, message, error }` shape. The whole
  API is served under a `/v1` global prefix and documented with Swagger.
- **Frontend** is a Vite SPA. An axios instance attaches the JWT from `localStorage`, redirects
  to `/login` on `401`, and points at the `/v1` API. Ant Design provides the base components
  (Table with header sorting, Form validation, etc.). Routing is guarded so unauthenticated
  users are bounced to the login page.
- **Totals and status are derived server-side.** `subTotal = quantity × rate`,
  `taxAmount = subTotal × tax%`, `totalAmount = subTotal + taxAmount − discount`,
  `balanceAmount = totalAmount − totalPaid`. **Overdue** is *not* stored — it is computed at read
  time (`status !== 'Paid' && dueDate < today`).

The data model is documented in detail in [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md); planning
notes for the backend and frontend live in [`docs/`](docs).

## API surface

All routes are under the `/v1` prefix.

| Method | Path             | Auth | Description                                  |
|--------|------------------|------|----------------------------------------------|
| POST   | `/auth/register` | —    | Create an account, returns a JWT             |
| POST   | `/auth/login`    | —    | Authenticate, returns a JWT                  |
| GET    | `/auth/me`       | JWT  | Current user profile                         |
| GET    | `/invoices`      | JWT  | List (page, pageSize, sortBy, ordering, status, keyword, fromDate, toDate) |
| GET    | `/invoices/:id`  | JWT  | Single invoice with line items               |
| POST   | `/invoices`      | JWT  | Create an invoice (totals computed server-side) |

Full request/response schemas are in Swagger at `/v1/docs`.

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

You need Node 20+ and a running PostgreSQL 14+ instance.

### Backend

```bash
cd backend
cp .env.example .env          # point DB_* / DATABASE_URL at your Postgres
npm install
npm run seed                  # create reviewer user + sample data (see below)
npm run start:dev             # http://localhost:3000  (Swagger at /v1/docs)
```

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3000/v1
npm install
npm run dev                   # http://localhost:5173
```

The schema is created automatically on first boot (TypeORM `synchronize` is enabled), so no
manual migration step is needed.

## Default login credentials (reviewer access)

The seed script creates a single reviewer account:

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@gmail.com`   |
| Password | `Password123`       |

These come from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` and can be overridden before seeding
(see the next section). You can also register a brand-new account from the **Sign up** link on
the login screen.

## Seeding the database

The seed script clears the invoice/user tables, creates the reviewer account, and inserts ~41
sample invoices (one fixed example plus 40 generated ones spanning Draft / Pending / Paid and a
mix of due dates so the derived **Overdue** state is visible).

```bash
# Local
cd backend && npm run seed

# Docker (after `docker compose up`)
docker compose exec backend npm run seed
```

The reviewer account is configurable through environment variables (set them in `.env` before
running the seed):

| Variable             | Default            | Purpose                  |
|----------------------|--------------------|--------------------------|
| `SEED_USER_EMAIL`    | `admin@gmail.com`  | Seed login email         |
| `SEED_USER_PASSWORD` | `Password123`      | Seed login password      |
| `SEED_USER_FULLNAME` | `Admin`            | Seed display name        |

## Testing

```bash
# Backend unit tests
cd backend && npm test

# Backend e2e tests (needs a reachable PostgreSQL)
cd backend && npm run test:e2e

# Frontend unit/component tests
cd frontend && npm test
```

## Assumptions & design decisions

- **Customer is embedded on the invoice.** Each invoice carries its own customer fields
  (`customer_fullname`, `customer_email`, …) rather than referencing a shared `customers` table.
  For this assessment an invoice owns exactly one customer and customers aren't reused, so this
  keeps reads single-table and avoids premature normalisation.
- **Totals are always computed by the server.** The create endpoint ignores any client-supplied
  totals and recomputes `subTotal`, `tax`, `discount`, `totalAmount`, and `balanceAmount`,
  rounding to 2 decimals. This keeps the numbers authoritative regardless of the caller.
- **Overdue is derived, never stored.** Only `Draft`, `Pending`, and `Paid` are persisted.
  `Overdue` is computed at read time (`status !== 'Paid' && dueDate < today`), and the list
  endpoint's `status=Overdue` filter is translated into the equivalent date/status query. This
  avoids stale state that a stored status would require a cron job to maintain.
- **New invoices are created as `Draft`.** Status transitions / payment recording were out of
  scope, so `totalPaid` defaults to 0 and status starts at `Draft`.
- **`invoice_number` is unique** at the database level; a duplicate returns `409 Conflict`.
- **`dueDate` must be on or after `invoiceDate`** — validated on the server and in the create form.
- **TypeORM `synchronize` is enabled** for zero-step setup. This is intentional for an assessment
  but should be replaced with explicit migrations in production (see limitations).
- **Auth is stateless JWT** stored in `localStorage`. Registration is open (anyone can create an
  account), which is appropriate for the assessment scope.
- **Password policy is intentionally minimal** — a 6-character minimum only. Advanced policies
  (complexity, special characters, expiration, MFA) were explicitly noted as not required.
- **Money is stored as `numeric(14,2)`** and converted to JS numbers via a TypeORM transformer;
  amounts are assumed to fit comfortably within that precision.

## Known limitations / incomplete features

- **No invoice editing or deletion** — the API supports list, read, and create only. There's no
  update/PATCH, no status transition endpoint, and no payment recording (`totalPaid` is always 0).
- **No real migrations.** Schema is managed by TypeORM `synchronize`; there is no migration
  history, so it is not safe for production schema evolution.
- **JWT in `localStorage`** is convenient but susceptible to XSS; a production app would prefer
  httpOnly cookies and refresh-token rotation. There is also no token refresh or server-side
  revocation — a token is valid until it expires (`JWT_EXPIRES_IN`, default 1 hour).
- **Single line item per invoice on create.** The schema models items one-to-many for future
  growth, but the create form/endpoint accept exactly one item.
- **No role-based access control** — every authenticated user can see and create all invoices;
  there is no per-user ownership filtering or admin role.
- **Overdue filtering/sorting is status-and-date based**, not a stored column, so it can't be
  indexed as a single discriminator; for very large datasets a materialised status would perform
  better.
- **Frontend bundle is not code-split** — antd ships as one chunk (~1.2 MB before gzip). Fine for
  the assessment, but lazy-loading routes would help a production build.
- **No CI pipeline / containerised test run** is included; tests are run manually via the commands
  above.
