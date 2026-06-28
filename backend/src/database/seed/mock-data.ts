import { InvoiceStatus } from '../../invoices/invoice-status.enum';
import { computeTotals } from '../../invoices/invoices.logic';

export interface SeedItem {
  name: string;
  quantity: number;
  rate: number;
}

export interface SeedInvoice {
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description?: string;
  status: InvoiceStatus;
  customerFullname: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  item: SeedItem;
  tax: number;
  discount: number;
  totalPaid: number;
}

const CURRENCIES = [
  { code: 'AUD', symbol: 'AU$' },
  { code: 'USD', symbol: 'US$' },
  { code: 'GBP', symbol: '£' },
  { code: 'SGD', symbol: 'S$' },
];

const CUSTOMERS = [
  { name: 'Paul Anderson', email: 'paul@101digital.io', city: 'Singapore' },
  { name: 'Mei Ling', email: 'mei.ling@example.com', city: 'Kuala Lumpur' },
  { name: 'James Carter', email: 'james.carter@example.com', city: 'Sydney' },
  { name: 'Aisha Rahman', email: 'aisha.rahman@example.com', city: 'Dubai' },
  { name: 'Diego Fernandez', email: 'diego.f@example.com', city: 'Madrid' },
  { name: 'Hannah Schmidt', email: 'hannah.s@example.com', city: 'Berlin' },
  { name: 'Kenji Tanaka', email: 'kenji.tanaka@example.com', city: 'Tokyo' },
  { name: 'Olivia Brown', email: 'olivia.brown@example.com', city: 'London' },
  { name: 'Raj Patel', email: 'raj.patel@example.com', city: 'Mumbai' },
  { name: 'Sofia Rossi', email: 'sofia.rossi@example.com', city: 'Rome' },
  { name: 'Liam Nguyen', email: 'liam.nguyen@example.com', city: 'Ho Chi Minh City' },
  { name: 'Emma Wilson', email: 'emma.wilson@example.com', city: 'Auckland' },
];

const PRODUCTS = [
  'Honda RC150',
  'Annual Support Plan',
  'Web Design Package',
  'Cloud Hosting (12 months)',
  'Consulting Services',
  'Office Chairs',
  'Marketing Retainer',
  'Software License',
  'Logistics Service',
  'Hardware Bundle',
];

const STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Draft,
  InvoiceStatus.Pending,
  InvoiceStatus.Paid,
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const APPENDIX_INVOICE: SeedInvoice = {
  invoiceNumber: 'IV1780488206995',
  invoiceReference: '#5721662',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  currencySymbol: 'AU$',
  description: 'Invoice is issued to Kanglee',
  status: InvoiceStatus.Pending,
  customerFullname: 'Paul',
  customerEmail: 'paul@101digital.io',
  customerMobile: '947717364111',
  customerAddress: 'Singapore',
  item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
  tax: 10,
  discount: 20,
  totalPaid: 1451.34,
};

export function buildSeedInvoices(count = 40): SeedInvoice[] {
  const invoices: SeedInvoice[] = [APPENDIX_INVOICE];
  const today = new Date();

  for (let i = 0; i < count; i += 1) {
    const customer = pick(CUSTOMERS, i);
    const currency = pick(CURRENCIES, i);
    const status = pick(STATUSES, i);
    const quantity = (i % 5) + 1;
    const rate = 50 + (i % 12) * 75;
    const tax = i % 4 === 0 ? 0 : 10;
    const discount = i % 3 === 0 ? (i % 5) * 10 : 0;

    // Spread invoice dates across the past ~5 months.
    const invoiceDate = addDays(today, -(i * 4) - 1);
    // Mix of overdue and upcoming due dates relative to today.
    const dueOffset = i % 3 === 0 ? -((i % 7) + 2) : (i % 9) + 5;
    const dueBase = new Date(invoiceDate);
    const dueDate = addDays(dueBase, 25 + dueOffset);

    const totals = computeTotals(quantity, rate, tax, discount);
    const totalPaid =
      status === InvoiceStatus.Paid
        ? totals.totalAmount
        : i % 2 === 0
          ? Math.round(totals.totalAmount * 0.4 * 100) / 100
          : 0;

    invoices.push({
      invoiceNumber: `INV-2026-${String(1000 + i)}`,
      invoiceReference: i % 2 === 0 ? `#REF${4000 + i}` : undefined,
      invoiceDate,
      dueDate,
      currency: currency.code,
      currencySymbol: currency.symbol,
      description: `Invoice for ${pick(PRODUCTS, i)}`,
      status,
      customerFullname: customer.name,
      customerEmail: customer.email,
      customerMobile: `+6591${String(100000 + i).slice(-6)}`,
      customerAddress: customer.city,
      item: { name: pick(PRODUCTS, i), quantity, rate },
      tax,
      discount,
      totalPaid,
    });
  }

  return invoices;
}
