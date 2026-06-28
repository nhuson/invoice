export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description?: string;
  status: InvoiceStatus;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  createdAt: string;
  items: InvoiceItem[];
}

export interface Paging {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedInvoices {
  data: Invoice[];
  paging: Paging;
}

export interface InvoiceQuery {
  page: number;
  pageSize: number;
  sortBy: 'invoiceDate' | 'dueDate' | 'totalAmount';
  ordering: 'ASC' | 'DESC';
  status?: InvoiceStatus;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateInvoicePayload {
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol?: string;
  description?: string;
  item: {
    name: string;
    quantity: number;
    rate: number;
  };
  tax?: number;
  discount?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
}
