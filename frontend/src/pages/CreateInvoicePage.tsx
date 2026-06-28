import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import { createInvoice } from '../api/invoices';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';

interface FormValues {
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: Dayjs;
  dueDate: Dayjs;
  currency: string;
  description?: string;
  itemName: string;
  quantity: number;
  rate: number;
  tax: number;
  discount: number;
}

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form] = Form.useForm<FormValues>();

  const handleFinish = async (values: FormValues) => {
    try {
      await createInvoice({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerMobile: values.customerMobile || undefined,
        customerAddress: values.customerAddress || undefined,
        invoiceNumber: values.invoiceNumber,
        invoiceReference: values.invoiceReference || undefined,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        currency: values.currency.toUpperCase(),
        description: values.description || undefined,
        item: {
          name: values.itemName,
          quantity: Number(values.quantity),
          rate: Number(values.rate),
        },
        tax: Number(values.tax),
        discount: Number(values.discount),
      });
      notify('success', 'Invoice created successfully');
      navigate('/');
    } catch (err) {
      const message = extractErrorMessage(err, 'Failed to create invoice');
      if (message.toLowerCase().includes('invoice number')) {
        form.setFields([{ name: 'invoiceNumber', errors: [message] }]);
      }
      notify('error', message);
    }
  };

  return (
    <section className="form-page">
      <Typography.Title level={3}>Create invoice</Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ currency: 'AUD', tax: 10, discount: 0, quantity: 1 }}
      >
        <Card title="Customer" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Customer name"
                name="customerName"
                rules={[{ required: true, message: 'Customer name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Customer email"
                name="customerEmail"
                rules={[
                  { required: true, message: 'Customer email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mobile" name="customerMobile">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Address" name="customerAddress">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Invoice" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Invoice number"
                name="invoiceNumber"
                rules={[{ required: true, message: 'Invoice number is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Reference" name="invoiceReference">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Invoice date"
                name="invoiceDate"
                rules={[{ required: true, message: 'Invoice date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Due date"
                name="dueDate"
                dependencies={['invoiceDate']}
                rules={[
                  { required: true, message: 'Due date is required' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const invoiceDate = getFieldValue('invoiceDate');
                      if (!value || !invoiceDate || !value.isBefore(invoiceDate, 'day')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Due date must be on or after invoice date'),
                      );
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Currency"
                name="currency"
                rules={[
                  { required: true, message: 'Currency is required' },
                  { len: 3, message: 'Use a 3-letter code' },
                ]}
              >
                <Input maxLength={3} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Description" name="description">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Line item" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Item name"
                name="itemName"
                rules={[{ required: true, message: 'Item name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[
                  { required: true, message: 'Quantity is required' },
                  {
                    type: 'integer',
                    min: 1,
                    message: 'Quantity must be a positive integer',
                  },
                ]}
              >
                <InputNumber min={1} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Rate"
                name="rate"
                rules={[
                  { required: true, message: 'Rate is required' },
                  { type: 'number', min: 0.01, message: 'Rate must be a positive number' },
                ]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Tax (%)"
                name="tax"
                rules={[{ type: 'number', min: 0, message: 'Tax cannot be negative' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Discount"
                name="discount"
                rules={[
                  { type: 'number', min: 0, message: 'Discount cannot be negative' },
                ]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Create invoice
          </Button>
        </Space>
      </Form>
    </section>
  );
}
