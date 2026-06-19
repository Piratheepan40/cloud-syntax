/**
 * StockAdjustmentModal Component
 * Handles stock adjustment (Increase/Decrease) with Formik + Yup validation
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Radio, Button } from 'antd';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Product } from '../types';

interface StockAdjustmentModalProps {
  visible: boolean;
  product: Product | null;
  initialAction: 'INCREASE' | 'DECREASE';
  onClose: () => void;
  onSubmit: (productId: string, quantity: number, action: 'INCREASE' | 'DECREASE', notes?: string) => void;
  loading?: boolean;
}

interface FormValues {
  action: 'INCREASE' | 'DECREASE';
  quantity: number;
  notes: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  visible,
  product,
  initialAction,
  onClose,
  onSubmit,
  loading = false,
}) => {
  if (!product) return null;

  const currentStock = product.stock;

  // Dynamic Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    action: Yup.string().oneOf(['INCREASE', 'DECREASE']).required('Action is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .integer('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .test(
        'max-decrease',
        `Quantity cannot exceed current stock of ${currentStock} units`,
        function (value) {
          const { action } = this.parent;
          if (action === 'DECREASE' && value && value > currentStock) {
            return false;
          }
          return true;
        }
      )
      .typeError('Quantity must be a valid number'),
    notes: Yup.string()
      .trim()
      .max(200, 'Notes must not exceed 200 characters'),
  });

  const initialValues: FormValues = {
    action: initialAction,
    quantity: 1,
    notes: '',
  };

  const handleSubmit = (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    onSubmit(product.id, values.quantity, values.action, values.notes);
    resetForm();
    setSubmitting(false);
  };

  return (
    <Modal
      title={`Adjust Stock: ${product.name}`}
      open={visible}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      width={450}
      destroyOnClose
    >
      <div style={{ marginTop: '16px', marginBottom: '16px', color: '#666' }}>
        Current Stock: <strong>{currentStock} units</strong> (SKU: <code>{product.id}</code>)
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: formikSubmit,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
        }) => (
          <Form layout="vertical" onFinish={formikSubmit}>
            <Form.Item
              label="Transaction Type"
              validateStatus={touched.action && errors.action ? 'error' : ''}
              help={touched.action && errors.action ? errors.action : ''}
            >
              <Radio.Group
                name="action"
                value={values.action}
                onChange={(e) => {
                  setFieldValue('action', e.target.value);
                  // Trigger validation of quantity in case action changes
                  setFieldTouched('quantity', true);
                }}
                disabled={loading || isSubmitting}
              >
                <Radio.Button value="INCREASE" style={{ borderColor: values.action === 'INCREASE' ? '#52c41a' : undefined }}>
                  📈 Incoming / Restock
                </Radio.Button>
                <Radio.Button value="DECREASE" style={{ borderColor: values.action === 'DECREASE' ? '#ff4d4f' : undefined }}>
                  📉 Outgoing / Sale
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Quantity"
              validateStatus={touched.quantity && errors.quantity ? 'error' : ''}
              help={touched.quantity && errors.quantity ? errors.quantity : ''}
              required
            >
              <InputNumber
                name="quantity"
                value={values.quantity}
                onChange={(value) => setFieldValue('quantity', value || 0)}
                onBlur={handleBlur}
                min={1}
                step={1}
                disabled={loading || isSubmitting}
                style={{ width: '100%' }}
                placeholder="Enter adjustment quantity"
              />
            </Form.Item>

            <Form.Item
              label="Reference / Notes"
              validateStatus={touched.notes && errors.notes ? 'error' : ''}
              help={touched.notes && errors.notes ? errors.notes : ''}
            >
              <Input.TextArea
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Weekly restocking, customer order #1042"
                rows={3}
                disabled={loading || isSubmitting}
                maxLength={200}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <Button onClick={onClose} disabled={loading || isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || isSubmitting}
                  danger={values.action === 'DECREASE'}
                  style={{
                    backgroundColor: values.action === 'INCREASE' ? '#52c41a' : undefined,
                    borderColor: values.action === 'INCREASE' ? '#52c41a' : undefined,
                  }}
                >
                  Confirm Adjustment
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
