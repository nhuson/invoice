import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from './invoice.entity';
import { InvoiceStatus } from './invoice-status.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

function baseDto(): CreateInvoiceDto {
  return {
    customerName: 'Paul',
    customerEmail: 'paul@101digital.io',
    invoiceNumber: 'IV-001',
    invoiceDate: '2026-06-03',
    dueDate: '2026-07-03',
    currency: 'AUD',
    item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
    tax: 10,
    discount: 20,
  } as CreateInvoiceDto;
}

describe('InvoicesService', () => {
  let service: InvoicesService;
  let repo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ invoiceId: 'uuid-1', items: [], ...v })),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(InvoicesService);
  });

  it('computes totals on the server when creating an invoice', async () => {
    repo.findOne.mockResolvedValue(null);
    const result = await service.create(baseDto(), 'user-1');

    expect(result.invoiceSubTotal).toBe(2000);
    expect(result.totalTax).toBe(200);
    expect(result.totalAmount).toBe(2180);
    expect(result.balanceAmount).toBe(2180);
    expect(result.status).toBeDefined();
    const saved = repo.save.mock.calls[0][0];
    expect(saved.status).toBe(InvoiceStatus.Draft);
    expect(saved.totalPaid).toBe(0);
  });

  it('rejects a due date before the invoice date', async () => {
    const dto = baseDto();
    dto.dueDate = '2026-06-01';
    await expect(service.create(dto, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a duplicate invoice number found up-front', async () => {
    repo.findOne.mockResolvedValue({ invoiceId: 'existing' });
    await expect(service.create(baseDto(), 'user-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('maps a unique-constraint violation to a conflict', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.create(baseDto(), 'user-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws NotFound when an invoice does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
