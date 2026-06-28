# SimpleInvoice — Implementation Plan

A full-stack invoicing application: NestJS REST API + React (TypeScript) SPA, backed by
PostgreSQL, packaged with Docker Compose.

## Scope

Four core features:

1. **Authentication** — email/password login, JWT issued by the server, stored client-side,
   protected routes.
2. **Invoice list** — paginated, searchable, filterable, sortable (server-side).
3. **Invoice detail** — full breakdown of a single invoice.
4. **Invoice creation** — validated form, server-computed totals, created as `Draft`.

## Repository layout (monorepo)

```
invoice/
├── backend/            # NestJS API (TypeORM + PostgreSQL)
├── frontend/           # React + Vite + TypeScript
├── docker-compose.yml  # db + backend + frontend
├── .env.example
├── docs/
└── README.md
```

## Milestones

| # | Milestone | Output |
|---|-----------|--------|
| 1 | Backend scaffold + config | Nest app, env config, TypeORM wiring |
| 2 | Domain model | User, Invoice, InvoiceItem entities + migrations-by-sync |
| 3 | Auth | login, /auth/me, JWT guard, passport strategy |
| 4 | Invoices | list (search/filter/sort/page), detail, create |
| 5 | Business logic | server-side totals, overdue derivation, validation |
| 6 | Cross-cutting | global exception filter, validation pipe, Swagger |
| 7 | Seed | mock-dataset-based seeder, `npm run seed` |
| 8 | Backend tests | unit (calc, overdue, due-date, uniqueness) + e2e flow |
| 9 | Frontend scaffold | Vite app, router, auth context, api client |
| 10 | Frontend screens | login, list, detail, create |
| 11 | Frontend tests | critical flows + key components |
| 12 | Packaging | Dockerfiles, compose, README, env examples |

See `BACKEND.md`, `FRONTEND.md`, and `DATA_MODEL.md` for detail.
