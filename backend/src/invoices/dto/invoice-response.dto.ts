import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
}

export class InvoiceResponseDto {
  @ApiProperty() invoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty({ required: false }) invoiceReference?: string;
  @ApiProperty() invoiceDate: string;
  @ApiProperty() dueDate: string;
  @ApiProperty() currency: string;
  @ApiProperty() currencySymbol: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ enum: ['Draft', 'Pending', 'Paid', 'Overdue'] }) status: string;

  @ApiProperty() customerName: string;
  @ApiProperty() customerEmail: string;
  @ApiProperty({ required: false }) customerMobile?: string;
  @ApiProperty({ required: false }) customerAddress?: string;

  @ApiProperty() invoiceSubTotal: number;
  @ApiProperty() totalTax: number;
  @ApiProperty() totalDiscount: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() totalPaid: number;
  @ApiProperty() balanceAmount: number;

  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];
}

export class PagingDto {
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() total: number;
}

export class PaginatedInvoicesDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  data: InvoiceResponseDto[];

  @ApiProperty({ type: PagingDto })
  paging: PagingDto;
}
