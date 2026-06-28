import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Honda RC150' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 1000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  rate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'Paul' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  @IsEmail()
  customerEmail: string;

  @ApiPropertyOptional({ example: '947717364111' })
  @IsOptional()
  @IsString()
  customerMobile?: string;

  @ApiPropertyOptional({ example: 'Singapore' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiProperty({ example: 'IV1780488206995' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  @IsOptional()
  @IsString()
  invoiceReference?: string;

  @ApiProperty({ example: '2026-06-03' })
  @IsISO8601()
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03' })
  @IsISO8601()
  dueDate: string;

  @ApiProperty({ example: 'AUD' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({ example: 'AU$' })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @ApiPropertyOptional({ example: 'Invoice is issued to Kanglee' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: CreateInvoiceItemDto })
  @ValidateNested()
  @Type(() => CreateInvoiceItemDto)
  item: CreateInvoiceItemDto;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;
}
