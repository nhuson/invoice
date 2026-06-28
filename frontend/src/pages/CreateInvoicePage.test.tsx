import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CreateInvoicePage } from './CreateInvoicePage';
import { createInvoice } from '../api/invoices';

vi.mock('../api/invoices', () => ({ createInvoice: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('../components/Toast', () => ({
  useToast: () => ({ notify: vi.fn() }),
}));

const createMock = vi.mocked(createInvoice);

function renderPage() {
  render(
    <MemoryRouter>
      <CreateInvoicePage />
    </MemoryRouter>,
  );
}

describe('CreateInvoicePage', () => {
  beforeEach(() => createMock.mockReset());

  it('blocks submission and shows errors when required fields are empty', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /create invoice/i }));

    expect(await screen.findByText(/customer name is required/i)).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('requires invoice and due dates before submitting', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/customer name/i), 'Paul');
    await userEvent.type(screen.getByLabelText(/customer email/i), 'paul@example.com');
    await userEvent.type(screen.getByLabelText(/invoice number/i), 'INV-1');
    await userEvent.type(screen.getByLabelText(/item name/i), 'Thing');

    await userEvent.click(screen.getByRole('button', { name: /create invoice/i }));

    expect(await screen.findByText(/invoice date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    await waitFor(() => expect(createMock).not.toHaveBeenCalled());
  });
});
