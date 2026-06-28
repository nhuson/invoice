import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Input, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { listInvoices } from '../api/invoices';
import { extractErrorMessage } from '../api/client';
import { Invoice, InvoiceQuery, InvoiceStatus } from '../types/invoice';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatMoney } from '../utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

const SORT_OPTIONS = [
  { value: 'invoiceDate', label: 'Sort: Invoice date' },
  { value: 'dueDate', label: 'Sort: Due date' },
  { value: 'totalAmount', label: 'Sort: Total amount' },
];

const ORDER_OPTIONS = [
  { value: 'DESC', label: 'Descending' },
  { value: 'ASC', label: 'Ascending' },
];

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [keywordInput, setKeywordInput] = useState('');
  const [query, setQuery] = useState<InvoiceQuery>({
    page: 1,
    pageSize: 10,
    sortBy: 'invoiceDate',
    ordering: 'DESC',
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery((q) => ({ ...q, keyword: keywordInput.trim() || undefined, page: 1 }));
    }, 350);
    return () => clearTimeout(handle);
  }, [keywordInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listInvoices(query)
      .then((result) => {
        if (!active) return;
        setInvoices(result.data);
        setTotal(result.paging.total);
      })
      .catch((err) => active && setError(extractErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query]);

  const update = (patch: Partial<InvoiceQuery>) =>
    setQuery((q) => ({ ...q, page: 1, ...patch }));

  const columns: ColumnsType<Invoice> = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Invoice date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Due date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (value: number, row) => formatMoney(value, row.currencySymbol),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: InvoiceStatus) => <StatusBadge status={value} />,
    },
  ];

  return (
    <section className="list-page">
      <div className="page-heading">
        <Typography.Title level={3} style={{ margin: 0 }}>
          Invoices
        </Typography.Title>
      </div>

      <Space wrap className="toolbar" size="middle">
        <Input.Search
          allowClear
          placeholder="Search by invoice number or customer"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          value={query.status ?? ''}
          options={STATUS_OPTIONS}
          style={{ width: 160 }}
          onChange={(value) =>
            update({ status: (value || undefined) as InvoiceStatus | undefined })
          }
        />
        <Select
          value={query.sortBy}
          options={SORT_OPTIONS}
          style={{ width: 190 }}
          onChange={(value) => update({ sortBy: value as InvoiceQuery['sortBy'] })}
        />
        <Select
          value={query.ordering}
          options={ORDER_OPTIONS}
          style={{ width: 150 }}
          onChange={(value) => update({ ordering: value as 'ASC' | 'DESC' })}
        />
      </Space>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <Table<Invoice>
        rowKey="invoiceId"
        columns={columns}
        dataSource={invoices}
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/invoices/${record.invoiceId}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (count, range) => `${range[0]}–${range[1]} of ${count}`,
          onChange: (page, pageSize) =>
            setQuery((q) => ({ ...q, page, pageSize })),
        }}
      />
    </section>
  );
}
