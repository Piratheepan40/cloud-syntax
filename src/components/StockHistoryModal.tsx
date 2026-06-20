import React, { useState } from 'react';
import { Product, StockHistoryLog } from '../types';

interface StockHistoryModalProps {
  visible: boolean;
  stockHistory: StockHistoryLog[];
  products: Map<string, Product>;
  onClose: () => void;
  loading?: boolean;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  visible,
  stockHistory,
  products,
  onClose,
  loading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!visible) return null;

  // Filter logs
  const filteredData = stockHistory.filter((record) => {
    const product = products.get(record.productId);
    const productName = product?.name?.toLowerCase() || '';
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      productName.includes(searchLower) || record.productId.toLowerCase().includes(searchLower);
    const matchesFilter = !filterAction || record.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const headers = ['Date', 'Product', 'Action', 'Previous Stock', 'New Stock', 'Change', 'Notes'];
    const rows = filteredData.map((record) => {
      const product = products.get(record.productId);
      const change = record.newStock - record.previousStock;
      const formattedDate = new Date(record.timestamp).toLocaleString();
      return [
        formattedDate,
        product?.name || 'Deleted Product',
        record.action,
        record.previousStock,
        record.newStock,
        change > 0 ? `+${change}` : change,
        record.notes || '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-fadeIn flex flex-col h-[95vh] sm:h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl">📋</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Stock History
              </h2>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                View all stock adjustments and transactions
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

        {/* Filters and Toolbar */}
        <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-700/50 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 dark:bg-slate-900/10">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-650 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Action Segmented Toggle */}
            <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-0.5 flex-1 sm:flex-none">
              <button
                onClick={() => {
                  setFilterAction(null);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterAction === null
                    ? 'bg-white dark:bg-slate-600 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilterAction('INCREASE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterAction === 'INCREASE'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Restocks
              </button>
              <button
                onClick={() => {
                  setFilterAction('DECREASE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterAction === 'DECREASE'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Reductions
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-sm bg-white dark:bg-slate-800"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {paginatedData.length > 0 ? (
            <div>
              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden sm:block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Previous</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {paginatedData.map((log, index) => {
                      const product = products.get(log.productId);
                      const change = log.newStock - log.previousStock;
                      const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr
                          key={`${log.productId}-${index}`}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors text-sm"
                        >
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            {product ? (
                              <div>
                                <span>{product.name}</span>
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  SKU: {log.productId}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">Deleted Product</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {log.action === 'INCREASE' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                                📈 RESTOCK
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400">
                                📉 REDUCTION
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                            {log.previousStock}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-slate-100">
                            {log.newStock}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold whitespace-nowrap ${
                            change > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {change > 0 ? `+${change}` : change}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={log.notes}>
                            {log.notes || <span className="text-slate-300 dark:text-slate-650 italic">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (visible only on mobile) */}
              <div className="block sm:hidden space-y-3">
                {paginatedData.map((log, index) => {
                  const product = products.get(log.productId);
                  const change = log.newStock - log.previousStock;
                  const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={`mobile-${log.productId}-${index}`}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 bg-white dark:bg-slate-800/80 space-y-2.5"
                    >
                      {/* Top row: Product name + action badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {product?.name || <span className="italic text-slate-400">Deleted Product</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            SKU: {log.productId}
                          </div>
                        </div>
                        {log.action === 'INCREASE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 whitespace-nowrap flex-shrink-0">
                            📈 RESTOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 whitespace-nowrap flex-shrink-0">
                            📉 REDUCTION
                          </span>
                        )}
                      </div>

                      {/* Stock change details in a compact grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/30 rounded-lg p-2.5 text-center">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Previous</div>
                          <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{log.previousStock}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">New</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{log.newStock}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Change</div>
                          <div className={`text-sm font-black ${
                            change > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {change > 0 ? `+${change}` : change}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Date + Notes */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500">🕒 {formattedDate}</span>
                        {log.notes && (
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[50%] text-right" title={log.notes}>
                            📝 {log.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-4xl block mb-2">📋</span>
              <p className="font-bold text-sm">No stock movement logs found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adapting your search filters or make stock adjustments</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} log entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-350 dark:border-slate-600 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-550 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-350 dark:border-slate-600 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-550 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal;
