# Data Model

PostgreSQL via TypeORM. Customer is stored as **embedded columns on the invoice** (single
customer per invoice, no reuse across invoices in this assessment) — documented as a design
decision in the README.

## user

| Column        | Type        | Notes                          |
|---------------|-------------|--------------------------------|
| id            | uuid (PK)   | generated                      |
| email         | varchar     | unique, login identifier       |
| password_hash | varchar     | bcrypt                         |
| fullname      | varchar     | display name                   |
| created_at    | timestamptz | auto                           |

## invoice

| Column             | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| invoice_id         | uuid (PK)     | generated                                    |
| invoice_number     | varchar       | **unique** (DB constraint)                   |
| invoice_reference  | varchar null  | optional external ref                        |
| invoice_date       | date          |                                              |
| due_date           | date          | must be ≥ invoice_date (server validated)    |
| currency           | varchar       | ISO 4217, e.g. AUD                           |
| currency_symbol    | varchar       | e.g. AU$                                     |
| description        | varchar null  |                                              |
| status             | enum          | persisted: Draft, Pending, Paid              |
| customer_fullname  | varchar       | embedded customer                            |
| customer_email     | varchar       | embedded customer                            |
| customer_mobile    | varchar null  | embedded customer                            |
| customer_address   | varchar null  | embedded customer                            |
| invoice_sub_total  | numeric(14,2) | quantity × rate                              |
| total_tax          | numeric(14,2) | server computed                              |
| total_discount     | numeric(14,2) | server computed                              |
| total_amount       | numeric(14,2) | server computed                              |
| total_paid         | numeric(14,2) | default 0                                    |
| balance_amount     | numeric(14,2) | total_amount − total_paid                    |
| created_at         | timestamptz   | auto                                         |
| created_by         | uuid (FK)     | → user.id                                    |

Indexes: unique(invoice_number), index(status), index(invoice_date), index(due_date),
index(total_amount), index(customer_fullname).

`status` is stored as one of `Draft | Pending | Paid`. **Overdue** is never persisted — it is
derived at read time: `status !== 'Paid' && dueDate < today ⇒ 'Overdue'`.

## invoice_item

| Column     | Type          | Notes                |
|------------|---------------|----------------------|
| id         | uuid (PK)     | generated            |
| invoice_id | uuid (FK)     | → invoice, cascade   |
| name       | varchar       | required             |
| quantity   | int           | positive             |
| rate       | numeric(14,2) | positive             |

One item per invoice for this assessment; relation is one-to-many to allow future growth.

## Calculations (server-side only)

```
subTotal     = quantity × rate
taxAmount    = subTotal × (tax% / 100)
totalAmount  = subTotal + taxAmount − discount
balanceAmount= totalAmount − totalPaid
```
