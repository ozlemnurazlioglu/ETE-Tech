import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Avatar, Typography } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Products from './pages/Products';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get active menu key based on pathname
  const activeKey = location.pathname === '/' ? '1' : location.pathname === '/companies' ? '2' : '3';

  // Parse user info
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { username: 'User' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" style={{
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        zIndex: 10,
      }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#001529',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h1 style={{
            color: '#fff',
            margin: 0,
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}>
            {collapsed ? '⚡' : 'ETE Tech'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: <Link to="/">Dashboard</Link>,
            },
            {
              key: '2',
              icon: <BankOutlined />,
              label: <Link to="/companies">Companies</Link>,
            },
            {
              key: '3',
              icon: <AppstoreOutlined />,
              label: <Link to="/products">Products</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 9,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space size="large">
            <Space>
              <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              <Text style={{ fontWeight: 500 }}>{user.username}</Text>
            </Space>
            <Button
              type="primary"
              danger
              ghost
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          background: '#f5f5f5',
          minHeight: 280,
          overflow: 'initial',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Views */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/companies" element={
          <ProtectedRoute>
            <AppLayout>
              <Companies />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <AppLayout>
              <Products />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Link to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
