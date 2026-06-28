import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { buildDataSourceOptions } from './database/data-source-options';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot(buildDataSourceOptions()),
    UsersModule,
    AuthModule,
    InvoicesModule,
  ],
})
export class AppModule {}
