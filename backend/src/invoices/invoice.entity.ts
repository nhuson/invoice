import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceStatus } from './invoice-status.enum';

const decimal = {
  type: 'numeric' as const,
  precision: 14,
  scale: 2,
  transformer: {
    to: (value?: number) => value,
    from: (value?: string) => (value === null || value === undefined ? value : Number(value)),
  },
};

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' })
  invoiceId: string;

  @Index({ unique: true })
  @Column({ name: 'invoice_number' })
  invoiceNumber: string;

  @Column({ name: 'invoice_reference', nullable: true })
  invoiceReference?: string;

  @Index()
  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Index()
  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column()
  currency: string;

  @Column({ name: 'currency_symbol' })
  currencySymbol: string;

  @Column({ nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.Draft })
  status: InvoiceStatus;

  @Index()
  @Column({ name: 'customer_fullname' })
  customerFullname: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_mobile', nullable: true })
  customerMobile?: string;

  @Column({ name: 'customer_address', nullable: true })
  customerAddress?: string;

  @Column({ name: 'invoice_sub_total', ...decimal })
  invoiceSubTotal: number;

  @Column({ name: 'total_tax', ...decimal })
  totalTax: number;

  @Column({ name: 'total_discount', ...decimal })
  totalDiscount: number;

  @Index()
  @Column({ name: 'total_amount', ...decimal })
  totalAmount: number;

  @Column({ name: 'total_paid', ...decimal, default: 0 })
  totalPaid: number;

  @Column({ name: 'balance_amount', ...decimal })
  balanceAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items: InvoiceItem[];
}
