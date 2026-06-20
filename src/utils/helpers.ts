/**
 * Utility Functions and Helpers
 * Reusable functions for inventory management operations
 */

import { Product, InventoryStats } from '../types';

/**
 * Generate unique SKU (Stock Keeping Unit)
 * Format: INV-XXXXXXXXXX (timestamp-based with random suffix)
 */
export function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${timestamp}${random}`;
}

/**
 * Calculate inventory statistics from products array
 */
export function calculateStats(products: Product[]): InventoryStats {
  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return {
    totalProducts,
    totalInventoryValue,
    totalStockQuantity,
    outOfStockCount,
    categoriesCount: 0, // Will be set separately
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Format date to date only (without time)
 */
export function formatDateOnly(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format time only
 */
export function formatTimeOnly(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          // Handle nested objects and arrays
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          // Escape quotes and wrap in quotes if contains comma
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Debounce function for search and filter operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Validate product data
 */
export function validateProduct(data: any): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (Number(data.price) < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (data.stock === undefined || data.stock === null) {
    errors.stock = 'Stock quantity is required';
  } else if (Number(data.stock) < 0) {
    errors.stock = 'Stock cannot be negative';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get product status badge text
 */
export function getStockStatus(stock: number): string {
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
}

/**
 * Get product status badge color
 */
export function getStockStatusColor(stock: number): string {
  if (stock === 0) return 'red';
  if (stock < 10) return 'orange';
  return 'green';
}

/**
 * Parse CSV file
 */
export async function parseCSVFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');

        const data = lines.slice(1)
          .filter((line) => line.trim().length > 0)
          .map((line) => {
            const values = line.split(',');
            const row: Record<string, any> = {};

            headers.forEach((header, index) => {
              row[header.trim()] = values[index]?.trim() || '';
            });

            return row;
          });

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
