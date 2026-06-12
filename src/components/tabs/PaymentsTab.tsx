import React, { useState } from 'react';
import * as Icons from '../icons';
import { initialTransactions, initialDisputes } from '../../mockData';
import type { Transaction, Dispute } from '../../mockData';
import ScrollableTable from '../ScrollableTable';

interface PaymentsTabProps {
  searchQuery: string;
  subTab: string; // 'transactions' | 'refunds' | 'disputes' | 'chargebacks'
}

export default function PaymentsTab({ searchQuery, subTab }: PaymentsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [showRefundInput, setShowRefundInput] = useState<boolean>(false);

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = methodFilter === 'All' || tx.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;

    // If subTab is 'refunds', show failed or refunded transactions, otherwise show all
    if (subTab === 'refunds') {
      return matchesSearch && matchesMethod && (tx.status === 'failed' || tx.status === 'pending');
    }
    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Filter disputes
  const filteredDisputes = disputes.filter(disp => {
    const matchesSearch = disp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          disp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          disp.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (subTab === 'chargebacks') {
      return matchesSearch && disp.amount > 1000; // Mocking chargebacks as high value disputes
    }
    return matchesSearch;
  });

  const handleRefundSubmit = (txId: string) => {
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) return;

    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        const updated = { ...tx, status: 'failed' as const }; // Mark failed/refunded
        if (selectedTx && selectedTx.id === txId) {
          setSelectedTx(updated);
        }
        return updated;
      }
      return tx;
    }));

    setShowRefundInput(false);
    setRefundAmount('');
  };

  const handleEvidenceSubmit = (disputeId: string) => {
    setDisputes(prev => prev.map(disp => {
      if (disp.id === disputeId) {
        const updated: Dispute = { ...disp, status: 'under_review', evidenceSubmitted: true };
        if (selectedDispute && selectedDispute.id === disputeId) {
          setSelectedDispute(updated);
        }
        return updated;
      }
      return disp;
    }));
  };

  const handleDisputeResolution = (disputeId: string, resolution: 'won' | 'lost') => {
    setDisputes(prev => prev.map(disp => {
      if (disp.id === disputeId) {
        const updated: Dispute = { ...disp, status: resolution };
        if (selectedDispute && selectedDispute.id === disputeId) {
          setSelectedDispute(updated);
        }
        return updated;
      }
      return disp;
    }));
  };

  // Mock raw JSON payload
  const getMockJsonPayload = (tx: Transaction) => {
    return JSON.stringify({
      object: 'payment_intent',
      id: tx.id,
      amount: tx.amount * 100,
      currency: 'usd',
      status: tx.status === 'success' ? 'succeeded' : tx.status === 'failed' ? 'failed' : 'processing',
      payment_method_types: [tx.paymentMethod.toLowerCase().replace(' ', '_')],
      metadata: {
        merchant_name: tx.merchant,
        customer_email: tx.customerEmail,
        ip_address: tx.ipAddress,
        fraud_risk_score: tx.fraudScore
      },
      charges: {
        object: 'list',
        data: [
          {
            id: `ch_${Math.random().toString(36).substring(2, 8)}`,
            amount_refunded: tx.status === 'failed' ? tx.amount * 100 : 0,
            outcome: {
              network_status: tx.status === 'success' ? 'approved_by_network' : 'declined_by_network',
              risk_score: tx.fraudScore
            }
          }
        ]
      }
    }, null, 2);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {subTab === 'transactions' && 'Transactions Registry'}
          {subTab === 'refunds' && 'Refunds Operations'}
          {subTab === 'disputes' && 'Disputes Ledger'}
          {subTab === 'chargebacks' && 'Chargeback Arbitrations'}
        </h1>
        <span className="page-subtitle">
          {subTab === 'transactions' && 'Search, filter, and audit all incoming payments across Paydiya.'}
          {subTab === 'refunds' && 'Process settlements offsets, issue full/partial payment reversals.'}
          {subTab === 'disputes' && 'Manage retrieval requests and upload dispute responses for card networks.'}
          {subTab === 'chargebacks' && 'Review extreme high-value fraud chargeback claims & card scheme arbitrations.'}
        </span>
      </div>

      {/* Render Transactions & Refunds View */}
      {(subTab === 'transactions' || subTab === 'refunds') && (
        <>
          {/* Filters Bar */}
          <div className="card filter-row">
            <div className="filter-group">
              <div className="filter-select-wrapper">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '6px' }}>Method</span>
                <select 
                  value={methodFilter} 
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              {subTab !== 'refunds' && (
                <div className="filter-select-wrapper">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '6px' }}>Status</span>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Found {filteredTransactions.length} items
            </span>
          </div>

          {/* Table Ledger */}
          <ScrollableTable className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer Email</th>
                  <th>Merchant</th>
                  <th>Payment Method</th>
                  <th>Fraud Rating</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} onClick={() => { setSelectedTx(tx); setShowRefundInput(false); }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{tx.id}</td>
                    <td>{tx.customerEmail}</td>
                    <td style={{ fontWeight: 600 }}>{tx.merchant}</td>
                    <td>{tx.paymentMethod}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: tx.fraudScore > 75 ? 'var(--error)' : tx.fraudScore > 40 ? 'var(--warning)' : 'var(--success)' }}>
                        {tx.fraudScore}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${tx.status}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${tx.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </>
      )}

      {/* Render Disputes & Chargebacks View */}
      {(subTab === 'disputes' || subTab === 'chargebacks') && (
        <ScrollableTable className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Dispute Reason</th>
                <th>Evidence Status</th>
                <th>Response Deadline</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map(disp => (
                <tr key={disp.id} onClick={() => setSelectedDispute(disp)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{disp.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{disp.transactionId}</td>
                  <td style={{ fontWeight: 600 }}>{disp.merchant}</td>
                  <td>{disp.reason}</td>
                  <td>
                    <span className={`status-badge ${disp.evidenceSubmitted ? 'success' : 'neutral'}`}>
                      {disp.evidenceSubmitted ? 'Evidence Submitted' : 'Pending Upload'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{disp.deadline}</td>
                  <td>
                    <span className={`status-badge ${disp.status === 'needs_response' ? 'pending' : disp.status}`}>
                      {disp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>${disp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>
      )}

      {/* Transaction details drawer */}
      {selectedTx && (
        <>
          <div className="drawer-backdrop open" onClick={() => setSelectedTx(null)}></div>
          <div className="drawer open" style={{ width: '500px' }}>
            <div className="drawer-header">
              <span className="drawer-title">Transaction Details</span>
              <button className="drawer-close" onClick={() => setSelectedTx(null)}>
                <Icons.CloseIcon size={18} />
              </button>
            </div>
            <div className="drawer-body">
              {/* Payment Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700 }}>${selectedTx.amount.toFixed(2)}</h2>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedTx.id} • {new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                <span className={`status-badge ${selectedTx.status}`}>{selectedTx.status}</span>
              </div>

              {/* Detail Items */}
              <div className="details-list">
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Details</span>
                <div className="detail-row">
                  <span className="detail-key">Merchant Customer</span>
                  <span className="detail-value">{selectedTx.customerEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Processing Merchant</span>
                  <span className="detail-value">{selectedTx.merchant}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Payment Method</span>
                  <span className="detail-value">{selectedTx.paymentMethod} {selectedTx.cardDetails ? `(${selectedTx.cardDetails})` : ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Risk Flag Score</span>
                  <span className="detail-value" style={{ color: selectedTx.fraudScore > 75 ? 'var(--error)' : 'var(--success)' }}>
                    {selectedTx.fraudScore} / 100
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Originating IP</span>
                  <span className="detail-value mono">{selectedTx.ipAddress}</span>
                </div>
              </div>

              {/* Timeline Flow */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Activity Timeline</span>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-header">
                      <span className="timeline-title">Authorized</span>
                      <span className="timeline-time">Success</span>
                    </div>
                    <span className="timeline-desc" style={{ fontSize: '11px' }}>Customer credentials verified and funds locked by card network.</span>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" style={{ backgroundColor: selectedTx.status === 'failed' ? 'var(--error)' : 'var(--success)' }}></div>
                    <div className="timeline-header">
                      <span className="timeline-title">{selectedTx.status === 'failed' ? 'Reversed / Failed' : 'Captured'}</span>
                      <span className="timeline-time">{selectedTx.status}</span>
                    </div>
                    <span className="timeline-desc" style={{ fontSize: '11px' }}>
                      {selectedTx.status === 'failed' 
                        ? 'Transaction reversed, partial or full refund executed.' 
                        : 'Merchant captured funds. Settlements processed.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refund Operations Trigger */}
              {selectedTx.status === 'success' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Refund Reversal Workspace</span>
                  {!showRefundInput ? (
                    <button className="btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error-glow)' }} onClick={() => setShowRefundInput(true)}>
                      <Icons.RefundIcon size={14} /> Initiate Refund Reversal
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={refundAmount} 
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder={`Max $${selectedTx.amount}`} 
                        className="search-bar" 
                        style={{ flexGrow: 1, height: '32px' }}
                      />
                      <button className="btn-primary" style={{ backgroundColor: 'var(--error)' }} onClick={() => handleRefundSubmit(selectedTx.id)}>
                        Submit
                      </button>
                      <button className="btn-secondary" style={{ padding: '6px' }} onClick={() => setShowRefundInput(false)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Raw JSON Debugging */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Raw Gateway API Intent</span>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="btn-icon-sm" 
                    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#060914', zIndex: 10 }}
                    onClick={() => navigator.clipboard.writeText(getMockJsonPayload(selectedTx))}
                    title="Copy Payload"
                  >
                    <Icons.CopyIcon size={12} />
                  </button>
                  <pre className="console-box">{getMockJsonPayload(selectedTx)}</pre>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dispute details & Evidence Upload workspace */}
      {selectedDispute && (
        <>
          <div className="drawer-backdrop open" onClick={() => setSelectedDispute(null)}></div>
          <div className="drawer open" style={{ width: '500px' }}>
            <div className="drawer-header">
              <span className="drawer-title">Dispute Resolution Desk</span>
              <button className="drawer-close" onClick={() => setSelectedDispute(null)}>
                <Icons.CloseIcon size={18} />
              </button>
            </div>
            
            <div className="drawer-body">
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700 }}>${selectedDispute.amount.toFixed(2)}</h2>
                  <span className={`status-badge ${selectedDispute.status === 'needs_response' ? 'pending' : selectedDispute.status}`}>
                    {selectedDispute.status.replace('_', ' ')}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dispute ID: {selectedDispute.id} • Target TX: {selectedDispute.transactionId}</span>
              </div>

              {/* Details List */}
              <div className="details-list">
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dispute Details</span>
                <div className="detail-row">
                  <span className="detail-key">Filing Merchant</span>
                  <span className="detail-value">{selectedDispute.merchant}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Reason Declared</span>
                  <span className="detail-value">{selectedDispute.reason}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Filing Scheme Deadline</span>
                  <span className="detail-value" style={{ color: 'var(--error)', fontWeight: 600 }}>{selectedDispute.deadline}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Evidence Submitted</span>
                  <span className="detail-value">{selectedDispute.evidenceSubmitted ? 'True' : 'False'}</span>
                </div>
              </div>

              {/* Evidence Workspace */}
              {selectedDispute.status === 'needs_response' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Evidence File Attachments</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Upload business invoices, signed delivery slips, and client correspondence logs to counter the chargeback claim.
                  </p>
                  
                  <div 
                    style={{ 
                      border: '1px dashed var(--border-color)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '20px', 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}
                    onClick={() => handleEvidenceSubmit(selectedDispute.id)}
                  >
                    <Icons.FileIcon size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginInline: 'auto' }} />
                    <span>Drag and drop merchant response PDF files here, or click to browse</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-primary" 
                      style={{ flexGrow: 1 }} 
                      disabled={selectedDispute.evidenceSubmitted}
                      onClick={() => handleEvidenceSubmit(selectedDispute.id)}
                    >
                      <Icons.CheckIcon size={14} /> Submit Response Evidence
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ color: 'var(--error)', borderColor: 'var(--error-glow)' }}
                      onClick={() => handleDisputeResolution(selectedDispute.id, 'lost')}
                    >
                      Concede (Accept Loss)
                    </button>
                  </div>
                </div>
              )}

              {/* Actions for super admin resolving disputes */}
              {selectedDispute.status === 'under_review' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Card Scheme Arbitration Result</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-primary" 
                      style={{ flexGrow: 1, backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                      onClick={() => handleDisputeResolution(selectedDispute.id, 'won')}
                    >
                      Resolve as Won (Settle to Merchant)
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ flexGrow: 1, color: 'var(--error)', borderColor: 'var(--error-glow)' }}
                      onClick={() => handleDisputeResolution(selectedDispute.id, 'lost')}
                    >
                      Resolve as Lost (Debit Merchant)
                    </button>
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {(selectedDispute.status === 'won' || selectedDispute.status === 'lost') && (
                <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                  <Icons.InfoIcon size={32} style={{ color: selectedDispute.status === 'won' ? 'var(--success)' : 'var(--error)', marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Dispute Resolved</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    This chargeback case has closed. Card network ruled this case as: <strong>{selectedDispute.status.toUpperCase()}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
