import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { buildDataSourceOptions } from '../data-source-options';
import { User } from '../../users/user.entity';
import { Invoice } from '../../invoices/invoice.entity';
import { InvoiceItem } from '../../invoices/invoice-item.entity';
import { computeTotals } from '../../invoices/invoices.logic';
import { buildSeedInvoices } from './mock-data';

async function run() {
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const invoices = dataSource.getRepository(Invoice);
  const items = dataSource.getRepository(InvoiceItem);

  await items.createQueryBuilder().delete().execute();
  await invoices.createQueryBuilder().delete().execute();
  await users.createQueryBuilder().delete().execute();

  const email = process.env.SEED_USER_EMAIL ?? 'reviewer@101digital.io';
  const password = process.env.SEED_USER_PASSWORD ?? 'Password123';
  const fullname = process.env.SEED_USER_FULLNAME ?? 'Reviewer';

  const user = await users.save(
    users.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      fullname,
    }),
  );

  const seedInvoices = buildSeedInvoices(40);

  for (const seed of seedInvoices) {
    const totals = computeTotals(
      seed.item.quantity,
      seed.item.rate,
      seed.tax,
      seed.discount,
    );
    const item = items.create({
      name: seed.item.name,
      quantity: seed.item.quantity,
      rate: seed.item.rate,
    });
    await invoices.save(
      invoices.create({
        invoiceNumber: seed.invoiceNumber,
        invoiceReference: seed.invoiceReference,
        invoiceDate: seed.invoiceDate,
        dueDate: seed.dueDate,
        currency: seed.currency,
        currencySymbol: seed.currencySymbol,
        description: seed.description,
        status: seed.status,
        customerFullname: seed.customerFullname,
        customerEmail: seed.customerEmail,
        customerMobile: seed.customerMobile,
        customerAddress: seed.customerAddress,
        invoiceSubTotal: totals.invoiceSubTotal,
        totalTax: totals.totalTax,
        totalDiscount: totals.totalDiscount,
        totalAmount: totals.totalAmount,
        totalPaid: seed.totalPaid,
        balanceAmount:
          Math.round((totals.totalAmount - seed.totalPaid) * 100) / 100,
        createdBy: user.id,
        items: [item],
      }),
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${seedInvoices.length} invoices and 1 user (${email}).`,
  );

  await dataSource.destroy();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
