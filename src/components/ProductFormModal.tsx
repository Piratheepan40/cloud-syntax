import React, { useMemo } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Product, Category } from '../types';

interface ProductFormModalProps {
  visible: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters')
    .required('Product name is required'),
  categoryId: Yup.string().required('Category is required'),
  price: Yup.number()
    .min(0.01, 'Price must be greater than 0')
    .required('Price is required'),
  stock: Yup.number()
    .min(0, 'Stock cannot be negative')
    .integer('Stock must be a whole number')
    .required('Stock is required'),
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  categories,
  onClose,
  onSubmit,
}) => {
  const initialValues = useMemo(
    () => ({
      name: product?.name || '',
      categoryId: product?.categoryId || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
    }),
    [product]
  );

  const handleSubmit = (
    values: typeof initialValues,
    { setSubmitting, resetForm }: FormikHelpers<typeof initialValues>
  ) => {
    onSubmit(values);
    resetForm();
    setSubmitting(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {product ? 'Update product details' : 'Create a new product'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xl font-bold p-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, isSubmitting, isValid, dirty }) => (
            <Form className="p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  as="input"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />
                {touched.name && errors.name && (
                  <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    ⚠️ {errors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Category <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  name="categoryId"
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors ${
                    touched.categoryId && errors.categoryId
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                >
                  <option value="" className="text-slate-500">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Field>
                {touched.categoryId && errors.categoryId && (
                  <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    ⚠️ {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">$</span>
                    <Field
                      type="number"
                      name="price"
                      step="0.01"
                      placeholder="0.00"
                      className={`w-full pl-7 pr-3 py-2 rounded-lg border transition-colors ${
                        touched.price && errors.price
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {touched.price && errors.price && (
                    <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                      ⚠️ {errors.price}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="number"
                    name="stock"
                    placeholder="0"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      touched.stock && errors.stock
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                  />
                  {touched.stock && errors.stock && (
                    <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                      ⚠️ {errors.stock}
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : product ? 'Update' : 'Create'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductFormModal;
