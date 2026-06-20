import React, { useState, useEffect } from 'react';
import { Product, Category, ProductFilters } from '../types';
import { formatCurrency, getStockStatus } from '../utils/helpers';

interface InventoryTableProps {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  selectedRowKeys: string[];
  loading?: boolean;
  isDarkMode?: boolean;
  onFiltersChange: (filters: ProductFilters) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddNew: () => void;
  onUpdateStock: (product: Product, action: 'INCREASE' | 'DECREASE') => void;
  onSelectedChange: (keys: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkRestock?: (ids: string[], quantity: number) => void;
}

type SortField = 'name' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  categories,
  filters,
  selectedRowKeys,
  onFiltersChange,
  onEdit,
  onDelete,
  onAddNew,
  onUpdateStock,
  onSelectedChange,
  onBulkDelete,
  onBulkRestock,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() =>
    window.innerWidth < 640 ? 'card' : 'table'
  );
  const [restockQty, setRestockQty] = useState<number>(10);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Auto-switch to card view on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('card');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Sort and filter products
  const sortedProducts = React.useMemo(() => {
    if (!sortField) return products;
    return [...products].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [products, sortField, sortOrder]);

  // Paginated products
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const hasSelected = selectedRowKeys.length > 0;
  const allSelectedOnPage = paginatedProducts.length > 0 && 
    paginatedProducts.every((p) => selectedRowKeys.includes(p.id));

  // Toggle selection
  const handleSelectAll = () => {
    if (allSelectedOnPage) {
      // Remove all paginated products from selection
      const paginatedIds = paginatedProducts.map((p) => p.id);
      onSelectedChange(selectedRowKeys.filter((key) => !paginatedIds.includes(key)));
    } else {
      // Add all paginated products to selection
      const keysToAdd = paginatedProducts
        .map((p) => p.id)
        .filter((id) => !selectedRowKeys.includes(id));
      onSelectedChange([...selectedRowKeys, ...keysToAdd]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedRowKeys.includes(id)) {
      onSelectedChange(selectedRowKeys.filter((key) => key !== id));
    } else {
      onSelectedChange([...selectedRowKeys, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['SKU/ID', 'Name', 'Category', 'Price', 'Stock', 'Inventory Value', 'Status'];
    const rows = sortedProducts.map((p) => [
      p.id,
      p.name,
      categoryMap.get(p.categoryId) || 'General',
      p.price.toFixed(2),
      p.stock,
      (p.price * p.stock).toFixed(2),
      getStockStatus(p.stock),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockBadgeClass = (stock: number) => {
    if (stock === 0) {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50';
    }
    if (stock < 10) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Left: inputs */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={filters.searchQuery || ''}
              onChange={(e) => {
                onFiltersChange({ ...filters, searchQuery: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-305 dark:border-slate-650 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <select
            value={filters.categoryId || ''}
            onChange={(e) => {
              onFiltersChange({ ...filters, categoryId: e.target.value || null });
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-305 dark:border-slate-650 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.stockStatus}
            onChange={(e) => {
              onFiltersChange({ ...filters, stockStatus: e.target.value as any });
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-305 dark:border-slate-650 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Right: view toggle */}
        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-0.5 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>📊</span> Table
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'card'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>🎴</span> Card
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>➕</span> Add Product
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        {/* Bulk Action Controls */}
        {hasSelected && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
            <span className="text-xs text-slate-500 font-bold dark:text-slate-400">
              {selectedRowKeys.length} selected
            </span>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-1.5 py-1 text-xs border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded focus:outline-none"
              />
              <button
                onClick={() => {
                  onBulkRestock && onBulkRestock(selectedRowKeys as string[], restockQty);
                  onSelectedChange([]);
                }}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors"
              >
                Bulk Restock
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedRowKeys.length} products?`)) {
                    onBulkDelete && onBulkDelete(selectedRowKeys as string[]);
                    onSelectedChange([]);
                  }
                }}
                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Table vs Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-850">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU / ID</th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    Product Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th
                    onClick={() => handleSort('price')}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    Price {sortField === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('stock')}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    Stock Level {sortField === 'stock' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => {
                    const isSelected = selectedRowKeys.includes(p.id);
                    const isLowStock = p.stock < 10 && p.stock > 0;
                    const isOutStock = p.stock === 0;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors text-sm ${
                          isSelected ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.id)}
                            className="rounded border-slate-305 text-indigo-650 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-indigo-650 dark:text-indigo-400 whitespace-nowrap">
                          {p.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {categoryMap.get(p.categoryId) || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getStockBadgeClass(
                                p.stock
                              )}`}
                            >
                              {p.stock} units
                            </span>
                            {isLowStock && <span className="text-[10px] text-amber-500">⚠️ Low</span>}
                            {isOutStock && <span className="text-[10px] text-red-500">❌ Out</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-550 dark:text-slate-400 whitespace-nowrap">
                          {formatCurrency(p.price * p.stock)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => onUpdateStock(p, 'INCREASE')}
                              className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded transition-colors"
                              title="Restock (Incoming)"
                            >
                              📈
                            </button>
                            <button
                              onClick={() => onUpdateStock(p, 'DECREASE')}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded transition-colors"
                              title="Reduce (Outgoing)"
                            >
                              📉
                            </button>
                            <button
                              onClick={() => onEdit(p)}
                              className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 rounded transition-colors"
                              title="Edit Details"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this product?')) {
                                  onDelete(p.id);
                                }
                              }}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded transition-colors"
                              title="Delete Product"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No products found. Add a product to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of{' '}
                {sortedProducts.length} items
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-850 hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-850 hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Card View Layout */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const isSelected = selectedRowKeys.includes(p.id);
                const isLowStock = p.stock < 10 && p.stock > 0;
                const isOutStock = p.stock === 0;

                return (
                  <div
                    key={p.id}
                    className={`relative rounded-xl border p-4 bg-white dark:bg-slate-800 transition-all duration-300 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(p.id)}
                        className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                      />
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                        {categoryMap.get(p.categoryId) || 'General'}
                      </span>
                    </div>

                    {/* Product Name & SKU */}
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate text-base" title={p.name}>
                      {p.name}
                    </h4>
                    <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-4">
                      SKU: {p.id}
                    </span>

                    {/* Price and Stock levels */}
                    <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 dark:border-slate-700/50 py-3 mb-4 text-xs">
                      <div>
                        <span className="block text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                          Unit Price
                        </span>
                        <span className="text-base font-black text-slate-800 dark:text-slate-100">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                          Total Value
                        </span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(p.price * p.stock)}
                        </span>
                      </div>
                    </div>

                    {/* Stock indicator and progress */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>Stock Level</span>
                        <span
                          className={
                            isOutStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500'
                          }
                        >
                          {p.stock} units
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOutStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action button bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdateStock(p, 'INCREASE')}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 text-xs font-bold transition-all"
                          title="Restock"
                        >
                          📈 +
                        </button>
                        <button
                          onClick={() => onUpdateStock(p, 'DECREASE')}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 text-xs font-bold transition-all"
                          title="Reduce"
                        >
                          📉 -
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1 text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this product?')) {
                              onDelete(p.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                No products found. Add a product to get started!
              </div>
            )}
          </div>

          {/* Cards Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of{' '}
                {sortedProducts.length} items
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border border-slate-350 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 border border-slate-350 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-550 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
