import React, { useState } from 'react';
import * as Icons from '../icons';
import { initialSettlements } from '../../mockData';
import type { Settlement } from '../../mockData';
import ScrollableTable from '../ScrollableTable';

interface FinanceTabProps {
  searchQuery: string;
  subTab: string; // 'settlements' | 'revenue' | 'fees'
}

interface FeeRule {
  id: string;
  tier: string;
  cardRate: number; // percentage
  upiRate: number; // percentage
  fixedFee: number; // cents
  minimumVolume: number;
}

export default function FinanceTab({ searchQuery, subTab }: FinanceTabProps) {
  const [settlements, setSettlements] = useState<Settlement[]>(initialSettlements);
  const [feeRules, setFeeRules] = useState<FeeRule[]>([
    { id: '1', tier: 'Standard Startup Contract', cardRate: 2.9, upiRate: 0.0, fixedFee: 30, minimumVolume: 0 },
    { id: '2', tier: 'Growth Volume Plan', cardRate: 2.2, upiRate: 0.2, fixedFee: 15, minimumVolume: 50000 },
    { id: '3', tier: 'Enterprise Custom Interchange', cardRate: 1.8, upiRate: 0.3, fixedFee: 10, minimumVolume: 250000 }
  ]);

  const [editingRule, setEditingRule] = useState<FeeRule | null>(null);
  const [editingCardRate, setEditingCardRate] = useState<string>('');
  const [editingFixedFee, setEditingFixedFee] = useState<string>('');

  // Filter settlements
  const filteredSettlements = settlements.filter(s => {
    return s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.bankName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleTriggerSettlement = (settlementId: string) => {
    setSettlements(prev => prev.map(s => {
      if (s.id === settlementId) {
        return { ...s, status: 'completed' as const };
      }
      return s;
    }));
  };

  const handleSaveFeeRule = () => {
    if (!editingRule) return;
    const rate = parseFloat(editingCardRate);
    const fixed = parseFloat(editingFixedFee);

    if (isNaN(rate) || isNaN(fixed)) return;

    setFeeRules(prev => prev.map(rule => {
      if (rule.id === editingRule.id) {
        return { ...rule, cardRate: rate, fixedFee: fixed };
      }
      return rule;
    }));
    setEditingRule(null);
  };

  const startEditing = (rule: FeeRule) => {
    setEditingRule(rule);
    setEditingCardRate(rule.cardRate.toString());
    setEditingFixedFee(rule.fixedFee.toString());
  };

  // Compute settlement counts
  const getSettlementMetrics = () => {
    let completedVal = 0;
    let pendingVal = 0;
    let failedVal = 0;
    settlements.forEach(s => {
      if (s.status === 'completed') completedVal += s.amount;
      else if (s.status === 'pending') pendingVal += s.amount;
      else failedVal += s.amount;
    });
    return { completedVal, pendingVal, failedVal };
  };

  const sMetrics = getSettlementMetrics();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {subTab === 'settlements' && 'Settlements Monitoring Engine'}
          {subTab === 'revenue' && 'Revenue & Financial Insights'}
          {subTab === 'fees' && 'Interchange Fee Management'}
        </h1>
        <span className="page-subtitle">
          {subTab === 'settlements' && 'Verify banking settlements, track payout runs, and configure settlement cycles.'}
          {subTab === 'revenue' && 'Executive report detailing network fees, margin yields, and corporate profits.'}
          {subTab === 'fees' && 'Configure custom pricing templates and interchange percentage rules.'}
        </span>
      </div>

      {/* RENDER SETTLEMENTS VIEW */}
      {subTab === 'settlements' && (
        <>
          {/* Settlement status widgets */}
          <section className="metrics-grid">
            <div className="card metric-card">
              <div className="metric-header">
                <div className="metric-label-group">
                  <span className="metric-label">Completed Settlements</span>
                  <span className="metric-value">${sMetrics.completedVal.toLocaleString()}</span>
                </div>
                <div className="metric-icon-wrapper" style={{ color: 'var(--success)' }}>
                  <Icons.CheckIcon size={20} />
                </div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-header">
                <div className="metric-label-group">
                  <span className="metric-label">Pending Settlements</span>
                  <span className="metric-value">${sMetrics.pendingVal.toLocaleString()}</span>
                </div>
                <div className="metric-icon-wrapper" style={{ color: 'var(--warning)' }}>
                  <Icons.RefreshIcon size={20} />
                </div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-header">
                <div className="metric-label-group">
                  <span className="metric-label">Failed Settlements</span>
                  <span className="metric-value">${sMetrics.failedVal.toLocaleString()}</span>
                </div>
                <div className="metric-icon-wrapper" style={{ color: 'var(--error)' }}>
                  <Icons.BanIcon size={20} />
                </div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-header">
                <div className="metric-label-group">
                  <span className="metric-label">Settlement SLA Yield</span>
                  <span className="metric-value">99.85%</span>
                </div>
                <div className="metric-icon-wrapper">
                  <Icons.TrendingUpIcon size={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Settlements Table */}
          <ScrollableTable className="card" style={{ marginTop: '0' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Payout Settlement Registry</span>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Settlement ID</th>
                  <th>Merchant Partner</th>
                  <th>Receiving Bank</th>
                  <th>Account Number</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettlements.map(setl => (
                  <tr key={setl.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{setl.id}</td>
                    <td style={{ fontWeight: 600 }}>{setl.merchant}</td>
                    <td>{setl.bankName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{setl.accountNumber}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(setl.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${setl.status}`}>
                        {setl.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${setl.amount.toLocaleString()}</td>
                    <td>
                      {setl.status !== 'completed' ? (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => handleTriggerSettlement(setl.id)}
                        >
                          Retry Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </>
      )}

      {/* RENDER REVENUE ANALYTICS */}
      {subTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Revenue Breakdown Cards */}
          <section className="metrics-grid">
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Platform Processing Fees</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px' }}>$8,429,105</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total transaction network volume commissions generated.</p>
            </div>
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>SaaS Subscription Revenue</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px' }}>$1,240,500</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Developer portal premium tier contract billings.</p>
            </div>
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Merchant Corporate Reserves</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px' }}>$34,291,025</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10% baseline reserve withholdings for credit chargeback offsets.</p>
            </div>
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Net Operational Profits</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px', color: 'var(--success)' }}>$7,120,400</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Profit margin yields after bank interchange cost deductions.</p>
            </div>
          </section>

          {/* Revenue Distribution report */}
          <div className="card">
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Network Operational Margin Yields</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Gross Interchange Margins (Visa/Mastercard)</span>
                  <span style={{ fontWeight: 600 }}>82.4%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '82.4%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>UPI Payment Rails (Free / Government Subsidized)</span>
                  <span style={{ fontWeight: 600 }}>98.9%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '98.9%', height: '100%', backgroundColor: 'var(--success)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Alternative Wallet Settlement Integrations</span>
                  <span style={{ fontWeight: 600 }}>64.1%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '64.1%', height: '100%', backgroundColor: 'var(--warning)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER FEE CONFIGS VIEW */}
      {subTab === 'fees' && (
        <div 
          className={editingRule ? "two-col-grid-20-10" : ""} 
          style={editingRule ? {} : { display: 'block' }}
        >
          {/* Rules Ledger */}
          <ScrollableTable className="card" style={{ margin: '0' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Network Contract Rules Configuration</span>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule Name (SLA Tier)</th>
                  <th>Credit Card Fee</th>
                  <th>Fixed Fee</th>
                  <th>UPI Processing Fee</th>
                  <th>Threshold Volume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feeRules.map(rule => (
                  <tr key={rule.id}>
                    <td style={{ fontWeight: 600 }}>{rule.tier}</td>
                    <td>{rule.cardRate}%</td>
                    <td>{rule.fixedFee}¢</td>
                    <td>{rule.upiRate}%</td>
                    <td>&gt; ${rule.minimumVolume.toLocaleString()}/mo</td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => startEditing(rule)}>
                        Modify Rule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>

          {/* Edit sidebar panel */}
          {editingRule && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Edit Tier: {editingRule.tier}</span>
                <button className="sidebar-toggle-btn" onClick={() => setEditingRule(null)}>
                  <Icons.CloseIcon size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Credit Card Rate (%)</label>
                  <input 
                    type="number" 
                    value={editingCardRate} 
                    onChange={(e) => setEditingCardRate(e.target.value)} 
                    className="search-bar" 
                    style={{ height: '32px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fixed Charge (¢)</label>
                  <input 
                    type="number" 
                    value={editingFixedFee} 
                    onChange={(e) => setEditingFixedFee(e.target.value)} 
                    className="search-bar" 
                    style={{ height: '32px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="btn-primary" style={{ flexGrow: 1 }} onClick={handleSaveFeeRule}>
                  Save Pricing
                </button>
                <button className="btn-secondary" onClick={() => setEditingRule(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
