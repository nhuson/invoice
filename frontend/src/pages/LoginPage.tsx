import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { extractErrorMessage } from '../api/client';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: LoginForm) => {
    setFormError('');
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Invalid email or password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          SimpleInvoice
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Sign in to manage your invoices
        </Typography.Paragraph>

        {formError && (
          <Alert
            type="error"
            message={formError}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input type="email" autoComplete="username" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            Sign in
          </Button>
        </Form>

        <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
