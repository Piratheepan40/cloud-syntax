/**
 * Sidebar Navigation Component
 * Premium navigation with category management and history
 */

import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Badge,
  Divider,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  LayoutOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  SettingOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  activeTab: 'dashboard' | 'inventory';
  onTabChange: (tab: 'dashboard' | 'inventory') => void;
  onManageCategories: () => void;
  onViewHistory: () => void;
  stockHistoryCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onManageCategories,
  onViewHistory,
  stockHistoryCount,
  isDarkMode,
  onToggleDarkMode,
  isMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <span style={{ fontSize: '18px' }}>📊</span>,
      label: 'Dashboard',
      onClick: () => {
        onTabChange('dashboard');
        setDrawerOpen(false);
      },
    },
    {
      key: 'inventory',
      icon: <span style={{ fontSize: '18px' }}>📦</span>,
      label: 'Inventory',
      onClick: () => {
        onTabChange('inventory');
        setDrawerOpen(false);
      },
    },
  ];

  const actionItems = [
    {
      key: 'history',
      icon: null,
      label: '📊 Stock History',
      badge: stockHistoryCount,
      onClick: () => {
        onViewHistory();
        setDrawerOpen(false);
      },
    },
    {
      key: 'categories',
      icon: null,
      label: '🏷️ Manage Categories',
      onClick: () => {
        onManageCategories();
        setDrawerOpen(false);
      },
    },
  ];

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: isMobile ? '0' : '0',
      }}
    >
      {/* Main Navigation */}
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="vertical"
        selectedKeys={[activeTab]}
        items={menuItems}
        style={{
          flex: 1,
          border: 'none',
          backgroundColor: isDarkMode ? '#141414' : '#fff',
        }}
      />

      <Divider
        style={{
          margin: isMobile ? '12px 0' : '8px 0',
          backgroundColor: isDarkMode ? '#434343' : '#f0f0f0',
        }}
      />

      {/* Action Items Section */}
      <div
        style={{
          padding: isMobile ? '16px' : '12px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '12px' : '8px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isDarkMode ? '#999' : '#666',
            paddingLeft: isMobile ? '0' : '16px',
            paddingRight: isMobile ? '0' : '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Tools
        </div>

        {actionItems.map((item) => (
          <Button
            key={item.key}
            type="text"
            onClick={item.onClick}
            style={{
              width: '100%',
              textAlign: 'left',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: isDarkMode ? '#fff' : '#000',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor: isDarkMode ? 'transparent' : 'transparent',
              paddingLeft: isMobile ? '16px' : '16px',
              paddingRight: isMobile ? '16px' : '16px',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? '#262626'
                  : '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              {item.label}
            </span>
            {item.badge && item.badge > 0 && (
              <Badge count={item.badge} showZero={false} color="#ff7875" />
            )}
          </Button>
        ))}
      </div>

      <Divider
        style={{
          margin: isMobile ? '12px 0' : '8px 0',
          backgroundColor: isDarkMode ? '#434343' : '#f0f0f0',
        }}
      />

      {/* Theme Toggle */}
      <div style={{ padding: isMobile ? '16px' : '12px 16px' }}>
        <Button
          type="primary"
          onClick={onToggleDarkMode}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '6px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
          }}
        >
          <span>{isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="text"
          icon={drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            fontSize: '18px',
            width: '40px',
            height: '40px',
          }}
        />

        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
          bodyStyle={{
            padding: '0',
            backgroundColor: isDarkMode ? '#141414' : '#fff',
          }}
          headerStyle={{
            backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
            borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return (
    <Layout.Sider
      width={260}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        backgroundColor: isDarkMode ? '#141414' : '#fff',
        borderRight: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
        overflowY: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
      }}
      trigger={
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{
            position: 'absolute',
            right: '-40px',
            top: '20px',
            zIndex: 100,
          }}
        />
      }
    >
      {sidebarContent}
    </Layout.Sider>
  );
};
