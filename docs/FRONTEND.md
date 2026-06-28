# Frontend Plan (React + Vite + TypeScript)

## Stack

- Vite + React 18 + TypeScript
- `react-router-dom` v6
- `axios` API client with JWT interceptor
- Ant Design (antd) v5 as the base component library, with `dayjs` for dates
- A thin global stylesheet for layout helpers on top of antd
- Vitest + React Testing Library

## Structure

```
src/
├── main.tsx
├── App.tsx                  # routes
├── api/
│   ├── client.ts            # axios instance + auth interceptor
│   ├── auth.ts
│   └── invoices.ts
├── auth/
│   ├── AuthContext.tsx      # token + user state, localStorage persistence
│   └── RequireAuth.tsx      # route guard
├── components/
│   ├── Layout.tsx
│   ├── StatusBadge.tsx
│   ├── Pagination.tsx
│   └── Toast.tsx            # success/error notifications
├── pages/
│   ├── LoginPage.tsx
│   ├── InvoiceListPage.tsx
│   ├── InvoiceDetailPage.tsx
│   └── CreateInvoicePage.tsx
├── types/invoice.ts
├── utils/format.ts          # currency / date formatting
└── styles/
```

## Routes

| Path            | Screen          | Guard |
|-----------------|-----------------|-------|
| /login          | Login           | public |
| /               | Invoice list    | protected (default home) |
| /invoices/new   | Create invoice  | protected |
| /invoices/:id   | Invoice detail  | protected |

Unauthenticated access to a protected route redirects to `/login`.

## Behaviours

- **Login** — email + password, client-side validation, stores JWT in localStorage, redirects to `/`.
- **List** — debounced keyword search, status filter dropdown, sort controls (field + direction),
  server-side pagination with configurable page size. URL-independent local state is fine.
- **Detail** — invoice info, customer info, line items, subtotal/tax/discount/total/paid/balance,
  effective status badge.
- **Create** — full validation mirroring backend rules, due-date ≥ invoice-date, success toast +
  redirect to list, surfaces server validation / 409 errors.

## Tests

- LoginPage: validation + successful submit calls api and navigates.
- InvoiceListPage: renders rows from mocked api, triggers refetch on filter change.
- CreateInvoicePage: client validation blocks invalid submit.
- format utils: currency + date.
