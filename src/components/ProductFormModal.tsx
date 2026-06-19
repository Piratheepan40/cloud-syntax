/**
 * ProductFormModal Component
 * Handles Add/Edit product functionality with Formik + Yup validation
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Spin, Alert } from 'antd';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Product, Category } from '../types';

interface ProductFormModalProps {
  visible: boolean;
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loading?: boolean;
}

// Yup Validation Schema
const productValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must not exceed 100 characters'),
  categoryId: Yup.string()
    .required('Category is required'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative')
    .typeError('Price must be a valid number'),
  stock: Yup.number()
    .required('Stock quantity is required')
    .min(0, 'Stock cannot be negative')
    .integer('Stock must be an integer')
    .typeError('Stock must be a valid number'),
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  categories,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEditMode = !!product;

  const initialValues = product || {
    name: '',
    categoryId: '',
    price: 0,
    stock: 0,
  };

  const handleSubmit = (
    values: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    { setSubmitting }: FormikHelpers<any>
  ) => {
    onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Modal
      title={isEditMode ? `Edit Product: ${product?.name}` : 'Add New Product'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={productValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, isSubmitting, setFieldValue, setFieldTouched }) => (
          <Form layout="vertical" onFinish={formikSubmit} style={{ marginTop: '20px' }}>
            <Form.Item
              label="Product Name"
              validateStatus={touched.name && errors.name ? 'error' : ''}
              help={touched.name && errors.name ? errors.name : ''}
            >
              <Input
                placeholder="Enter product name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isSubmitting}
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              label="Category"
              validateStatus={touched.categoryId && errors.categoryId ? 'error' : ''}
              help={touched.categoryId && errors.categoryId ? errors.categoryId : ''}
            >
              <Select
                placeholder="Select a category"
                value={values.categoryId || undefined}
                onChange={(value) => {
                  setFieldValue('categoryId', value);
                }}
                onBlur={() => setFieldTouched('categoryId', true)}
                disabled={loading || isSubmitting}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Price ($)"
              validateStatus={touched.price && errors.price ? 'error' : ''}
              help={touched.price && errors.price ? errors.price : ''}
            >
              <InputNumber
                placeholder="0.00"
                name="price"
                value={values.price}
                onChange={(value) => handleChange({ target: { name: 'price', value: value || 0 } })}
                onBlur={handleBlur}
                disabled={loading || isSubmitting}
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Stock Quantity"
              validateStatus={touched.stock && errors.stock ? 'error' : ''}
              help={touched.stock && errors.stock ? errors.stock : ''}
            >
              <InputNumber
                placeholder="0"
                name="stock"
                value={values.stock}
                onChange={(value) => handleChange({ target: { name: 'stock', value: value || 0 } })}
                onBlur={handleBlur}
                disabled={loading || isSubmitting}
                min={0}
                step={1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} disabled={loading || isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || isSubmitting}
                >
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
