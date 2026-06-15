import React, { useState } from 'react';
import * as Icons from './icons';
import paydiyaLogo from '../assets/paydiya_logo.png';

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
    payments: false,
    finance: false,
    risk: false,
    admin: false,
    developer: false
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
      icon: Icons.PaymentOperationsIcon,
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
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="logo-container">
            <img src={paydiyaLogo} alt="Paydiya logo" className="logo-image" />
          </div>
          <span className="logo-text">
            Pay<span style={{ color: 'var(--primary)' }}>diya</span>
          </span>
        </div>
      </div>

      {/* Navigation Groups Layout Tree */}
      <nav className="sidebar-menu">
        {/* Core Scope Overview Section */}
        <div className="menu-section">
          <div 
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            <div className="menu-item-link">
              <Icons.DashboardIcon className="menu-icon" />
              <span className="menu-label">Overview</span>
            </div>
          </div>
        </div>

        {/* Core Operations Section */}
        <div className="menu-section">
          {!collapsed && <div className="menu-section-title">Core Operations</div>}
          
          {menuGroups.map(group => {
            const isGroupActive = activeTab === group.id;
            const isExpanded = expandedSections[group.id];

            return (
              <div key={group.id} className="menu-group-wrapper">
                <div 
                  className={`menu-item ${isGroupActive ? 'active' : ''} ${isExpanded && !collapsed ? 'expanded' : ''}`}
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setExpandedSections(prev => ({ ...prev, [group.id]: true }));
                      handleTabClick(group.id, group.subItems[0].id);
                    } else {
                      toggleSection(group.id);
                    }
                  }}
                >
                  <div className="menu-item-link">
                    <group.icon className="menu-icon" />
                    <span className="menu-label">{group.title}</span>
                  </div>
                  {!collapsed && (
                    <Icons.ChevronDownIcon 
                      size={14} 
                      className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
                    />
                  )}
                </div>

                {/* Submenu CSS Grid Animate Wrapper Container */}
                <div className={`submenu-wrapper ${isExpanded && !collapsed ? 'open' : ''}`}>
                  <div className="submenu-list">
                    {group.subItems.map(subItem => {
                      const isSubActive = isGroupActive && activeSubTab === subItem.id;
                      return (
                        <div
                          key={subItem.id}
                          className={`submenu-item ${isSubActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid parent link bubble actions
                            handleTabClick(group.id, subItem.id);
                          }}
                        >
                          <span>{subItem.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Administration Configuration Section */}
        <div className="menu-section">
          {!collapsed && <div className="menu-section-title">System</div>}

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
              <Icons.HeadsetIcon className="menu-icon" />
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
        </div>
      </nav>

      {/* Enhanced Footer Element Container */}
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
