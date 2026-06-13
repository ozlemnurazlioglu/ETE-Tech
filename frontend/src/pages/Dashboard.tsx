import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Spin, Typography, message } from 'antd';
import { AppstoreOutlined, BankOutlined, BarChartOutlined, StarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../api/api';

const { Title, Text } = Typography;

interface Stats {
  totalCompanies: number;
  totalProducts: number;
  latestCompanies: any[];
  latestProducts: any[];
  categoryStats: any[];
  categoryAmountStats: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error(error);
      message.error('An error occurred while loading statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading statistics..." />
      </div>
    );
  }

  // Map charts data
  const categoryChartData = stats.categoryStats.map((item) => ({
    name: item.category,
    'Product Count': parseInt(item.count, 10),
  }));

  const amountChartData = stats.categoryAmountStats.map((item) => ({
    name: item.category,
    value: parseFloat(item.totalAmount),
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Overview of system statistics and analytical reports</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={12}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Total Companies</span>}
              value={stats.totalCompanies}
              prefix={<BankOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Total Products</span>}
              value={stats.totalProducts}
              prefix={<AppstoreOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Visual Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={<span><BarChartOutlined style={{ marginRight: 8 }} />Product Counts by Category</span>} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <div style={{ width: '100%', height: 300 }}>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Product Count" fill="#1890ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Text type="secondary">No product data available yet.</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<span><StarOutlined style={{ marginRight: 8 }} />Product Quantity Distribution by Category</span>} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <div style={{ width: '100%', height: 300 }}>
              {amountChartData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={amountChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {amountChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Units`, 'Total Quantity']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Text type="secondary">No quantity data available yet.</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Latest Added Lists */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="3 Latest Added Companies" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <List
              itemLayout="horizontal"
              dataSource={stats.latestCompanies}
              renderItem={(company) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} icon={<BankOutlined />} />}
                    title={company.name}
                    description={
                      <div>
                        <Text type="secondary">Legal No: {company.legalNumber}</Text>
                        <br />
                        <Text type="secondary">Country: {company.incorporationCountry}</Text>
                      </div>
                    }
                  />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(company.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="3 Latest Added Products" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
            <List
              itemLayout="horizontal"
              dataSource={stats.latestProducts}
              renderItem={(product) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#f6ffed', color: '#52c41a' }} icon={<AppstoreOutlined />} />}
                    title={product.name}
                    description={
                      <div>
                        <Text type="secondary">Category: {product.category}</Text>
                        <br />
                        <Text type="secondary">Quantity: {product.amount} {product.amountUnit}</Text>
                        {product.company && (
                          <div>
                            <Text type="secondary">Company: {product.company.name}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(product.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
