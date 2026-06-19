/**
 * Main App Component
 * Central application container with sidebar navigation and state management
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Tabs, Button, Space, message, ConfigProvider, theme } from 'antd';
import {
  BarcodeOutlined,
} from '@ant-design/icons';
import {
  ProductFormModal,
  InventoryTable,
  Dashboard,
  CategoryManagementModal,
  StockHistoryModal,
  Sidebar,
} from './components';
import { useInventory } from './hooks';
import { Product } from './types';
import './App.css';

const { Header, Content } = Layout;

type TabKey = 'dashboard' | 'inventory';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Modal states
  const [productFormVisible, setProductFormVisible] = useState(false);
  const [categoryManagementVisible, setCategoryManagementVisible] = useState(false);
  const [stockHistoryVisible, setStockHistoryVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Inventory hook
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply dark mode class to HTML root
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#000';
    } else {
      htmlElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#fff';
    }
  }, [isDarkMode]);

  // Get filtered products
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

  // Handle product operations
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
      message.success('Product updated successfully!');
    } else {
      addProduct(data);
      message.success('Product added successfully!');
    }
    setProductFormVisible(false);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    message.success('Product deleted successfully!');
  };

  const handleUpdateStock = (
    productId: string,
    quantity: number,
    action: 'INCREASE' | 'DECREASE'
  ) => {
    updateStock(productId, quantity, action, undefined);
    message.success(`Stock ${action.toLowerCase()}d successfully!`);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteProducts(ids);
    message.success(`${ids.length} products deleted successfully!`);
  };

  const handleBulkRestock = (ids: string[], quantity: number) => {
    ids.forEach((id) => bulkRestock([id], quantity));
    message.success(`${ids.length} products restocked successfully!`);
  };

  const handleAddCategory = (name: string, description: string) => {
    addCategory(name, description);
    message.success('Category added successfully!');
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    message.success('Category deleted successfully!');
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('isDarkMode', JSON.stringify(newValue));
  };

  // Create theme configuration with proper dark mode
  const algorithmTheme = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;
  const themeConfig = {
    token: {
      borderRadius: 8,
      colorPrimary: '#1890ff',
      fontSize: 14,
      ...(isDarkMode && {
        colorBgBase: '#141414',
        colorTextBase: '#fff',
      }),
    },
    algorithm: algorithmTheme,
  };

  // Create product map for stock history
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const sidebarWidth = 260;
  const sidebarMargin = isMobile ? 0 : sidebarWidth;

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#000' : '#f5f5f5' }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingInline: '24px',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
            borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
            position: 'fixed',
            width: '100%',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile ? (
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onManageCategories={() => setCategoryManagementVisible(true)}
                onViewHistory={() => setStockHistoryVisible(true)}
                stockHistoryCount={stockHistory.length}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                isMobile={isMobile}
              />
            ) : null}
            <BarcodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Inventory System
            </h1>
          </div>
        </Header>

        <Layout style={{ marginTop: '64px' }}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onManageCategories={() => setCategoryManagementVisible(true)}
              onViewHistory={() => setStockHistoryVisible(true)}
              stockHistoryCount={stockHistory.length}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              isMobile={isMobile}
            />
          )}

          <Content
            style={{
              marginLeft: sidebarMargin,
              padding: isMobile ? '16px' : '24px',
              backgroundColor: isDarkMode ? '#000' : '#f5f5f5',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as TabKey)}
                size={isMobile ? 'small' : 'large'}
                items={[
                  {
                    key: 'dashboard',
                    label: 'Dashboard',
                    children: (
                      <Dashboard
                        stats={stats}
                        products={products}
                        categories={categories}
                        stockHistory={stockHistory}
                      />
                    ),
                  },
                  {
                    key: 'inventory',
                    label: 'Inventory',
                    children: (
                      <div style={{ marginTop: '16px' }}>
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
                        />
                      </div>
                    ),
                  },
                ]}
                style={{
                  backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                  borderRadius: '8px',
                  padding: '0',
                }}
              />
            </div>
          </Content>
        </Layout>

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
      </Layout>
    </ConfigProvider>
  );
};

export default App;
