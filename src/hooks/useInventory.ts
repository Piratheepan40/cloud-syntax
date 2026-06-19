/**
 * useInventory Hook
 * Central hook for managing inventory state with localStorage persistence
 */

import { useLocalStorage } from './useLocalStorage';
import {
  Product,
  Category,
  StockHistoryLog,
  InventoryStats,
  ProductFilters,
} from '../types';
import { generateSKU, calculateStats } from '../utils/helpers';

const PRODUCTS_KEY = 'inventory_products';
const CATEGORIES_KEY = 'inventory_categories';
const HISTORY_KEY = 'inventory_history';
const FILTERS_KEY = 'inventory_filters';

export function useInventory() {
  const [products, setProducts] = useLocalStorage<Product[]>(PRODUCTS_KEY, []);
  const [categories, setCategories] = useLocalStorage<Category[]>(CATEGORIES_KEY, [
    {
      id: 'default',
      name: 'General',
      createdAt: Date.now(),
    },
  ]);
  const [stockHistory, setStockHistory] = useLocalStorage<StockHistoryLog[]>(HISTORY_KEY, []);
  const [filters, setFilters] = useLocalStorage<ProductFilters>(FILTERS_KEY, {
    searchQuery: '',
    categoryId: null,
    stockStatus: 'all',
  });

  // Calculate statistics
  const stats = calculateStats(products);

  // Add Product
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: generateSKU(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      )
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    // Optionally clean up history for this product
  };

  // Bulk Delete Products
  const bulkDeleteProducts = (ids: string[]) => {
    setProducts(products.filter((p) => !ids.includes(p.id)));
  };

  // Update Stock
  const updateStock = (
    productId: string,
    quantity: number,
    action: 'INCREASE' | 'DECREASE' | 'ADJUSTMENT',
    notes?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const previousStock = product.stock;
    let newStock = previousStock;

    if (action === 'INCREASE') {
      newStock = previousStock + quantity;
    } else if (action === 'DECREASE') {
      newStock = Math.max(0, previousStock - quantity);
    } else {
      newStock = quantity;
    }

    // Update product stock
    updateProduct(productId, { stock: newStock });

    // Log the change
    const logEntry: StockHistoryLog = {
      id: `${productId}-${Date.now()}`,
      productId,
      productName: product.name,
      previousStock,
      newStock,
      changeQuantity: newStock - previousStock,
      timestamp: Date.now(),
      action,
      notes,
    };

    setStockHistory([logEntry, ...stockHistory]);
  };

  // Bulk Restock
  const bulkRestock = (ids: string[], quantity: number) => {
    ids.forEach((id) => {
      updateStock(id, quantity, 'INCREASE', 'Bulk restock operation');
    });
  };

  // Add Category
  const addCategory = (name: string, description?: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
      createdAt: Date.now(),
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  // Delete Category
  const deleteCategory = (id: string) => {
    // Reassign products in this category to default
    setProducts(
      products.map((p) =>
        p.categoryId === id ? { ...p, categoryId: 'default' } : p
      )
    );
    setCategories(categories.filter((c) => c.id !== id));
  };

  // Get filtered products
  const getFilteredProducts = () => {
    return products.filter((product) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !product.name.toLowerCase().includes(query) &&
          !product.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }

      // Stock status filter
      if (filters.stockStatus === 'in-stock' && product.stock === 0) {
        return false;
      }
      if (filters.stockStatus === 'out-of-stock' && product.stock > 0) {
        return false;
      }

      return true;
    });
  };

  return {
    // State
    products,
    categories,
    stockHistory,
    filters,
    stats,

    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,

    // Stock operations
    updateStock,
    bulkRestock,

    // Category operations
    addCategory,
    deleteCategory,

    // Filter operations
    setFilters,
    getFilteredProducts,
  };
}
