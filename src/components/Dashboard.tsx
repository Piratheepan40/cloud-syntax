import React, { useState } from 'react';
import { Product, Category, InventoryStats, StockHistoryLog } from '../types';
import { formatCurrency } from '../utils/helpers';

interface DashboardProps {
  stats: InventoryStats;
  products: Product[];
  categories: Category[];
  stockHistory: StockHistoryLog[];
  loading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  products,
  categories,
  stockHistory,
  loading = false,
}) => {
  const [openSection, setOpenSection] = useState<{ [key: string]: boolean }>({
    categories: true,
    alerts: true,
    activity: true,
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Get products with low stock (less than 10 units)
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);

  // Get most valuable products (top 5 by inventory value)
  const mostValuableProducts = products
    .map((p) => ({ ...p, value: p.price * p.stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Get recent stock history (last 10 items)
  const recentHistory = stockHistory.slice(0, 10);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatValue = (numValue: number) => {
    return numValue >= 1000000
      ? `$${(numValue / 1000000).toFixed(1)}M`
      : numValue >= 1000
      ? `$${(numValue / 1000).toFixed(1)}K`
      : `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const statsList = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      gradient: 'from-indigo-500 to-purple-650',
    },
    {
      title: 'Total Value',
      value: formatValue(stats.totalInventoryValue),
      icon: '💰',
      gradient: 'from-rose-500 to-pink-650',
    },
    {
      title: 'Total Units',
      value: stats.totalStockQuantity.toLocaleString(),
      icon: '📊',
      gradient: 'from-emerald-500 to-teal-650',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockCount,
      icon: '⚠️',
      gradient: 'from-amber-500 to-orange-650',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex flex-col justify-between h-32 animate-fade-in-up`}
            style={{ animationDelay: `${i * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="absolute right-[-10px] top-[-10px] text-8xl opacity-10 select-none pointer-events-none">
              {stat.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                {stat.title}
              </span>
              <span className="block text-3xl font-black mt-1">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Category breakdown */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-150 dark:border-slate-700"
        >
          <span className="flex items-center gap-2">
            <span>📁</span> Inventory by Category
          </span>
          <span className="text-xs text-slate-400">{openSection.categories ? '▲' : '▼'}</span>
        </button>

        {openSection.categories && (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length > 0 ? (
                categories.map((cat, index) => {
                  const categoryProducts = products.filter((p) => p.categoryId === cat.id);
                  const categoryValue = categoryProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
                  const categoryStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);

                  return (
                    <div
                      key={cat.id}
                      className="border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-r-lg border border-slate-150 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 transform hover:-translate-x-1 hover:border-l-8 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">
                        {cat.name}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <div>
                          Products:{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {categoryProducts.length}
                          </strong>
                        </div>
                        <div>
                          Units:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {categoryStock}
                          </strong>
                        </div>
                        <div>
                          Value:{' '}
                          <strong className="text-amber-600 dark:text-amber-400 font-bold">
                            {formatCurrency(categoryValue)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400">No categories found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Alerts & Insights */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <button
          onClick={() => toggleSection('alerts')}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-150 dark:border-slate-700"
        >
          <span className="flex items-center gap-2">
            <span>⚠️</span> Alerts & Insights
            {lowStockProducts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {lowStockProducts.length} Low
              </span>
            )}
          </span>
          <span className="text-xs text-slate-400">{openSection.alerts ? '▲' : '▼'}</span>
        </button>

        {openSection.alerts && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-450 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                <span>⚠️</span> Low Stock Items
              </h3>
              {lowStockProducts.length > 0 ? (
                <div>
                  {/* Table View (Hidden on mobile) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                      <thead>
                        <tr>
                          <th className="text-left font-bold py-1.5 text-slate-400">Name</th>
                          <th className="text-left font-bold py-1.5 text-slate-400">Category</th>
                          <th className="text-right font-bold py-1.5 text-slate-400">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {lowStockProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                            <td className="py-2 text-slate-500">{categoryMap.get(p.categoryId) || 'General'}</td>
                            <td className="py-2 text-right">
                              <span className="font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
                                {p.stock} units
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* List View (Visible on mobile) */}
                  <div className="block sm:hidden space-y-2">
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                          <div className="text-slate-400 mt-0.5">{categoryMap.get(p.categoryId) || 'General'}</div>
                        </div>
                        <span className="font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450">
                          {p.stock} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">All products are well stocked</div>
              )}
            </div>

            {/* Most Valuable Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                <span>💎</span> Top 5 Most Valuable
              </h3>
              {mostValuableProducts.length > 0 ? (
                <div>
                  {/* Table View (Hidden on mobile) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                      <thead>
                        <tr>
                          <th className="text-left font-bold py-1.5 text-slate-400">Name</th>
                          <th className="text-right font-bold py-1.5 text-slate-400">Stock</th>
                          <th className="text-right font-bold py-1.5 text-slate-400">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {mostValuableProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                            <td className="py-2 text-right text-slate-500">{p.stock}</td>
                            <td className="py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(p.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* List View (Visible on mobile) */}
                  <div className="block sm:hidden space-y-2">
                    {mostValuableProducts.map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                          <div className="text-slate-400 mt-0.5">Stock: {p.stock} units</div>
                        </div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(p.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">No inventory products yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Recent Activity */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <button
          onClick={() => toggleSection('activity')}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-150 dark:border-slate-700"
        >
          <span className="flex items-center gap-2">
            <span>📅</span> Recent Stock Activity
          </span>
          <span className="text-xs text-slate-400">{openSection.activity ? '▲' : '▼'}</span>
        </button>

        {openSection.activity && (
          <div className="p-5">
            {recentHistory.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                {recentHistory.map((log, index) => {
                  const product = products.find((p) => p.id === log.productId);
                  const isIncrease = log.action === 'INCREASE';
                  
                  return (
                    <div 
                      key={log.id} 
                      className="relative pl-7 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 group animate-fade-in-up hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                      style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                      {/* Dot icon */}
                      <span className="absolute left-[3px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] shadow-sm transform group-hover:scale-110 transition-transform">
                        {isIncrease ? '📈' : '📉'}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 dark:text-slate-100 text-sm">
                            {product?.name || log.productName}
                          </strong>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isIncrease
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450'
                                : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450'
                            }`}
                          >
                            {isIncrease ? '+' : ''}
                            {log.changeQuantity} units
                          </span>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                          Stock Level: {log.previousStock} → {log.newStock}
                        </div>
                        {log.notes && (
                          <div className="text-slate-500 dark:text-slate-400 italic text-[11px] mt-0.5">
                            Note: {log.notes}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap self-start md:self-center">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 italic text-sm">
                No activity history found yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
