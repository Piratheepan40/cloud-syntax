/**
 * Inventory Management System - Type Definitions
 * Strict TypeScript interfaces for type safety across the application
 */

/** Product Category Interface */
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

/** Product Interface - Core entity */
export interface Product {
  id: string; // Auto-generated SKU
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  createdAt: number;
  updatedAt: number;
}

/** Stock History Log Entry */
export interface StockHistoryLog {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeQuantity: number;
  timestamp: number;
  action: 'INCREASE' | 'DECREASE' | 'ADJUSTMENT';
  notes?: string;
}

/** Inventory Statistics */
export interface InventoryStats {
  totalProducts: number;
  totalInventoryValue: number;
  totalStockQuantity: number;
  outOfStockCount: number;
  categoriesCount: number;
}

/** Filter Options for Product Table */
export interface ProductFilters {
  searchQuery: string;
  categoryId: string | null;
  stockStatus: 'all' | 'in-stock' | 'out-of-stock';
}

/** Pagination State */
export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/** Theme Type */
export type ThemeType = 'light' | 'dark';

/** Application State Context */
export interface AppContextType {
  products: Product[];
  categories: Category[];
  stockHistory: StockHistoryLog[];
  filters: ProductFilters;
  isDarkMode: boolean;
  stats: InventoryStats;
}

/** Form Submission Response */
export interface FormSubmitResponse {
  success: boolean;
  message: string;
  data?: any;
}

/** Bulk Action Payload */
export interface BulkActionPayload {
  selectedIds: string[];
  action: 'delete' | 'restock';
  restockQuantity?: number;
}
