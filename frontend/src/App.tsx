import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<InvoiceListPage />} />
        <Route path="/invoices/new" element={<CreateInvoicePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
