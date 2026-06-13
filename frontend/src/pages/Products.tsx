import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Space, Card, Modal, Form, Popconfirm, Select, InputNumber, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProductType {
  id: number;
  name: string;
  category: string;
  amount: number;
  amountUnit: string;
  companyId: number;
  company?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface CompanyDropdownType {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const [data, setData] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<number | undefined>(undefined);
  const [companies, setCompanies] = useState<CompanyDropdownType[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch all companies for dropdown selection (filtering and mapping)
  const fetchCompaniesDropdown = async () => {
    try {
      const response = await api.get('/api/companies', {
        params: { limit: 1000 }, // Fetch all for dropdown
      });
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Could not fetch companies list:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const order = sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : '';
      const response = await api.get('/api/products', {
        params: {
          search,
          companyId: selectedCompanyFilter,
          page: pagination.current,
          limit: pagination.pageSize,
          sortBy: sorter.field,
          sortOrder: order,
        },
      });

      setData(response.data.products);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error(error);
      message.error('An error occurred while listing products.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCompanyFilter, pagination.current, pagination.pageSize, sorter.field, sorter.order]);

  useEffect(() => {
    fetchProducts();
    fetchCompaniesDropdown();
  }, [fetchProducts]);

  const handleTableChange = (
    newPagination: any,
    _filters: any,
    newSorter: any
  ) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    setSorter({
      field: newSorter.field as string,
      order: newSorter.order,
    });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCompanyFilterChange = (value: number | undefined) => {
    setSelectedCompanyFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openAddModal = () => {
    if (companies.length === 0) {
      message.warning('You must add at least one company before adding products.');
      return;
    }
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: ProductType) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      companyId: record.companyId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/products/${id}`);
      message.success('Product deleted successfully.');
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Product could not be deleted.';
      message.error(errorMsg);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, values);
        message.success('Product updated successfully.');
      } else {
        await api.post('/api/products', values);
        message.success('Product added successfully.');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'An error occurred during operation.';
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      render: (_val: number, record: ProductType) => (
        <span>{record.amount} {record.amountUnit}</span>
      ),
    },
    {
      title: 'Associated Company',
      dataIndex: ['company', 'name'],
      key: 'company.name',
      sorter: true,
      render: (_: any, record: ProductType) => (
        <span>{record.company?.name || 'Unknown Company'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: ProductType) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Product Management</Title>
          <Text type="secondary">You can list, add or update all products in the system.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add New Product
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
        {/* Filters */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search product name, category or unit..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />

          <Select
            placeholder="Filter by Company"
            allowClear
            value={selectedCompanyFilter}
            onChange={handleCompanyFilterChange}
            style={{ width: 220 }}
            suffixIcon={<FilterOutlined />}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          rowKey="id"
          dataSource={data}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={editingId ? 'Edit Product' : 'Add New Product'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ name: '', category: '', amount: 1, amountUnit: '', companyId: undefined }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please input the product name!' }]}
          >
            <Input placeholder="e.g. Laptop" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input the product category!' }]}
          >
            <Input placeholder="e.g. Electronics" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Quantity"
                rules={[{ required: true, message: 'Please input the product quantity!' }]}
              >
                <InputNumber min={0.01} style={{ width: '100%' }} placeholder="e.g. 50" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amountUnit"
                label="Quantity Unit"
                rules={[{ required: true, message: 'Please input the quantity unit!' }]}
              >
                <Input placeholder="e.g. Pieces, KG, Box" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="companyId"
            label="Manufacturer Company"
            rules={[{ required: true, message: 'Please select the company associated with the product!' }]}
          >
            <Select placeholder="Select Company">
              {companies.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
