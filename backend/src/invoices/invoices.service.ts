import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceStatus, OVERDUE } from './invoice-status.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { computeTotals, deriveStatus, isOnOrAfter } from './invoices.logic';

const SORT_COLUMN: Record<string, string> = {
  invoiceDate: 'invoice.invoiceDate',
  dueDate: 'invoice.dueDate',
  totalAmount: 'invoice.totalAmount',
};

const DEFAULT_TAX = 10;
const DEFAULT_DISCOUNT = 0;

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoices: Repository<Invoice>,
  ) {}

  async create(dto: CreateInvoiceDto, userId: string) {
    if (!isOnOrAfter(dto.dueDate, dto.invoiceDate)) {
      throw new BadRequestException('dueDate must be on or after invoiceDate');
    }

    const existing = await this.invoices.findOne({
      where: { invoiceNumber: dto.invoiceNumber },
    });
    if (existing) {
      throw new ConflictException('Invoice number already exists');
    }

    const tax = dto.tax ?? DEFAULT_TAX;
    const discount = dto.discount ?? DEFAULT_DISCOUNT;
    const totals = computeTotals(dto.item.quantity, dto.item.rate, tax, discount);

    const item = new InvoiceItem();
    item.name = dto.item.name;
    item.quantity = dto.item.quantity;
    item.rate = dto.item.rate;

    const invoice = this.invoices.create({
      invoiceNumber: dto.invoiceNumber,
      invoiceReference: dto.invoiceReference,
      invoiceDate: dto.invoiceDate,
      dueDate: dto.dueDate,
      currency: dto.currency,
      currencySymbol: dto.currencySymbol ?? dto.currency,
      description: dto.description,
      status: InvoiceStatus.Draft,
      customerFullname: dto.customerName,
      customerEmail: dto.customerEmail,
      customerMobile: dto.customerMobile,
      customerAddress: dto.customerAddress,
      invoiceSubTotal: totals.invoiceSubTotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      totalAmount: totals.totalAmount,
      totalPaid: 0,
      balanceAmount: totals.totalAmount,
      createdBy: userId,
      items: [item],
    });

    try {
      const saved = await this.invoices.save(invoice);
      return this.toResponse(saved);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('Invoice number already exists');
      }
      throw err;
    }
  }

  async findOne(id: string) {
    const invoice = await this.invoices.findOne({ where: { invoiceId: id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.toResponse(invoice);
  }

  async findAll(query: QueryInvoicesDto) {
    const { page, pageSize, sortBy, ordering, status, keyword, fromDate, toDate } =
      query;
    const today = new Date().toISOString().slice(0, 10);

    const qb = this.invoices.createQueryBuilder('invoice');

    if (keyword) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('invoice.invoiceNumber ILIKE :kw', {
            kw: `%${keyword}%`,
          }).orWhere('invoice.customerFullname ILIKE :kw', { kw: `%${keyword}%` });
        }),
      );
    }

    if (status) {
      if (status === OVERDUE) {
        qb.andWhere('invoice.status != :paid', { paid: InvoiceStatus.Paid });
        qb.andWhere('invoice.dueDate < :today', { today });
      } else if (status === InvoiceStatus.Paid) {
        qb.andWhere('invoice.status = :paid', { paid: InvoiceStatus.Paid });
      } else {
        qb.andWhere('invoice.status = :status', { status });
        qb.andWhere('invoice.dueDate >= :today', { today });
      }
    }

    if (fromDate) {
      qb.andWhere('invoice.invoiceDate >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('invoice.invoiceDate <= :toDate', { toDate });
    }

    qb.orderBy(SORT_COLUMN[sortBy] ?? SORT_COLUMN.invoiceDate, ordering);
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((row) => this.toResponse(row)),
      paging: { page, pageSize, total },
    };
  }

  private toResponse(invoice: Invoice) {
    return {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceReference: invoice.invoiceReference,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      description: invoice.description,
      status: deriveStatus(invoice.status, invoice.dueDate),
      customerName: invoice.customerFullname,
      customerEmail: invoice.customerEmail,
      customerMobile: invoice.customerMobile,
      customerAddress: invoice.customerAddress,
      invoiceSubTotal: invoice.invoiceSubTotal,
      totalTax: invoice.totalTax,
      totalDiscount: invoice.totalDiscount,
      totalAmount: invoice.totalAmount,
      totalPaid: invoice.totalPaid,
      balanceAmount: invoice.balanceAmount,
      createdAt: invoice.createdAt,
      items: (invoice.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
      })),
    };
  }
}
