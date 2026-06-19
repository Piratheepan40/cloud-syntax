/**
 * InventoryTable Component
 * Main table displaying products with inline actions
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Select,
  Row,
  Col,
  Tag,
  InputNumber,
  Tooltip,
  Card,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Product, Category, ProductFilters } from '../types';
import { formatCurrency, getStockStatus, getStockStatusColor, exportToCSV } from '../utils/helpers';

interface InventoryTableProps {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  selectedRowKeys: React.Key[];
  loading?: boolean;
  onFiltersChange: (filters: ProductFilters) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddNew: () => void;
  onUpdateStock: (productId: string, quantity: number, action: 'INCREASE' | 'DECREASE') => void;
  onSelectedChange: (keys: React.Key[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkRestock?: (ids: string[], quantity: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  categories,
  filters,
  selectedRowKeys,
  loading,
  onFiltersChange,
  onEdit,
  onDelete,
  onAddNew,
  onUpdateStock,
  onSelectedChange,
  onBulkDelete,
  onBulkRestock,
}) => {
  const [restockQuantity, setRestockQuantity] = useState<number>(10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Build responsive columns
  const baseColumns: ColumnsType<Product> = [];

  if (!isMobile) {
    baseColumns.push({
      title: 'Product ID (SKU)',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => <code style={{ fontSize: '12px' }}>{text}</code>,
    });
  }

  baseColumns.push({
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name',
    width: isMobile ? undefined : 200,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (text) => <strong>{text}</strong>,
  });

  if (!isMobile) {
    baseColumns.push({
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
      render: (categoryId) => categoryMap.get(categoryId) || 'Unknown',
      filters: categories.map((c) => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.categoryId === value,
    });
  }

  baseColumns.push({
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: isMobile ? undefined : 100,
    sorter: (a, b) => a.price - b.price,
    render: (price) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(price)}</span>,
  });

  baseColumns.push({
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    width: isMobile ? undefined : 120,
    sorter: (a, b) => a.stock - b.stock,
    render: (stock) => (
      <Tag color={getStockStatusColor(stock)} style={{ fontSize: '12px', padding: '4px 8px' }}>
        {stock} units
      </Tag>
    ),
  });

  if (!isMobile) {
    baseColumns.push({
      title: 'Inventory Value',
      dataIndex: 'id',
      key: 'value',
      width: 130,
      render: (_, record) => formatCurrency(record.price * record.stock),
    });
  }

  baseColumns.push({
    title: 'Actions',
    key: 'actions',
    width: isMobile ? 80 : 200,
    render: (_, record) => (
      <Space size="small" wrap style={{ flexWrap: 'wrap', justifyContent: 'flex-end', gap: '4px' }}>
        <Tooltip title="Decrease Stock">
          <Button
            type="text"
            size={isMobile ? 'small' : 'middle'}
            icon={<ArrowDownOutlined style={{ fontSize: '16px' }} />}
            onClick={() => onUpdateStock(record.id, 1, 'DECREASE')}
            danger
            style={{ padding: '4px 8px' }}
          />
        </Tooltip>
        <Tooltip title="Increase Stock">
          <Button
            type="primary"
            size={isMobile ? 'small' : 'middle'}
            icon={<ArrowUpOutlined style={{ fontSize: '16px' }} />}
            onClick={() => onUpdateStock(record.id, 1, 'INCREASE')}
            style={{ padding: '4px 8px' }}
          />
        </Tooltip>
        <Tooltip title="Edit Product">
          <Button
            type="text"
            size={isMobile ? 'small' : 'middle'}
            icon={<EditOutlined style={{ fontSize: '16px' }} />}
            onClick={() => onEdit(record)}
            style={{ padding: '4px 8px' }}
          />
        </Tooltip>
        <Tooltip title="Delete Product">
          <Popconfirm
            title="Delete Product"
            description={isMobile ? "Delete?" : "Are you sure you want to delete this product?"}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size={isMobile ? 'small' : 'middle'} icon={<DeleteOutlined style={{ fontSize: '16px' }} />} danger style={{ padding: '4px 8px' }} />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  });

  const columns = baseColumns;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleCategoryFilterChange = (value: string | null) => {
    onFiltersChange({ ...filters, categoryId: value });
  };

  const handleStockStatusChange = (value: string) => {
    onFiltersChange({ ...filters, stockStatus: value as any });
  };

  const handleExportCSV = () => {
    const exportData = products.map((p) => ({
      SKU: p.id,
      'Product Name': p.name,
      Category: categoryMap.get(p.categoryId) || 'Unknown',
      Price: `$${p.price.toFixed(2)}`,
      Stock: p.stock,
      'Inventory Value': `$${(p.price * p.stock).toFixed(2)}`,
      Status: getStockStatus(p.stock),
    }));
    exportToCSV(exportData, 'inventory-export.csv');
  };

  const hasSelected = selectedRowKeys.length > 0;

  const tableProps: TableProps<Product> = {
    rowKey: 'id',
    columns,
    dataSource: products,
    loading,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} products`,
    },
    rowSelection: {
      selectedRowKeys,
      onChange: onSelectedChange,
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filters Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="Search by name or SKU..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Filter by category"
            value={filters.categoryId || undefined}
            onChange={handleCategoryFilterChange}
            allowClear
            size="large"
            style={{ width: '100%' }}
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Filter by stock status"
            value={filters.stockStatus}
            onChange={handleStockStatusChange}
            size="large"
            style={{ width: '100%' }}
          >
            <Select.Option value="all">All Products</Select.Option>
            <Select.Option value="in-stock">In Stock</Select.Option>
            <Select.Option value="out-of-stock">Out of Stock</Select.Option>
          </Select>
        </Col>
      </Row>

      {/* Action Buttons Section */}
      <Row gutter={[8, 8]} justify="space-between" align="middle" wrap>
        <Col xs={24} sm="auto">
          <Space wrap size={isMobile ? 'small' : 'middle'}>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew} size={isMobile ? 'small' : 'large'}>
              {isMobile ? 'Add' : 'Add Product'}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV} size={isMobile ? 'small' : 'large'}>
              {isMobile ? 'Export' : 'Export CSV'}
            </Button>
          </Space>
        </Col>
        {hasSelected && (
          <Col xs={24} sm="auto">
            <Space wrap size={isMobile ? 'small' : 'middle'}>
              <span style={{ color: '#999', fontSize: isMobile ? '12px' : '14px' }}>
                {selectedRowKeys.length} selected
              </span>
              {onBulkRestock && (
                <Popconfirm
                  title="Bulk Restock"
                  description={
                    <div>
                      <p>Restock quantity for each product:</p>
                      <InputNumber
                        min={1}
                        value={restockQuantity}
                        onChange={(val) => setRestockQuantity(val || 10)}
                        size="small"
                      />
                    </div>
                  }
                  onConfirm={() => {
                    onBulkRestock(selectedRowKeys as string[], restockQuantity);
                    onSelectedChange([]);
                  }}
                  okText="Restock"
                >
                  <Button type="dashed" size={isMobile ? 'small' : 'middle'}>
                    {isMobile ? 'Restock' : 'Bulk Restock'}
                  </Button>
                </Popconfirm>
              )}
              {onBulkDelete && (
                <Popconfirm
                  title="Bulk Delete"
                  description={isMobile ? "Delete selected?" : "Are you sure you want to delete all selected products?"}
                  onConfirm={() => {
                    onBulkDelete(selectedRowKeys as string[]);
                    onSelectedChange([]);
                  }}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size={isMobile ? 'small' : 'middle'}>
                    {isMobile ? 'Delete' : 'Bulk Delete'}
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        )}
      </Row>

      {/* Table */}
      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <Table<Product> {...tableProps} scroll={{ x: isMobile ? 800 : undefined }} />
      </div>
    </div>
  );
};
