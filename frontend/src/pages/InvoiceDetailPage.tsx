import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getInvoice } from '../api/invoices';
import { extractErrorMessage } from '../api/client';
import { Invoice, InvoiceItem } from '../types/invoice';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatMoney } from '../utils/format';

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInvoice(id)
      .then((data) => active && setInvoice(data))
      .catch((err) => active && setError(extractErrorMessage(err, 'Invoice not found')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <Spin />
      </div>
    );
  }
  if (error) return <Alert type="error" message={error} showIcon />;
  if (!invoice) return null;

  const symbol = invoice.currencySymbol;

  const itemColumns: ColumnsType<InvoiceItem> = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      align: 'right',
      render: (value: number) => formatMoney(value, symbol),
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'right',
      render: (_, row) => formatMoney(row.quantity * row.rate, symbol),
    },
  ];

  const totalRow = (label: string, value: string, strong = false, accent = false) => (
    <div className="totals-row">
      <Typography.Text strong={strong}>{label}</Typography.Text>
      <Typography.Text strong={strong} type={accent ? 'success' : undefined}>
        {value}
      </Typography.Text>
    </div>
  );

  return (
    <section className="detail-page">
      <Link to="/" className="back-link">
        <Space size={4}>
          <ArrowLeftOutlined /> Back to invoices
        </Space>
      </Link>

      <div className="detail-header">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {invoice.invoiceNumber}
          </Typography.Title>
          {invoice.invoiceReference && (
            <Typography.Text type="secondary">
              Ref: {invoice.invoiceReference}
            </Typography.Text>
          )}
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Invoice" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Invoice date">
                {formatDate(invoice.invoiceDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Due date">
                {formatDate(invoice.dueDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Currency">
                {invoice.currency} ({symbol})
              </Descriptions.Item>
              {invoice.description && (
                <Descriptions.Item label="Description">
                  {invoice.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Customer" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{invoice.customerName}</Descriptions.Item>
              <Descriptions.Item label="Email">{invoice.customerEmail}</Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {invoice.customerMobile || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {invoice.customerAddress || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Line items" size="small">
        <Table<InvoiceItem>
          rowKey="id"
          columns={itemColumns}
          dataSource={invoice.items}
          pagination={false}
          size="small"
        />

        <Divider />

        <div className="totals">
          {totalRow('Subtotal', formatMoney(invoice.invoiceSubTotal, symbol))}
          {totalRow('Tax', formatMoney(invoice.totalTax, symbol))}
          {totalRow('Discount', `-${formatMoney(invoice.totalDiscount, symbol)}`)}
          <Divider style={{ margin: '8px 0' }} />
          {totalRow('Total', formatMoney(invoice.totalAmount, symbol), true)}
          {totalRow('Paid', formatMoney(invoice.totalPaid, symbol))}
          {totalRow(
            'Balance due',
            formatMoney(invoice.balanceAmount, symbol),
            true,
            true,
          )}
        </div>
      </Card>
    </section>
  );
}
