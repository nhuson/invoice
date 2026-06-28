import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './styles/global.css';

const theme = {
  token: {
    colorPrimary: '#2563eb',
    borderRadius: 8,
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
