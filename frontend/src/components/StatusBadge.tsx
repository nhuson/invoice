import { Tag } from 'antd';
import { InvoiceStatus } from '../types/invoice';

const COLOR: Record<InvoiceStatus, string> = {
  Draft: 'default',
  Pending: 'gold',
  Paid: 'green',
  Overdue: 'red',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Tag color={COLOR[status]}>{status}</Tag>;
}
