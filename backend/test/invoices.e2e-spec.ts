import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { User } from '../src/users/user.entity';
import { Invoice } from '../src/invoices/invoice.entity';
import { InvoiceItem } from '../src/invoices/invoice-item.entity';

describe('Invoices flow (e2e)', () => {
  let app: INestApplication;
  let users: Repository<User>;
  let invoices: Repository<Invoice>;
  let items: Repository<InvoiceItem>;
  let token: string;

  const credentials = { email: 'e2e@101digital.io', password: 'Password123' };
  const newAccount = {
    fullname: 'New Signup',
    email: 'e2e-signup@101digital.io',
    password: 'Password123',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    users = moduleRef.get(getRepositoryToken(User));
    invoices = moduleRef.get(getRepositoryToken(Invoice));
    items = moduleRef.get(getRepositoryToken(InvoiceItem));

    await items.createQueryBuilder().delete().execute();
    await invoices.createQueryBuilder().delete().execute();
    await users.delete({ email: credentials.email });
    await users.delete({ email: newAccount.email });

    await users.save(
      users.create({
        email: credentials.email,
        passwordHash: await bcrypt.hash(credentials.password, 10),
        fullname: 'E2E User',
      }),
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers a new account and returns a usable token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newAccount)
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(newAccount.email);

    await request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .expect(200);
  });

  it('rejects registering an email that already exists with 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(newAccount)
      .expect(409);
  });

  it('logs in and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
  });

  it('rejects unauthenticated access to invoices', async () => {
    await request(app.getHttpServer()).get('/invoices').expect(401);
  });

  it('creates an invoice and finds it in the list', async () => {
    const invoiceNumber = `E2E-${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'E2E Customer',
        customerEmail: 'customer@example.com',
        invoiceNumber,
        invoiceDate: '2026-06-03',
        dueDate: '2026-07-03',
        currency: 'AUD',
        item: { name: 'Test item', quantity: 2, rate: 1000 },
        tax: 10,
        discount: 20,
      })
      .expect(201);

    expect(created.body.status).toBe('Draft');
    expect(created.body.totalAmount).toBe(2180);

    const list = await request(app.getHttpServer())
      .get(`/invoices?keyword=${invoiceNumber}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.paging.total).toBe(1);
    expect(list.body.data[0].invoiceNumber).toBe(invoiceNumber);
  });

  it('rejects a duplicate invoice number with 409', async () => {
    const invoiceNumber = `E2E-DUP-${Date.now()}`;
    const payload = {
      customerName: 'Dup',
      customerEmail: 'dup@example.com',
      invoiceNumber,
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
      currency: 'AUD',
      item: { name: 'Test', quantity: 1, rate: 100 },
    };

    await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(409);
  });
});
