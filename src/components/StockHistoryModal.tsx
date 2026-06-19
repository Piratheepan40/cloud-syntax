/**
 * StockHistoryModal Component
 * Displays detailed stock movement history
 */

import React from 'react';
import { Modal, Table, Empty, Tag, Input, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Product, StockHistoryLog } from '../types';
import { formatDate, getStockStatusColor } from '../utils/helpers';

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
  const columns: ColumnsType<StockHistoryLog> = [
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp) => formatDate(timestamp),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId) => {
        const product = products.get(productId);
        return product ? (
          <Tooltip title={`ID: ${productId}`}>
            <strong>{product.name}</strong>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>Deleted Product</span>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => (
        <Tag color={action === 'INCREASE' ? '#52c41a' : action === 'DECREASE' ? '#ff7875' : '#1890ff'}>
          {action}
        </Tag>
      ),
      filters: [
        { text: 'INCREASE', value: 'INCREASE' },
        { text: 'DECREASE', value: 'DECREASE' },
        { text: 'ADJUSTMENT', value: 'ADJUSTMENT' },
      ],
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Previous Stock',
      dataIndex: 'previousStock',
      key: 'previousStock',
      width: 100,
      render: (stock) => <span style={{ color: '#666' }}>{stock}</span>,
    },
    {
      title: 'New Stock',
      dataIndex: 'newStock',
      key: 'newStock',
      width: 100,
      render: (stock) => <strong>{stock}</strong>,
    },
    {
      title: 'Change',
      dataIndex: 'id',
      key: 'change',
      width: 80,
      render: (_, record) => {
        const change = record.newStock - record.previousStock;
        const color = change > 0 ? '#52c41a' : change < 0 ? '#ff7875' : '#666';
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {change > 0 ? '+' : ''}{change}
          </span>
        );
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || <span style={{ color: '#999' }}>—</span>,
    },
  ];

  return (
    <Modal
      title="Stock Movement History"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      {stockHistory.length > 0 ? (
        <Table
          columns={columns}
          dataSource={stockHistory}
          rowKey={(record, index) => `${record.productId}-${index}`}
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} movements`,
          }}
          size="small"
          style={{ marginTop: '16px' }}
        />
      ) : (
        <Empty description="No stock movement history" style={{ marginTop: '32px' }} />
      )}
    </Modal>
  );
};
