import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { InvoiceStatus, OVERDUE } from '../invoice-status.enum';

export const SORTABLE_FIELDS = ['invoiceDate', 'dueDate', 'totalAmount'] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

export class QueryInvoicesDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'invoiceDate' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy: SortableField = 'invoiceDate';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  ordering: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ enum: [...Object.values(InvoiceStatus), OVERDUE] })
  @IsOptional()
  @IsEnum({ ...InvoiceStatus, Overdue: OVERDUE } as Record<string, string>, {
    message: 'status must be one of Draft, Pending, Paid, Overdue',
  })
  status?: InvoiceStatus | typeof OVERDUE;

  @ApiPropertyOptional({ description: 'Search invoice number or customer name' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Invoices on/after this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Invoices on/before this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsISO8601()
  toDate?: string;
}
