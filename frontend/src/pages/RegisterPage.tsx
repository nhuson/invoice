import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { extractErrorMessage } from '../api/client';

interface RegisterForm {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: RegisterForm) => {
    setFormError('');
    setSubmitting(true);
    try {
      await register({
        fullname: values.fullname.trim(),
        email: values.email,
        password: values.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          Create your account
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Start managing your invoices in a minute
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
            label="Full name"
            name="fullname"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input autoComplete="name" placeholder="Jane Doe" />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value === getFieldValue('password')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            Create account
          </Button>
        </Form>

        <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
