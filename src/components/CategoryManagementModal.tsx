import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
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

const validationSchema = Yup.object().shape({
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

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏷️</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Manage Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create and organize product categories
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

        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Category Form */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <span>➕</span> Add New Category
            </h3>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, isValid, dirty }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="e.g., Electronics, Office, Hardware"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                        touched.name && errors.name
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm`}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Description (Optional)
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={2}
                      placeholder="Describe the items in this category"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                        touched.description && errors.description
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm`}
                    />
                    {touched.description && errors.description && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || !dirty || isSubmitting}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Category'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <span>📋</span> Existing Categories ({categories.length})
            </h3>
            
            {/* Table View (Hidden on mobile) */}
            <div className="hidden sm:block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                        {cat.description || <span className="text-slate-300 dark:text-slate-600 italic">No description</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {cat.id !== 'default' ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Delete Category? Products under this category will be moved to General.')) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1"
                            title="Delete Category"
                          >
                            🗑️
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">System</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* List View (Visible on mobile) */}
            <div className="block sm:hidden space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{cat.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.description || <span className="italic text-slate-400">No description</span>}
                    </div>
                  </div>
                  <div>
                    {cat.id !== 'default' ? (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete Category? Products under this category will be moved to General.')) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 text-sm"
                        title="Delete Category"
                      >
                        🗑️
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">System</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-650 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;
