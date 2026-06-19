/**
 * CategoryManagementModal Component
 * Handles category creation and management with Formik + Yup validation
 */

import React from 'react';
import { Modal, Form, Input, Button, Table, Popconfirm, Space, Empty, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
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

interface FormValues {
  name: string;
  description: string;
}

// Yup Validation Schema
const categoryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: Yup.string()
    .trim()
    .max(200, 'Description must not exceed 200 characters'),
});

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  visible,
  categories,
  onClose,
  onAddCategory,
  onDeleteCategory,
  loading = false,
}) => {
  const initialValues: FormValues = {
    name: '',
    description: '',
  };

  const handleSubmit = (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    onAddCategory(values.name, values.description);
    resetForm();
    setSubmitting(false);
  };

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
          {record.id !== 'default' && (
            <Popconfirm
              title="Delete Category"
              description="Are you sure? Products in this category will be moved to General."
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
        <Formik
          initialValues={initialValues}
          validationSchema={categoryValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit: formikSubmit,
            isSubmitting,
          }) => (
            <Form layout="vertical" onFinish={formikSubmit}>
              <Form.Item
                label="Category Name"
                validateStatus={touched.name && errors.name ? 'error' : ''}
                help={touched.name && errors.name ? errors.name : ''}
                required
              >
                <Input
                  name="name"
                  placeholder="Enter category name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading || isSubmitting}
                  maxLength={50}
                />
              </Form.Item>

              <Form.Item
                label="Description"
                validateStatus={touched.description && errors.description ? 'error' : ''}
                help={touched.description && errors.description ? errors.description : ''}
              >
                <Input.TextArea
                  name="description"
                  placeholder="Optional category description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  disabled={loading || isSubmitting}
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={loading || isSubmitting}
                  block
                >
                  Add New Category
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>

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
