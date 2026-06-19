/**
 * CategoryManagementModal Component
 * Handles category creation and management
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Table, Popconfirm, Space, Empty, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Category } from '../types';

interface CategoryManagementModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onAddCategory: (name: string, description: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  loading?: boolean;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  visible,
  categories,
  onClose,
  onAddCategory,
  onDeleteCategory,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { name: string; description: string }) => {
    setIsSubmitting(true);
    try {
      onAddCategory(values.name, values.description);
      form.resetFields();
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultCategories = categories.filter((c) => c.name !== 'Default');
  const customCategories = categories.filter((c) => c.name === 'Default' || !c.name.startsWith('__'));

  const columns: ColumnsType<Category> = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span style={{ color: '#999' }}>No description</span>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.name !== 'Default' && (
            <Popconfirm
              title="Delete Category"
              description="Are you sure? Products in this category will be moved to Default."
              onConfirm={() => onDeleteCategory(record.id)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Manage Categories"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div style={{ marginTop: '20px' }}>
        {/* Add New Category Form */}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Category Name"
            name="name"
            rules={[
              { required: true, message: 'Category name is required' },
              { min: 2, message: 'Category name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter category name" maxLength={50} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Optional category description"
              rows={2}
              maxLength={200}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={isSubmitting || loading}
              block
            >
              Add New Category
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {/* Categories List */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '12px' }}>Existing Categories ({categories.length})</h4>
          {categories.length > 0 ? (
            <Table
              columns={columns}
              dataSource={categories}
              pagination={false}
              rowKey="id"
              size="small"
            />
          ) : (
            <Empty description="No categories yet" />
          )}
        </div>
      </div>
    </Modal>
  );
};
