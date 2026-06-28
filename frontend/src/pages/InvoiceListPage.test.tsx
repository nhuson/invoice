import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { InvoiceListPage } from './InvoiceListPage';
import { listInvoices } from '../api/invoices';
import { Invoice } from '../types/invoice';

vi.mock('../api/invoices', () => ({
  listInvoices: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return { ...actual, useNavigate: () => vi.fn() };
});

const listMock = vi.mocked(listInvoices);

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    invoiceId: 'id-1',
    invoiceNumber: 'INV-1001',
    invoiceDate: '2026-06-03',
    dueDate: '2026-07-03',
    currency: 'AUD',
    currencySymbol: 'AU$',
    status: 'Pending',
    customerName: 'Paul Anderson',
    customerEmail: 'paul@example.com',
    invoiceSubTotal: 2000,
    totalTax: 200,
    totalDiscount: 20,
    totalAmount: 2180,
    totalPaid: 0,
    balanceAmount: 2180,
    createdAt: '2026-06-03T00:00:00Z',
    items: [],
    ...overrides,
  };
}

describe('InvoiceListPage', () => {
  beforeEach(() => listMock.mockReset());

  it('renders invoices returned by the API', async () => {
    listMock.mockResolvedValue({
      data: [makeInvoice()],
      paging: { page: 1, pageSize: 10, total: 1 },
    });

    render(
      <MemoryRouter>
        <InvoiceListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('INV-1001')).toBeInTheDocument();
    expect(screen.getByText('Paul Anderson')).toBeInTheDocument();
    expect(screen.getByText('Pending', { selector: '.ant-tag' })).toBeInTheDocument();
  });

  it('refetches with a keyword when the search box changes', async () => {
    listMock.mockResolvedValue({
      data: [makeInvoice()],
      paging: { page: 1, pageSize: 10, total: 1 },
    });

    render(
      <MemoryRouter>
        <InvoiceListPage />
      </MemoryRouter>,
    );

    await screen.findByText('INV-1001');

    await userEvent.type(
      screen.getByPlaceholderText(/search by invoice number/i),
      'Anderson',
    );

    await waitFor(() =>
      expect(listMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: 'Anderson' }),
      ),
    );
  });
});
