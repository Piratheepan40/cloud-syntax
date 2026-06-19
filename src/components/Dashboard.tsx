/**
 * Dashboard Component
 * Displays inventory statistics, charts, and recent activity
 */

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Empty,
  Divider,
  Tag,
  Timeline,
  Spin,
  Collapse,
} from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  WarningOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Product, Category, InventoryStats, StockHistoryLog } from '../types';
import { formatCurrency, formatDateOnly, getStockStatus, getStockStatusColor } from '../utils/helpers';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeCollapseSections, setActiveCollapseSections] = useState<string[]>([
    'categories',
    'alerts',
    'activity',
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Get products with low stock (less than 10 units)
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);

  // Get most valuable products (top 5 by inventory value)
  const mostValuableProducts = products
    .map((p) => ({ ...p, value: p.price * p.stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Get recent stock history (last 10 items)
  const recentHistory = stockHistory.slice(-10).reverse();

  // Build responsive low stock columns
  const lowStockColumns: ColumnsType<Product> = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
      width: isMobile ? '50%' : undefined,
    },
  ];

  if (!isMobile) {
    lowStockColumns.push({
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => categoryMap.get(categoryId) || 'Unknown',
    });
  }

  lowStockColumns.push({
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    render: (stock) => (
      <Tag color={getStockStatusColor(stock)}>
        {stock} units
      </Tag>
    ),
  });

  if (!isMobile) {
    lowStockColumns.push({
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
    });
  }

  // Build responsive valuable columns
  const valuableColumns: ColumnsType<Product & { value: number }> = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
      width: isMobile ? '50%' : undefined,
    },
  ];

  if (!isMobile) {
    valuableColumns.push({
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    });
    valuableColumns.push({
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
    });
  }

  valuableColumns.push({
    title: 'Total Value',
    dataIndex: 'value',
    key: 'value',
    render: (value) => <strong>{formatCurrency(value)}</strong>,
  });

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Key Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#fff',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Products</span>}
                value={stats.totalProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#fff', fontSize: isMobile ? '20px' : '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                color: '#fff',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Inventory Value</span>}
                value={stats.totalInventoryValue}
                prefix={<DollarOutlined />}
                suffix=" USD"
                formatter={(value: any) => {
                  const numValue = Number(value);
                  return numValue >= 1000000
                    ? `$${(numValue / 1000000).toFixed(2)}M`
                    : numValue >= 1000
                    ? `$${(numValue / 1000).toFixed(2)}K`
                    : `$${numValue.toFixed(2)}`;
                }}
                valueStyle={{ color: '#fff', fontSize: isMobile ? '20px' : '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                color: '#fff',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Stock Quantity</span>}
                value={stats.totalStockQuantity}
                valueStyle={{ color: '#fff', fontSize: isMobile ? '20px' : '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                border: 'none',
                color: '#fff',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Out of Stock</span>}
                value={stats.outOfStockCount}
                prefix={<WarningOutlined />}
                valueStyle={{
                  color: '#fff',
                  fontSize: isMobile ? '20px' : '28px',
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Collapsible Sections */}
        <Collapse
          items={[
            {
              key: 'categories',
              label: <div style={{ fontWeight: '600', fontSize: '14px' }}>📦 Inventory by Category</div>,
              children: (
                <Row gutter={[16, 16]}>
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const categoryProducts = products.filter((p) => p.categoryId === cat.id);
                      const categoryValue = categoryProducts.reduce(
                        (sum, p) => sum + p.price * p.stock,
                        0
                      );
                      const categoryStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);

                      return (
                        <Col xs={24} sm={12} md={isMobile ? 12 : 8} key={cat.id}>
                          <div
                            style={{
                              padding: '16px 18px',
                              borderLeft: '4px solid #1890ff',
                              borderRadius: '4px',
                              backgroundColor: '#f5f5f5',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: isMobile ? '13px' : '14px', color: '#262626' }}>
                              {cat.name}
                            </div>
                            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#8c8c8c', lineHeight: '1.6' }}>
                              {categoryProducts.length} products · {categoryStock} units ·{' '}
                              {formatCurrency(categoryValue)}
                            </div>
                          </div>
                        </Col>
                      );
                    })
                  ) : (
                    <Col xs={24}>
                      <Empty description="No categories yet" />
                    </Col>
                  )}
                </Row>
              ),
            },
            {
              key: 'alerts',
              label: (
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  ⚠️ Alerts & Insights
                  {lowStockProducts.length > 0 && (
                    <Tag color="red" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {lowStockProducts.length} Low Stock
                    </Tag>
                  )}
                </div>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {/* Low Stock Alert */}
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <div>
                          <WarningOutlined style={{ color: '#ff7875', marginRight: '8px' }} />
                          Low Stock Alert
                        </div>
                      }
                      size="small"
                      style={{ height: '100%' }}
                    >
                      {lowStockProducts.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <Table
                            columns={lowStockColumns}
                            dataSource={lowStockProducts}
                            pagination={false}
                            rowKey="id"
                            size={isMobile ? 'small' : 'middle'}
                            scroll={{ x: isMobile ? 400 : undefined }}
                          />
                        </div>
                      ) : (
                        <Empty description="All products are well stocked" />
                      )}
                    </Card>
                  </Col>

                  {/* Most Valuable Products */}
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <div>
                          <DollarOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          Top 5 Most Valuable
                        </div>
                      }
                      size="small"
                      style={{ height: '100%' }}
                    >
                      {mostValuableProducts.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <Table
                            columns={valuableColumns}
                            dataSource={mostValuableProducts}
                            pagination={false}
                            rowKey="id"
                            size={isMobile ? 'small' : 'middle'}
                            scroll={{ x: isMobile ? 400 : undefined }}
                          />
                        </div>
                      ) : (
                        <Empty description="No products yet" />
                      )}
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'activity',
              label: <div style={{ fontWeight: '600', fontSize: '14px' }}>📊 Recent Stock Activity</div>,
              children: (
                <Card size="small">
                  {recentHistory.length > 0 ? (
                    <div style={{ fontSize: isMobile ? '12px' : '14px' }}>
                      <Timeline
                        items={recentHistory.map((log) => {
                          const product = products.find((p) => p.id === log.productId);
                          const isIncrease = log.action === 'INCREASE';
                          const color = isIncrease ? '#52c41a' : '#ff7875';

                          return {
                            dot: isIncrease ? '📈' : '📉',
                            children: (
                              <div>
                                <div style={{ marginBottom: '4px' }}>
                                  <strong>{product?.name || 'Unknown Product'}</strong>
                                  <Tag color={color} style={{ marginLeft: '8px', fontSize: isMobile ? '10px' : '12px' }}>
                                    {log.action}
                                  </Tag>
                                </div>
                                <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#666' }}>
                                  {log.previousStock} → {log.newStock} units
                                  {log.notes && <div> Note: {log.notes}</div>}
                                </div>
                                <div style={{ fontSize: isMobile ? '9px' : '11px', color: '#999', marginTop: '4px' }}>
                                  {formatDateOnly(log.timestamp)}
                                </div>
                              </div>
                            ),
                          };
                        })}
                      />
                    </div>
                  ) : (
                    <Empty description="No activity yet" />
                  )}
                </Card>
              ),
            },
          ]}
          activeKey={activeCollapseSections}
          onChange={(keys) => setActiveCollapseSections(keys as string[])}
          style={{ borderRadius: '8px' }}
        />
      </div>
    </Spin>
  );
};
