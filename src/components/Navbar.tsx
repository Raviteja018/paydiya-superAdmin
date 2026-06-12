import React, { useState } from 'react';
import * as Icons from './icons';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeNotificationsCount: number;
}

export default function Navbar({
  collapsed,
  setCollapsed,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  activeNotificationsCount
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const notifications = [
    {
      id: 1,
      title: 'High Risk Alert (Fraud Score: 94)',
      desc: 'Prime Crypto Swap: Flagged payment of $12,500.00 from anonymous IP.',
      time: '6m ago',
      type: 'fraud',
      color: 'var(--error)'
    },
    {
      id: 2,
      title: 'Action Required: Support Ticket #2940',
      desc: 'Apex Retailers: Refund failure with endpoint API error code 502.',
      time: '2h ago',
      type: 'support',
      color: 'var(--warning)'
    },
    {
      id: 3,
      title: 'Settlement Failed',
      desc: 'Velocity Gaming: AXIS Bank account returned invalid IFSC code.',
      time: '4h ago',
      type: 'finance',
      color: 'var(--error)'
    }
  ];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icons.MenuIcon size={20} />
        </button>

        <div className="search-bar-container">
          <Icons.SearchIcon className="search-icon-inline" />
          <input 
            type="text" 
            placeholder={isMobile ? "Search..." : "Search transactions, merchants, settings... (Ctrl + K)"} 
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut hide-on-mobile">⌘K</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="nav-actions-group">
          {/* Health Indicator */}
          <div 
            className="hide-on-mobile"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              padding: '0 8px',
              borderRight: '1px solid var(--border-color)',
              marginRight: '8px'
            }}
          >
            <span className="live-pulse"></span>
            <span>API Gateway 42ms</span>
          </div>

          {/* Theme Switcher */}
          <button 
            className="nav-action-btn theme-toggle" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Icons.SunIcon size={18} /> : <Icons.MoonIcon size={18} />}
          </button>

          {/* Bell Notifications */}
          <div style={{ position: 'relative' }}>
            <button 
              className="nav-action-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              title="Alert center"
            >
              <Icons.BellIcon size={18} />
              {activeNotificationsCount > 0 && <span className="nav-badge"></span>}
            </button>

            {showNotifications && (
              <div 
                className="card glass animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '360px',
                  padding: '16px',
                  zIndex: 60,
                  boxShadow: 'var(--shadow-premium)',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>System Alerts</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '10px', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                      <div style={{ marginTop: '2px', color: item.color }}>
                        {item.type === 'fraud' && <Icons.ShieldIcon size={14} />}
                        {item.type === 'support' && <Icons.SupportIcon size={14} />}
                        {item.type === 'finance' && <Icons.FinanceIcon size={14} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4' }}>{item.desc}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="nav-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>SJ</div>
            <Icons.ChevronDownIcon size={14} style={{ opacity: 0.5 }} />
          </div>

          {showProfileMenu && (
            <div 
              className="card glass animate-fade-in"
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '180px',
                padding: '8px',
                zIndex: 60,
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>sjenkins@paydiya.com</div>
              </div>
              <div 
                className="menu-item"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => { setShowProfileMenu(false); }}
              >
                <span>My Profile</span>
              </div>
              <div 
                className="menu-item"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => { setShowProfileMenu(false); }}
              >
                <span>Security Settings</span>
              </div>
              <div 
                className="menu-item"
                style={{ padding: '6px 12px', fontSize: '12px', borderTop: '1px solid var(--border-color)', marginTop: '4px', color: 'var(--error)' }}
                onClick={() => { setShowProfileMenu(false); }}
              >
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
