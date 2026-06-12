import React, { useState } from 'react';
import * as Icons from '../icons';
import ScrollableTable from '../ScrollableTable';

interface RiskTabProps {
  searchQuery: string;
  subTab: string; // 'fraud' | 'blacklist' | 'compliance'
}

interface FraudAlert {
  id: string;
  txId: string;
  merchant: string;
  amount: number;
  riskScore: number;
  triggerRule: string;
  ipAddress: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'dismissed' | 'blocked';
}

interface BlacklistItem {
  id: string;
  type: 'IP Address' | 'Email Domain' | 'Card BIN';
  value: string;
  reason: string;
  dateAdded: string;
}

export default function RiskTab({ searchQuery, subTab }: RiskTabProps) {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    { id: 'flg_01', txId: 'tx_89a0f5', merchant: 'Prime Crypto Swap', amount: 12500.00, riskScore: 94, triggerRule: 'Velocity Threshold - High Volume Crypto Intent', ipAddress: '185.220.101.4', timestamp: '2026-06-12T12:22:15Z', status: 'active' },
    { id: 'flg_02', txId: 'tx_89a1a0', merchant: 'Velocity Gaming', amount: 3400.00, riskScore: 82, triggerRule: 'Rapid Credit Card Carding Attempt', ipAddress: '122.161.49.25', timestamp: '2026-06-12T12:08:12Z', status: 'active' },
    { id: 'flg_03', txId: 'tx_89a0f4', merchant: 'Velocity Gaming', amount: 5000.00, riskScore: 68, triggerRule: 'Geographic IP & Card Origin Mismatch', ipAddress: '14.139.122.3', timestamp: '2026-06-12T12:25:01Z', status: 'investigating' },
  ]);

  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([
    { id: 'bl_01', type: 'IP Address', value: '185.220.101.4', reason: 'Tor Exit Node routing cryptocurrency fraud attempts', dateAdded: '2026-06-12' },
    { id: 'bl_02', type: 'Email Domain', value: '*@onionmail.org', reason: 'Disposable email service associated with chargeback spikes', dateAdded: '2026-06-11' },
    { id: 'bl_03', type: 'Card BIN', value: '411111', reason: 'Simulated sandbox test credit card abused on production systems', dateAdded: '2026-06-10' },
  ]);

  // Blacklist form inputs
  const [blacklistType, setBlacklistType] = useState<'IP Address' | 'Email Domain' | 'Card BIN'>('IP Address');
  const [blacklistValue, setBlacklistValue] = useState<string>('');
  const [blacklistReason, setBlacklistReason] = useState<string>('');

  const handleAlertAction = (alertId: string, nextStatus: FraudAlert['status']) => {
    setFraudAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, status: nextStatus };
      }
      return alert;
    }));
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blacklistValue || !blacklistReason) return;

    const newItem: BlacklistItem = {
      id: `bl_${Math.random().toString(36).substring(2, 6)}`,
      type: blacklistType,
      value: blacklistValue,
      reason: blacklistReason,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setBlacklist(prev => [newItem, ...prev]);
    setBlacklistValue('');
    setBlacklistReason('');
  };

  const handleRemoveBlacklist = (id: string) => {
    setBlacklist(prev => prev.filter(item => item.id !== id));
  };

  // Filter logic
  const filteredAlerts = fraudAlerts.filter(a => {
    return a.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.triggerRule.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredBlacklist = blacklist.filter(b => {
    return b.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.reason.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {subTab === 'fraud' && 'Fraud Intelligence Center'}
          {subTab === 'blacklist' && 'System Credentials Blacklist'}
          {subTab === 'compliance' && 'Compliance Auditing Workspace'}
        </h1>
        <span className="page-subtitle">
          {subTab === 'fraud' && 'Real-time transactional anomaly detection and velocity filters.'}
          {subTab === 'blacklist' && 'Audit IP ranges, malicious card sequences, and blocked email providers.'}
          {subTab === 'compliance' && 'PCI-DSS checklists, SOC2 audit milestones, and automated compliance records.'}
        </span>
      </div>

      {/* RENDER FRAUD MONITORING */}
      {subTab === 'fraud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Anomaly list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${alert.riskScore > 75 ? 'var(--error)' : 'var(--warning)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.015)'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: alert.riskScore > 75 ? 'var(--error-glow)' : 'var(--warning-glow)',
                      color: alert.riskScore > 75 ? 'var(--error)' : 'var(--warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    {alert.riskScore}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{alert.merchant}</span>
                      <span className={`status-badge ${alert.status === 'active' ? 'pending' : alert.status}`}>
                        {alert.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rule: {alert.triggerRule}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TX: {alert.txId} • IP: {alert.ipAddress} • {new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>${alert.amount.toFixed(2)}</span>

                  {alert.status === 'active' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--error)' }}
                        onClick={() => handleAlertAction(alert.id, 'blocked')}
                      >
                        Block Payment
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() => handleAlertAction(alert.id, 'dismissed')}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER BLACKLIST */}
      {subTab === 'blacklist' && (
        <div className="two-col-grid-12-20">
          {/* Blacklist Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Add Credentials to Blocklist</span>
            <form onSubmit={handleAddBlacklist} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Restriction Credential Type</label>
                <select
                  value={blacklistType}
                  onChange={(e) => setBlacklistType(e.target.value as any)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="IP Address">IP Address</option>
                  <option value="Email Domain">Email Domain</option>
                  <option value="Card BIN">Credit Card BIN (6 digits)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Blocked Value</label>
                <input
                  type="text"
                  value={blacklistValue}
                  onChange={(e) => setBlacklistValue(e.target.value)}
                  placeholder={blacklistType === 'IP Address' ? 'e.g. 192.168.1.1' : blacklistType === 'Email Domain' ? 'e.g. *@spambot.ru' : 'e.g. 411111'}
                  className="search-bar"
                  style={{ height: '34px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Banning Reason</label>
                <input
                  type="text"
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="Reason for restriction"
                  className="search-bar"
                  style={{ height: '34px' }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>
                Restrict Credential
              </button>
            </form>
          </div>

          {/* Directory list */}
          <ScrollableTable className="card" style={{ margin: '0' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Banned Credentials Registry</span>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target Type</th>
                  <th>Blocked value</th>
                  <th>Audit Reason</th>
                  <th>Date Restricted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlacklist.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="status-badge failed" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.value}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.reason}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.dateAdded}</td>
                    <td>
                      <button
                        className="btn-icon-sm reject"
                        title="Remove Ban"
                        onClick={() => handleRemoveBlacklist(item.id)}
                      >
                        <Icons.TrashIcon size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </div>
      )}

      {/* RENDER COMPLIANCE */}
      {subTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="metrics-grid">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icons.ShieldIcon size={32} style={{ color: 'var(--success)' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>PCI-DSS Level 1 Compliant</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Security audit renewed March 2026.</span>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icons.KYCApprovedIcon size={32} style={{ color: 'var(--success)' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>SOC2 Type II Attestation</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Continuous auditing compliance logged.</span>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icons.InfoIcon size={32} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>AML KYC Velocity Filters</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated compliance checkpoints active.</span>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <div className="card">
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Compliance Auditing Checklist</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span>Secure API token rotation policy validation</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>PASSED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span>DB Encryption Key Rotation (AES-256)</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>PASSED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span>Disaster recovery endpoint response latency test (&lt; 2s)</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>PASSED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span>Sanction list screeners API checks (OFAC check)</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>UNDER RE-AUDIT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
