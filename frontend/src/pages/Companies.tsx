import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Space, Card, Modal, Form, Popconfirm, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title, Text } = Typography;

interface CompanyType {
  id: number;
  name: string;
  legalNumber: string;
  incorporationCountry: string;
  website: string;
  createdAt: string;
}

const Companies: React.FC = () => {
  const [data, setData] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const order = sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : '';
      const response = await api.get('/api/companies', {
        params: {
          search,
          page: pagination.current,
          limit: pagination.pageSize,
          sortBy: sorter.field,
          sortOrder: order,
        },
      });

      setData(response.data.companies);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error(error);
      message.error('An error occurred while listing companies.');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.current, pagination.pageSize, sorter.field, sorter.order]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: CompanyType) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/companies/${id}`);
      message.success('Company and all associated products deleted.');
      fetchCompanies();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Company could not be deleted.';
      message.error(errorMsg);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/companies/${editingId}`, values);
        message.success('Company updated successfully.');
      } else {
        await api.post('/api/companies', values);
        message.success('Company added successfully.');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchCompanies();
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
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Legal Number',
      dataIndex: 'legalNumber',
      key: 'legalNumber',
      sorter: true,
    },
    {
      title: 'Incorporation Country',
      dataIndex: 'incorporationCountry',
      key: 'incorporationCountry',
      sorter: true,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      sorter: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <GlobalOutlined style={{ marginRight: 4 }} /> {url}
        </a>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: CompanyType) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete Company"
            description="Deleting this company will also permanently delete ALL associated products. Are you sure?"
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
          <Title level={3} style={{ margin: 0 }}>Company Management</Title>
          <Text type="secondary">You can list, add or update all companies in the system.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add New Company
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8 }}>
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by company name, legal number or country..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 350 }}
          />
        </div>

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
        title={editingId ? 'Edit Company' : 'Add New Company'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ name: '', legalNumber: '', incorporationCountry: '', website: '' }}
        >
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true, message: 'Please input the company name!' }]}
          >
            <Input placeholder="e.g. ETE Technology" />
          </Form.Item>

          <Form.Item
            name="legalNumber"
            label="Legal Number"
            rules={[{ required: true, message: 'Please input the company legal number!' }]}
          >
            <Input placeholder="e.g. 994852934-A" />
          </Form.Item>

          <Form.Item
            name="incorporationCountry"
            label="Incorporation Country"
            rules={[{ required: true, message: 'Please input the incorporation country!' }]}
          >
            <Input placeholder="e.g. Turkey" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[
              { required: true, message: 'Please input the company website!' },
              { type: 'url', message: 'Please enter a valid URL! (must start with http:// or https://)' }
            ]}
          >
            <Input placeholder="e.g. https://etetechnology.com" />
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

export default Companies;
