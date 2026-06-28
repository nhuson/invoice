import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Layout as AntLayout, Menu, Space, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Header, Content } = AntLayout;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const selectedKey = location.pathname.startsWith('/invoices/new')
    ? '/invoices/new'
    : '/';

  return (
    <AntLayout className="app-shell">
      <Header className="app-header">
        <Link to="/" className="brand">
          SimpleInvoice
        </Link>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[selectedKey]}
          className="app-nav"
          items={[
            { key: '/', label: <Link to="/">Invoices</Link> },
            { key: '/invoices/new', label: <Link to="/invoices/new">New invoice</Link> },
          ]}
        />
        <Space>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {user?.fullname}
          </Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Log out
          </Button>
        </Space>
      </Header>
      <Content className="app-main">
        <Outlet />
      </Content>
    </AntLayout>
  );
}
