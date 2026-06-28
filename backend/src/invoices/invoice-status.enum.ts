export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
}

export const PERSISTED_STATUSES = Object.values(InvoiceStatus);

export const OVERDUE = 'Overdue';

export type EffectiveStatus = InvoiceStatus | typeof OVERDUE;
