import { computeTotals, deriveStatus, isOnOrAfter } from './invoices.logic';
import { InvoiceStatus, OVERDUE } from './invoice-status.enum';

describe('invoice calculations', () => {
  it('computes subtotal, tax and total from quantity, rate, tax and discount', () => {
    const totals = computeTotals(2, 1000, 10, 20);
    expect(totals.invoiceSubTotal).toBe(2000);
    expect(totals.totalTax).toBe(200);
    expect(totals.totalDiscount).toBe(20);
    expect(totals.totalAmount).toBe(2180);
  });

  it('defaults tax to a percentage of the subtotal', () => {
    const totals = computeTotals(3, 33.33, 10, 0);
    expect(totals.invoiceSubTotal).toBe(99.99);
    expect(totals.totalTax).toBe(10);
    expect(totals.totalAmount).toBe(109.99);
  });

  it('treats zero tax and zero discount correctly', () => {
    const totals = computeTotals(5, 100, 0, 0);
    expect(totals.totalTax).toBe(0);
    expect(totals.totalAmount).toBe(500);
  });
});

describe('overdue derivation', () => {
  const today = new Date('2026-06-26T10:00:00');

  it('returns Overdue when unpaid and past due', () => {
    expect(deriveStatus(InvoiceStatus.Pending, '2026-06-01', today)).toBe(OVERDUE);
  });

  it('keeps the persisted status when due date is in the future', () => {
    expect(deriveStatus(InvoiceStatus.Pending, '2026-07-01', today)).toBe(
      InvoiceStatus.Pending,
    );
  });

  it('never overrides a Paid invoice', () => {
    expect(deriveStatus(InvoiceStatus.Paid, '2026-01-01', today)).toBe(
      InvoiceStatus.Paid,
    );
  });

  it('does not mark an invoice due today as overdue', () => {
    expect(deriveStatus(InvoiceStatus.Draft, '2026-06-26', today)).toBe(
      InvoiceStatus.Draft,
    );
  });
});

describe('due date validation', () => {
  it('accepts a due date equal to the invoice date', () => {
    expect(isOnOrAfter('2026-06-03', '2026-06-03')).toBe(true);
  });

  it('accepts a due date after the invoice date', () => {
    expect(isOnOrAfter('2026-07-03', '2026-06-03')).toBe(true);
  });

  it('rejects a due date before the invoice date', () => {
    expect(isOnOrAfter('2026-06-02', '2026-06-03')).toBe(false);
  });
});
