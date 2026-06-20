import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
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
  if (!product || !visible) return null;

  const currentStock = product.stock;

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    action: Yup.string().oneOf(['INCREASE', 'DECREASE']).required('Action is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .integer('Quantity must be a whole number')
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
      ),
    notes: Yup.string().trim().max(200, 'Notes cannot exceed 200 characters'),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📈</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Adjust Stock: {product.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="px-6 pt-5">
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 flex justify-between items-center">
            <div>
              <span className="block text-xs font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-wider">
                Current Stock Level
              </span>
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {currentStock} units
              </span>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        {/* Adjustment Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting, isValid, dirty }) => (
            <Form className="p-6 space-y-5">
              {/* Action Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFieldValue('action', 'INCREASE')}
                    className={`py-2 px-4 rounded-lg font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-1.5 ${
                      values.action === 'INCREASE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>📈</span> Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldValue('action', 'DECREASE')}
                    className={`py-2 px-4 rounded-lg font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-1.5 ${
                      values.action === 'DECREASE'
                        ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/30 dark:border-rose-600 dark:text-rose-400 shadow-sm'
                        : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>📉</span> Reduce Stock
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Quantity to {values.action === 'INCREASE' ? 'Add' : 'Remove'}
                </label>
                <Field
                  type="number"
                  name="quantity"
                  placeholder="Enter adjustment amount"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    touched.quantity && errors.quantity
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />
                {touched.quantity && errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.quantity}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Notes / Reference (Optional)
                </label>
                <Field
                  as="textarea"
                  name="notes"
                  rows={2}
                  placeholder="e.g. Weekly restock, inventory audit, customer purchase"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm"
                />
                {touched.notes && errors.notes && (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || !dirty || isSubmitting}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${
                    values.action === 'INCREASE'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : values.action === 'INCREASE'
                    ? 'Confirm Restock'
                    : 'Confirm Reduction'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
