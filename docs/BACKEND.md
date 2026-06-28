# Backend Plan (NestJS)

## Stack

- NestJS 10, TypeScript
- TypeORM + `pg` (PostgreSQL)
- `@nestjs/jwt` + `passport-jwt` for auth
- `bcrypt` for password hashing
- `class-validator` + `class-transformer` via global `ValidationPipe`
- `@nestjs/swagger` at `/api/docs`
- Jest for unit + e2e

## Module map

```
src/
├── main.ts                 # bootstrap, global pipe/filter, swagger
├── app.module.ts
├── config/                 # env loading + validation
├── common/
│   ├── filters/            # global HTTP exception filter
│   └── dto/                # shared paging dto
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts     # validateUser, login
│   ├── auth.controller.ts  # POST /auth/login, GET /auth/me
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── current-user.decorator.ts
│   └── dto/login.dto.ts
├── users/
│   ├── user.entity.ts
│   └── users.service.ts
├── invoices/
│   ├── invoice.entity.ts
│   ├── invoice-item.entity.ts
│   ├── invoice-status.enum.ts
│   ├── invoices.module.ts
│   ├── invoices.service.ts
│   ├── invoices.controller.ts
│   └── dto/
│       ├── create-invoice.dto.ts
│       ├── query-invoices.dto.ts
│       └── invoice-response.dto.ts
└── database/
    ├── data-source.ts
    └── seed/
        ├── seed.ts         # entrypoint for `npm run seed`
        └── mock-data.ts
```

## Endpoints

| Method | Path           | Auth | Notes |
|--------|----------------|------|-------|
| POST   | /auth/login    | no   | returns `{ accessToken, user }` |
| GET    | /auth/me       | yes  | current user profile |
| GET    | /invoices      | yes  | list w/ paging+search+filter+sort |
| GET    | /invoices/:id  | yes  | detail, 404 if missing |
| POST   | /invoices      | yes  | create, status forced to Draft |

### GET /invoices query params

`page`, `pageSize`, `sortBy` (invoiceDate|dueDate|totalAmount), `ordering` (ASC|DESC),
`status` (Draft|Pending|Paid|Overdue), `keyword`, `fromDate`, `toDate`.

Response:
```json
{ "data": [ ...invoices ], "paging": { "page": 1, "pageSize": 10, "total": 100 } }
```

Status handling: each returned invoice has `status` resolved through overdue derivation.
Filtering by `Overdue` is translated into `status != 'Paid' AND dueDate < today`; filtering by a
persisted status excludes overdue-derived rows where appropriate (a row that is `Pending` but
past due is reported as `Overdue`, so the persisted-status filters use the *effective* status).

### Sorting

Whitelist mapping `sortBy → column`; reject anything else. Default `invoiceDate DESC`.

## Business rules

- Totals computed in `invoices.service` on create; client-sent totals ignored.
- `dueDate >= invoiceDate` validated both by a DTO-level constraint and re-checked in service.
- New invoices forced to `Draft`, `totalPaid = 0`, `balanceAmount = totalAmount`.
- Unique invoice number: DB unique constraint; violation mapped to `409 Conflict`.

## Validation & errors

- Global `ValidationPipe({ whitelist, transform, forbidNonWhitelisted })`.
- Global exception filter normalizes responses to `{ statusCode, message, error }`.

## Config / env

`PORT`, `DATABASE_URL` (or discrete `DB_*`), `JWT_SECRET`, `JWT_EXPIRES_IN` (default 3600),
`SEED_USER_EMAIL`, `SEED_USER_PASSWORD`, `CORS_ORIGIN`.

## Tests

- `invoices.service.spec` — total calc, overdue derivation, due-date rejection, unique-number
  conflict mapping.
- `invoices.e2e-spec` — login → create invoice → appears in list.
