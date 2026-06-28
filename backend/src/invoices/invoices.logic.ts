import { InvoiceStatus, OVERDUE, EffectiveStatus } from './invoice-status.enum';

export interface Totals {
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeTotals(
  quantity: number,
  rate: number,
  taxPercent: number,
  discount: number,
): Totals {
  const subTotal = round(quantity * rate);
  const taxAmount = round(subTotal * (taxPercent / 100));
  const totalAmount = round(subTotal + taxAmount - discount);
  return {
    invoiceSubTotal: subTotal,
    totalTax: taxAmount,
    totalDiscount: round(discount),
    totalAmount,
  };
}

export function deriveStatus(
  status: InvoiceStatus,
  dueDate: string,
  today: Date = new Date(),
): EffectiveStatus {
  if (status === InvoiceStatus.Paid) {
    return status;
  }
  const due = new Date(`${dueDate}T00:00:00`);
  const reference = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return due < reference ? OVERDUE : status;
}

export function isOnOrAfter(dueDate: string, invoiceDate: string): boolean {
  return new Date(dueDate).getTime() >= new Date(invoiceDate).getTime();
}
