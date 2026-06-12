import React, { useState } from 'react';
import * as Icons from '../icons';
import { initialMerchants, initialTransactions } from '../../mockData';
import type { Merchant } from '../../mockData';
import ScrollableTable from '../ScrollableTable';

interface MerchantsTabProps {
  searchQuery: string;
}

export default function MerchantsTab({ searchQuery }: MerchantsTabProps) {
  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [kycFilter, setKycFilter] = useState<string>('All');
  const [drawerTab, setDrawerTab] = useState<'compliance' | 'transactions' | 'settings'>('compliance');
  const [pennyDropStatus, setPennyDropStatus] = useState<{[key: string]: 'idle' | 'loading' | 'verified' | 'failed'}>({});
  const [viewingDoc, setViewingDoc] = useState<{title: string; merchantName: string; pan?: string; taxId?: string} | null>(null);
  const [txSearchQuery, setTxSearchQuery] = useState<string>('');

  // Filter merchants based on search, categories, and KYC status
  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          merchant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          merchant.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || merchant.businessCategory === categoryFilter;
    const matchesKyc = kycFilter === 'All' || merchant.kycStatus === kycFilter;

    return matchesSearch && matchesCategory && matchesKyc;
  });

  const handleKycStatusUpdate = (merchantId: string, nextStatus: Merchant['kycStatus']) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const updated = { ...m, kycStatus: nextStatus };
        if (selectedMerchant && selectedMerchant.id === merchantId) {
          setSelectedMerchant(updated);
        }
        return updated;
      }
      return m;
    }));
  };

  const handleMerchantStatusUpdate = (merchantId: string, nextStatus: Merchant['status']) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const updated = { ...m, status: nextStatus };
        if (selectedMerchant && selectedMerchant.id === merchantId) {
          setSelectedMerchant(updated);
        }
        return updated;
      }
      return m;
    }));
  };

  const handlePennyDrop = (merchantId: string) => {
    setPennyDropStatus(prev => ({ ...prev, [merchantId]: 'loading' }));
    setTimeout(() => {
      setPennyDropStatus(prev => ({ ...prev, [merchantId]: 'verified' }));
    }, 1800);
  };

  const categories = [
    'All',
    'E-commerce',
    'Software / SaaS',
    'Transportation',
    'Gaming',
    'Marketplace',
    'Crypto / Forex',
    'Education',
    'On-Demand',
    'Medical',
    'Hospitality',
    'Subscription Services',
    'Travel',
    'Food & Beverage',
    'Wholesale',
    'Insurance',
    'Telecom',
    'Automotive',
    'Utilities',
    'Professional Services',
    'Real Estate',
    'Media & Entertainment',
  ];

  // Initials and gradient avatar helpers
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'linear-gradient(135deg, #0F764E 0%, #10B981 100%)', // Forest Green
      'linear-gradient(135deg, #0f4e76 0%, #1d72b8 100%)', // Sea Blue
      'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', // Amber
      'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', // Purple
      'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)', // Red
    ];
    return colors[hash % colors.length];
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'E-commerce':
        return { border: '1px solid var(--success-glow)', color: 'var(--success)', backgroundColor: 'var(--success-glow)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      case 'Software / SaaS':
        return { border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      case 'Crypto / Forex':
        return { border: '1px solid var(--secondary-glow)', color: 'var(--secondary)', backgroundColor: 'var(--secondary-glow)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      case 'Gaming':
        return { border: '1px solid rgba(236, 72, 153, 0.2)', color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      case 'Medical':
        return { border: '1px solid rgba(14, 165, 233, 0.2)', color: '#0EA5E9', backgroundColor: 'rgba(14, 165, 233, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      case 'Transportation':
        return { border: '1px solid rgba(139, 92, 246, 0.2)', color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
      default:
        return { border: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 };
    }
  };

  const categoryDisplayThreshold = 12;
  const useCategoryDropdown = categories.length > categoryDisplayThreshold;

  // Sparkline generator helper
  const getSparklinePath = (points: number[]): string => {
    const width = 70;
    const height = 24;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * height + 1;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // KPI Card renderer helper
  const renderKpiCard = (
    key: string,
    label: string,
    value: string,
    change: string,
    sparkline: number[],
    icon: React.ReactNode,
    trendType: 'up' | 'down'
  ) => {
    const isNegative = change.startsWith('-');
    const arrow = isNegative ? '↘' : '↗';
    
    return (
      <div className="card metric-card" key={key} style={{ minHeight: 'auto' }}>
        <div className="metric-top-row">
          <div className="metric-icon-squircle">
            {icon}
          </div>
          <svg className="metric-sparkline-graph" viewBox="0 0 70 24">
            <path 
              d={getSparklinePath(sparkline)} 
              fill="none" 
              stroke={trendType === 'up' ? 'var(--success)' : 'var(--error)'} 
              strokeWidth="2.2" 
            />
          </svg>
        </div>
        
        <div className="metric-middle">
          <span className="metric-label-classic">{label}</span>
          <span className="metric-value-classic">{value}</span>
        </div>
        
        <div className="metric-bottom-classic">
          <span className={`trend-text ${trendType}`}>
            {arrow} {change}
          </span>
          <span className="trend-compare-text">vs last period</span>
        </div>
      </div>
    );
  };

  // Dynamic KPI stats calculations
  const totalVolumeSum = merchants.reduce((sum, m) => sum + m.revenueGenerated, 0);
  const pendingKycCount = merchants.filter(m => m.kycStatus === 'under_review' || m.kycStatus === 'pending').length;
  const avgRiskRating = merchants.length ? Math.round(merchants.reduce((sum, m) => sum + m.riskScore, 0) / merchants.length) : 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Merchant Registry</h1>
          <span className="page-subtitle">Verify merchant credentials, review KYC profiles, and track transaction limits.</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <section className="metrics-grid" style={{ marginBottom: '24px' }}>
        {renderKpiCard('partners', 'Total Partners', merchants.length.toString(), '+11.4%', [7, 7, 8, 8, 8, 9, merchants.length], <Icons.UsersIcon size={22} />, 'up')}
        {renderKpiCard('volume', 'Total Volume (TPV)', `$${(totalVolumeSum / 1000000).toFixed(2)}M`, '+8.4%', [4.2, 4.5, 4.8, 5.0, 5.2, totalVolumeSum / 1000000], <Icons.FinanceIcon size={22} />, 'up')}
        {renderKpiCard('pending', 'Pending Compliance', pendingKycCount.toString(), '2 review items', [5, 4, 6, 3, 4, pendingKycCount], <Icons.SupportIcon size={22} />, pendingKycCount > 2 ? 'down' : 'up')}
        {renderKpiCard('risk', 'Avg Compliance Risk', `${avgRiskRating}/100`, '-3.2%', [42, 40, 39, 38, 37, avgRiskRating], <Icons.ShieldIcon size={22} />, 'up')}
      </section>

      {/* Controls & Custom Scrolling Pills Filter Bar */}
      <div className="card filter-row" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', alignItems: 'stretch', minWidth: 0, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Business Category</span>
            {useCategoryDropdown && (
              <select
                className="category-dropdown"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
          {!useCategoryDropdown && (
            <div className="category-scroll-container" style={{ marginBottom: '0', paddingBottom: '4px' }}>
              {categories.map(c => (
                <button 
                  key={c} 
                  className={`category-pill ${categoryFilter === c ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px', flexWrap: 'wrap', gap: '12px', minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', minWidth: 0, maxWidth: '100%' }}>
            {['All', 'approved', 'under_review', 'pending', 'rejected'].map(status => (
              <button
                key={status}
                className={`status-pill-filter`}
                onClick={() => setKycFilter(status)}
                style={{
                  background: kycFilter === status ? 'var(--primary)' : 'transparent',
                  border: '1px solid',
                  borderColor: kycFilter === status ? 'var(--primary)' : 'var(--border-color)',
                  color: kycFilter === status ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                  textTransform: 'capitalize'
                }}
              >
                {status === 'All' ? 'All KYC' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Showing <strong>{filteredMerchants.length}</strong> of {merchants.length} merchants
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <ScrollableTable className="card animate-fade-in" style={{ padding: '0' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '16px 20px' }}>Merchant ID</th>
              <th>Name & Contact</th>
              <th>Category</th>
              <th>Compliance Risk</th>
              <th>KYC Status</th>
              <th>Processed Volume</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMerchants.map(merchant => (
              <tr 
                key={merchant.id} 
                onClick={() => {
                  setSelectedMerchant(merchant);
                  setDrawerTab('compliance');
                }}
                style={{ cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
              >
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', padding: '16px 20px' }}>
                  {merchant.id}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '12px', 
                        background: getAvatarColor(merchant.name), 
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
                    >
                      {getInitials(merchant.name)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{merchant.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{merchant.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={getCategoryBadgeStyle(merchant.businessCategory)}>
                    {merchant.businessCategory}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        fontSize: '13px',
                        color: merchant.riskScore > 75 ? 'var(--error)' : merchant.riskScore > 45 ? 'var(--warning)' : 'var(--success)' 
                      }}
                    >
                      {merchant.riskScore}
                    </span>
                    <div style={{ width: '70px', height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${merchant.riskScore}%`, 
                          height: '100%', 
                          backgroundColor: merchant.riskScore > 75 ? 'var(--error)' : merchant.riskScore > 45 ? 'var(--warning)' : 'var(--success)'
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${merchant.kycStatus === 'under_review' ? 'pending' : merchant.kycStatus}`}>
                    {merchant.kycStatus.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${merchant.revenueGenerated.toLocaleString()}
                </td>
                <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                  <div className="btn-action-group" style={{ justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-icon-sm approve"
                      title="Approve Merchant"
                      disabled={merchant.kycStatus === 'approved'}
                      onClick={() => handleKycStatusUpdate(merchant.id, 'approved')}
                    >
                      <Icons.CheckIcon size={14} />
                    </button>
                    <button 
                      className="btn-icon-sm reject"
                      title="Reject Merchant"
                      disabled={merchant.kycStatus === 'rejected'}
                      onClick={() => handleKycStatusUpdate(merchant.id, 'rejected')}
                    >
                      <Icons.CloseIcon size={14} />
                    </button>
                    <button 
                      className="btn-icon-sm"
                      title={merchant.status === 'suspended' ? 'Activate Partner' : 'Suspend Partner'}
                      onClick={() => handleMerchantStatusUpdate(merchant.id, merchant.status === 'suspended' ? 'active' : 'suspended')}
                    >
                      <Icons.BanIcon size={14} style={{ color: merchant.status === 'suspended' ? 'var(--success)' : 'var(--error)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>

      {/* Merchant Details Modal */}
      {selectedMerchant && (
        <div className="modal-backdrop open" onClick={() => setSelectedMerchant(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <div className="modal-header">
              <span className="modal-title">Merchant Partner Details</span>
              <button className="drawer-close" onClick={() => setSelectedMerchant(null)}>
                <Icons.CloseIcon size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 88px)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div 
                    style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: getAvatarColor(selectedMerchant.name), 
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px'
                    }}
                  >
                    {getInitials(selectedMerchant.name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMerchant.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedMerchant.id} • Joined {selectedMerchant.joinedDate}</span>
                  </div>
                </div>

                {/* Drawer Tabs Switcer */}
                <div className="drawer-tabs">
                  <button 
                    className={`drawer-tab ${drawerTab === 'compliance' ? 'active' : ''}`}
                    onClick={() => setDrawerTab('compliance')}
                  >
                    Compliance Profile
                  </button>
                  <button 
                    className={`drawer-tab ${drawerTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setDrawerTab('transactions')}
                  >
                    Recent Transactions
                  </button>
                  <button 
                    className={`drawer-tab ${drawerTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setDrawerTab('settings')}
                  >
                    Limits & Settings
                  </button>
                </div>

                {/* TAB 1: COMPLIANCE PROFILE */}
                {drawerTab === 'compliance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* General Details */}
                    <div className="details-list" style={{ gap: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KYC Information</span>
                      <div className="detail-row">
                        <span className="detail-key">Email Address</span>
                        <span className="detail-value">{selectedMerchant.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-key">Business Type</span>
                        <span className="detail-value">{selectedMerchant.businessCategory}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-key">Tax Registration ID</span>
                        <span className="detail-value mono">{selectedMerchant.taxId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-key">Compliance Risk score</span>
                        <span className="detail-value" style={{ color: selectedMerchant.riskScore > 75 ? 'var(--error)' : selectedMerchant.riskScore > 45 ? 'var(--warning)' : 'var(--success)' }}>
                          {selectedMerchant.riskScore} / 100
                        </span>
                      </div>
                    </div>

                    {/* KYC Verification Documents */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KYC Verification Documents</span>
                      
                      <div 
                        className="card" 
                        onClick={() => setViewingDoc({ title: 'Certificate of Incorporation', merchantName: selectedMerchant.name, taxId: selectedMerchant.taxId })}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color var(--transition-fast)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icons.FileIcon size={18} style={{ color: 'var(--primary)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Certificate of Incorporation</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PDF • 1.4MB</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Click to View</span>
                      </div>

                      <div 
                        className="card" 
                        onClick={() => setViewingDoc({ title: 'Merchant Tax PAN Identification', merchantName: selectedMerchant.name, taxId: selectedMerchant.taxId })}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color var(--transition-fast)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icons.FileIcon size={18} style={{ color: 'var(--primary)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Merchant Tax PAN Identification</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PNG • 840KB</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Click to View</span>
                      </div>
                    </div>

                    {/* Penny Drop Bank Account Verification */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank Verification</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Void Cheque / Bank Info</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACCOUNT: ••••••••8920</span>
                        </div>
                        
                        {!pennyDropStatus[selectedMerchant.id] || pennyDropStatus[selectedMerchant.id] === 'idle' ? (
                          <button 
                            className="btn-secondary" 
                            onClick={() => handlePennyDrop(selectedMerchant.id)}
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            Run Penny Drop Test
                          </button>
                        ) : pennyDropStatus[selectedMerchant.id] === 'loading' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>
                            <span className="live-pulse"></span> Verifying...
                          </div>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                            <Icons.CheckIcon size={14} /> Verified Bank
                          </span>
                        )}
                      </div>
                    </div>

                    {/* KYC Determinations */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Compliance Determination</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-primary" 
                          style={{ flexGrow: 1, backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                          disabled={selectedMerchant.kycStatus === 'approved'}
                          onClick={() => handleKycStatusUpdate(selectedMerchant.id, 'approved')}
                        >
                          <Icons.CheckIcon size={14} /> Approve KYC
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ flexGrow: 1 }}
                          disabled={selectedMerchant.kycStatus === 'under_review'}
                          onClick={() => handleKycStatusUpdate(selectedMerchant.id, 'under_review')}
                        >
                          <Icons.RefreshIcon size={14} /> Put Under Review
                        </button>
                      </div>
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', color: 'var(--error)', borderColor: 'var(--error-glow)' }}
                        disabled={selectedMerchant.kycStatus === 'rejected'}
                        onClick={() => handleKycStatusUpdate(selectedMerchant.id, 'rejected')}
                      >
                        <Icons.CloseIcon size={14} /> Reject Application
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: RECENT TRANSACTIONS */}
                {drawerTab === 'transactions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search transactions..."
                        value={txSearchQuery}
                        onChange={(e) => setTxSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '12px'
                        }}
                      />
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        <Icons.SearchIcon size={14} />
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '2px' }}>
                      {initialTransactions
                        .filter(t => t.merchant.toLowerCase() === selectedMerchant.name.toLowerCase())
                        .filter(t => t.id.toLowerCase().includes(txSearchQuery.toLowerCase()) || t.paymentMethod.toLowerCase().includes(txSearchQuery.toLowerCase()))
                        .map((tx) => (
                          <div 
                            key={tx.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '10px 12px', 
                              borderRadius: 'var(--radius-sm)', 
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'rgba(255, 255, 255, 0.01)'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{tx.id}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(tx.timestamp).toLocaleString()} • {tx.paymentMethod}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>${tx.amount.toFixed(2)}</span>
                            <span className={`status-badge ${tx.status}`} style={{ fontSize: '9px', padding: '1px 5px' }}>{tx.status}</span>
                          </div>
                        </div>
                      ))}
                    {initialTransactions.filter(t => t.merchant.toLowerCase() === selectedMerchant.name.toLowerCase()).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No transactions found for this merchant.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: LIMITS & SETTINGS */}
              {drawerTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>Settlement Cycle</label>
                    <select 
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '12px'
                      }}
                      defaultValue="T+2"
                    >
                      <option value="T+0">T+0 (Instant Settlements)</option>
                      <option value="T+1">T+1 (Next Day Settlements)</option>
                      <option value="T+2">T+2 (Standard Cycles)</option>
                      <option value="T+7">T+7 (Weekly Cycles)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>Daily Transaction Limit</label>
                    <input 
                      type="text" 
                      defaultValue="$50,000"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>Custom Webhooks Endpoint</label>
                    <input 
                      type="text" 
                      placeholder="https://api.merchant.com/v1/webhooks"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Merchant Status</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Temporarily restrict gateway access</span>
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ 
                        color: selectedMerchant.status === 'suspended' ? 'var(--success)' : 'var(--error)', 
                        borderColor: selectedMerchant.status === 'suspended' ? 'var(--success-glow)' : 'var(--error-glow)' 
                      }}
                      onClick={() => handleMerchantStatusUpdate(selectedMerchant.id, selectedMerchant.status === 'suspended' ? 'active' : 'suspended')}
                    >
                      {selectedMerchant.status === 'suspended' ? 'Activate Partner' : 'Suspend Partner'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Mock Document Viewer Modal */}
      {viewingDoc && (
        <div className="modal-backdrop" onClick={() => setViewingDoc(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{viewingDoc.title}</span>
              <button className="drawer-close" onClick={() => setViewingDoc(null)}>
                <Icons.CloseIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="certificate-preview">
                <Icons.KYCApprovedIcon size={48} style={{ color: 'var(--success)' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>OFFICIAL RECORD VERIFICATION</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  This document serves as proof of official verification for <strong>{viewingDoc.merchantName}</strong>. 
                  All registration files, entity identifications, tax audits, and compliance signatures have been logged and verified under the jurisdiction's registry system.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span>ENTITY ID: {selectedMerchant?.id}</span>
                    <br />
                    <span>TAX HASH: {viewingDoc.taxId || 'N/A'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>STATUS: VALIDATED</span>
                    <br />
                    <span>STAMP HASH: #PD-{(selectedMerchant?.revenueGenerated || 120500) % 99999}</span>
                  </div>
                </div>
                <div className="certificate-seal">
                  <Icons.ShieldIcon size={64} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingDoc(null)}>Close</button>
              <button className="btn-primary" onClick={() => { alert('Downloading document...'); setViewingDoc(null); }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
