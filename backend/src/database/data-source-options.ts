import { DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';

export function buildDataSourceOptions(): DataSourceOptions {
  const common = {
    type: 'postgres' as const,
    entities: [User, Invoice, InvoiceItem],
    synchronize: true,
    logging: false,
  };

  if (process.env.DATABASE_URL) {
    return { ...common, url: process.env.DATABASE_URL };
  }

  return {
    ...common,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'simple_invoice',
  };
}
