import React, { useState, useMemo, useEffect } from 'react';
import {
  ProductFormModal,
  InventoryTable,
  Dashboard,
  CategoryManagementModal,
  StockHistoryModal,
  Sidebar,
  StockAdjustmentModal,
  WelcomeScreen,
} from './components';
import { useInventory } from './hooks';
import { Product } from './types';

type TabKey = 'dashboard' | 'inventory';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [productFormVisible, setProductFormVisible] = useState(false);
  const [categoryManagementVisible, setCategoryManagementVisible] = useState(false);
  const [stockHistoryVisible, setStockHistoryVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [stockAdjustmentVisible, setStockAdjustmentVisible] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustingAction, setAdjustingAction] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const {
    products,
    categories,
    stockHistory,
    stats,
    filters,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    updateStock,
    bulkRestock,
    addCategory,
    deleteCategory,
    setFilters,
  } = useInventory();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(filters.searchQuery?.toLowerCase() || '') ||
        p.id.toLowerCase().includes(filters.searchQuery?.toLowerCase() || '');

      const matchesCategory = !filters.categoryId || p.categoryId === filters.categoryId;

      const matchesStockStatus =
        filters.stockStatus === 'all' ||
        (filters.stockStatus === 'in-stock' && p.stock > 0) ||
        (filters.stockStatus === 'out-of-stock' && p.stock === 0);

      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [products, filters]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormVisible(true);
  };

  const handleSubmitProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setProductFormVisible(false);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
  };

  const handleUpdateStock = (
    product: Product,
    action: 'INCREASE' | 'DECREASE'
  ) => {
    setAdjustingProduct(product);
    setAdjustingAction(action);
    setStockAdjustmentVisible(true);
  };

  const handleSubmitStockAdjustment = (
    productId: string,
    quantity: number,
    action: 'INCREASE' | 'DECREASE',
    notes?: string
  ) => {
    updateStock(productId, quantity, action, notes);
    setStockAdjustmentVisible(false);
    setAdjustingProduct(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteProducts(ids);
  };

  const handleBulkRestock = (ids: string[], quantity: number) => {
    ids.forEach((id) => bulkRestock([id], quantity));
  };

  const handleAddCategory = (name: string, description: string) => {
    addCategory(name, description);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('isDarkMode', JSON.stringify(newValue));
  };

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {showWelcome && (
        <WelcomeScreen
          onComplete={() => setShowWelcome(false)}
          isDarkMode={isDarkMode}
        />
      )}
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold gradient-text truncate">CloudSyntex IMS</h1>
                {!isMobile && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Inventory System</p>}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM5 17a1 1 0 100 2h1a1 1 0 100-2H5z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex pt-16">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onManageCategories={() => setCategoryManagementVisible(true)}
            onViewHistory={() => setStockHistoryVisible(true)}
            stockHistoryCount={stockHistory.length}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            onSidebarClose={() => setSidebarOpen(false)}
          />

          {/* Content */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-64px)]">
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
              {/* Tab Navigation */}
              <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto whitespace-nowrap hide-scrollbar">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'inventory'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  📦 Inventory
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'dashboard' && (
                <div className="animate-fadeIn">
                  <Dashboard
                    stats={stats}
                    products={products}
                    categories={categories}
                    stockHistory={stockHistory}
                  />
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="animate-fadeIn">
                  <InventoryTable
                    products={filteredProducts}
                    categories={categories}
                    filters={filters}
                    selectedRowKeys={selectedRowKeys}
                    onFiltersChange={setFilters}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onAddNew={handleAddProduct}
                    onUpdateStock={handleUpdateStock}
                    onSelectedChange={setSelectedRowKeys}
                    onBulkDelete={handleBulkDelete}
                    onBulkRestock={handleBulkRestock}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        visible={productFormVisible}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setProductFormVisible(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
      />

      <CategoryManagementModal
        visible={categoryManagementVisible}
        categories={categories}
        onClose={() => setCategoryManagementVisible(false)}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <StockHistoryModal
        visible={stockHistoryVisible}
        stockHistory={stockHistory}
        products={productMap}
        onClose={() => setStockHistoryVisible(false)}
      />

      <StockAdjustmentModal
        visible={stockAdjustmentVisible}
        product={adjustingProduct}
        initialAction={adjustingAction}
        onClose={() => {
          setStockAdjustmentVisible(false);
          setAdjustingProduct(null);
        }}
        onSubmit={handleSubmitStockAdjustment}
      />
    </div>
  );
};

export default App;
