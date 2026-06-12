import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import OverviewTab from './components/tabs/OverviewTab';
import MerchantsTab from './components/tabs/MerchantsTab';
import PaymentsTab from './components/tabs/PaymentsTab';
import FinanceTab from './components/tabs/FinanceTab';
import RiskTab from './components/tabs/RiskTab';
import DevToolsTab from './components/tabs/DevToolsTab';
import AdminTab from './components/tabs/AdminTab';
import SupportTab from './components/tabs/SupportTab';
import SettingsTab from './components/tabs/SettingsTab';
import * as Icons from './components/icons';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync theme attribute with document element on load & toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Ctrl+K shortcut to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {!sidebarCollapsed && (
        <div className="sidebar-backdrop" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className="main-content">
        <Navbar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          theme={theme}
          setTheme={setTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeNotificationsCount={3}
        />

        {/* Dynamic page tab routing */}
        <main style={{ flexGrow: 1 }}>
          {activeTab === 'overview' && <OverviewTab />}

          {activeTab === 'merchants' && (
            <MerchantsTab searchQuery={searchQuery} />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab searchQuery={searchQuery} subTab={activeSubTab} />
          )}

          {activeTab === 'finance' && (
            <FinanceTab searchQuery={searchQuery} subTab={activeSubTab} />
          )}

          {activeTab === 'risk' && (
            <RiskTab searchQuery={searchQuery} subTab={activeSubTab} />
          )}

          {activeTab === 'admin' && (
            <AdminTab searchQuery={searchQuery} subTab={activeSubTab} />
          )}

          {activeTab === 'developer' && (
            <DevToolsTab searchQuery={searchQuery} subTab={activeSubTab} />
          )}

          {activeTab === 'support' && (
            <SupportTab searchQuery={searchQuery} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}

          {activeTab === 'reports' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">Corporate Financial Reports</h1>
                <span className="page-subtitle">Download official audits, transaction ledgers, and compliance tax filings.</span>
              </div>
              <div className="metrics-grid" style={{ marginTop: '12px' }}>
                {[
                  { title: 'Settlement Logs May 2026', type: 'PDF Report', size: '2.4 MB', date: '2026-06-01' },
                  { title: 'PCI Compliance Attestation v4.0', type: 'Certificate Audit', size: '4.8 MB', date: '2026-05-15' },
                  { title: 'Interchange commission yields (Q1)', type: 'Excel Spreadsheet', size: '1.2 MB', date: '2026-04-30' },
                  { title: 'Gateway fraud velocity audit log', type: 'CSV Document', size: '8.4 MB', date: '2026-06-11' },
                ].map((rep, idx) => (
                  <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Icons.FileIcon size={24} style={{ color: 'var(--primary)' }} />
                      <div>
                        <h3 style={{ fontSize: '13px', fontWeight: 700 }}>{rep.title}</h3>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rep.type} • {rep.size}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Issued: {rep.date}</span>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => alert(`Starting download for ${rep.title}...`)}
                      >
                        Download file
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
