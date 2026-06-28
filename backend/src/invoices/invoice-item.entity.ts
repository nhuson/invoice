import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: {
      to: (value?: number) => value,
      from: (value?: string) => (value === null || value === undefined ? value : Number(value)),
    },
  })
  rate: number;
}
