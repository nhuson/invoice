import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoicesDto,
} from './dto/invoice-response.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices with search, filter, sort and pagination' })
  @ApiOkResponse({ type: PaginatedInvoicesDto })
  findAll(@Query() query: QueryInvoicesDto) {
    return this.invoices.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice by id' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.invoices.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice (always created as Draft)' })
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: AuthUser) {
    return this.invoices.create(dto, user.id);
  }
}
