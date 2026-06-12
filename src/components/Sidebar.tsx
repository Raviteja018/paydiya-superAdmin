import React, { useState } from 'react';
import * as Icons from './icons';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface MenuSubItem {
  id: string;
  label: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subItems?: MenuSubItem[];
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
  collapsed,
  setCollapsed
}: SidebarProps) {
  // Manage which menu groups are expanded in sidebar
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    merchants: true,
    payments: true,
    finance: true,
    risk: true,
    admin: true,
    developer: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTabClick = (tabId: string, subTabId = '') => {
    setActiveTab(tabId);
    setActiveSubTab(subTabId);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

  const menuGroups = [
    {
      title: 'Merchant Management',
      id: 'merchants',
      icon: Icons.MerchantIcon,
      subItems: [
        { id: 'all', label: 'Merchants' },
        { id: 'kyc', label: 'KYC Approvals' },
        { id: 'suspended', label: 'Suspended Merchants' }
      ]
    },
    {
      title: 'Payment Operations',
      id: 'payments',
      icon: Icons.TransactionIcon,
      subItems: [
        { id: 'transactions', label: 'Transactions' },
        { id: 'refunds', label: 'Refunds' },
        { id: 'disputes', label: 'Disputes' },
        { id: 'chargebacks', label: 'Chargebacks' }
      ]
    },
    {
      title: 'Finance',
      id: 'finance',
      icon: Icons.FinanceIcon,
      subItems: [
        { id: 'settlements', label: 'Settlements' },
        { id: 'revenue', label: 'Revenue Analytics' },
        { id: 'fees', label: 'Fee Management' }
      ]
    },
    {
      title: 'Risk & Compliance',
      id: 'risk',
      icon: Icons.ShieldIcon,
      subItems: [
        { id: 'fraud', label: 'Fraud Monitoring' },
        { id: 'blacklist', label: 'Blacklisted Accounts' },
        { id: 'compliance', label: 'Compliance Reports' }
      ]
    },
    {
      title: 'Administration',
      id: 'admin',
      icon: Icons.UsersIcon,
      subItems: [
        { id: 'users', label: 'Users' },
        { id: 'roles', label: 'Roles & Permissions' },
        { id: 'audit', label: 'Audit Logs' }
      ]
    },
    {
      title: 'Developer Tools',
      id: 'developer',
      icon: Icons.DeveloperIcon,
      subItems: [
        { id: 'keys', label: 'API Keys' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'usage', label: 'API Usage' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">P</div>
        <span className="logo-text">
          Pay<span style={{ color: 'var(--primary)' }}>diya</span>
          <span className="logo-badge">Pro</span>
        </span>
      </div>

      <nav className="sidebar-menu">
        {/* Overview Tab */}
        <div 
          className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabClick('overview')}
        >
          <div className="menu-item-link">
            <Icons.DashboardIcon className="menu-icon" />
            <span className="menu-label">Overview</span>
          </div>
        </div>

        {/* Grouped sections */}
        {menuGroups.map(group => {
          const isGroupActive = activeTab === group.id;
          const isExpanded = expandedSections[group.id];

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div 
                className={`menu-item ${isGroupActive ? 'active' : ''}`}
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                  }
                  toggleSection(group.id);
                  handleTabClick(group.id, group.subItems[0].id);
                }}
              >
                <div className="menu-item-link">
                  <group.icon className="menu-icon" />
                  <span className="menu-label">{group.title}</span>
                </div>
                {!collapsed && (
                  <Icons.ChevronDownIcon 
                    size={14} 
                    style={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)',
                      opacity: 0.5 
                    }} 
                  />
                )}
              </div>

              {/* Submenu Accordion */}
              {isExpanded && !collapsed && (
                <div className="submenu-list">
                  {group.subItems.map(subItem => {
                    const isSubActive = isGroupActive && activeSubTab === subItem.id;
                    return (
                      <div
                        key={subItem.id}
                        className={`submenu-item ${isSubActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(group.id, subItem.id)}
                      >
                        <span>{subItem.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="menu-section-title" style={{ marginTop: '12px' }}>System</div>

        {/* Reports */}
        <div 
          className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabClick('reports')}
        >
          <div className="menu-item-link">
            <Icons.FileIcon className="menu-icon" />
            <span className="menu-label">Reports</span>
          </div>
        </div>

        {/* Support Center */}
        <div 
          className={`menu-item ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => handleTabClick('support')}
        >
          <div className="menu-item-link">
            <Icons.SupportIcon className="menu-icon" />
            <span className="menu-label">Support Center</span>
          </div>
        </div>

        {/* Settings */}
        <div 
          className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabClick('settings')}
        >
          <div className="menu-item-link">
            <Icons.SettingsIcon className="menu-icon" />
            <span className="menu-label">Settings</span>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="profile-avatar-container">
          <div className="profile-avatar">SJ</div>
          <span className="status-dot-pulse" />
        </div>
        <div className="profile-info">
          <span className="profile-name">Sarah Jenkins</span>
          <span className="profile-role">Super Admin</span>
        </div>
      </div>
    </aside>
  );
}
