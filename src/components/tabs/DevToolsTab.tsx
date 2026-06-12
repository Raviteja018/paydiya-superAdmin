import React, { useState } from 'react';
import * as Icons from '../icons';
import ScrollableTable from '../ScrollableTable';

interface DevToolsTabProps {
  searchQuery: string;
  subTab: string; // 'keys' | 'webhooks' | 'usage'
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scope: 'Read-Only' | 'Full Access' | 'Write-Only';
  created: string;
  status: 'active' | 'revoked';
}

export default function DevToolsTab({ searchQuery, subTab }: DevToolsTabProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'key_01', name: 'Production Core Gateway', keyPrefix: 'pk_live_5B5BF...', scope: 'Full Access', created: '2025-10-12', status: 'active' },
    { id: 'key_02', name: 'Operations Analytics Sync', keyPrefix: 'pk_live_00C2F...', scope: 'Read-Only', created: '2026-02-14', status: 'active' },
    { id: 'key_03', name: 'Legacy WooCommerce Plugin', keyPrefix: 'pk_live_EF444...', scope: 'Write-Only', created: '2025-01-20', status: 'revoked' },
  ]);

  const [webhookEvent, setWebhookEvent] = useState<string>('payment.intent.succeeded');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.merchant.com/paydiya-webhooks');
  const [webhookConsole, setWebhookConsole] = useState<string>('Console idle. Click "Send Mock Webhook Trigger" above to fire payload...');
  const [isSendingWebhook, setIsSendingWebhook] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyScope, setNewKeyScope] = useState<'Read-Only' | 'Full Access' | 'Write-Only'>('Read-Only');
  const [generatedKeyVisible, setGeneratedKeyVisible] = useState<string>('');

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const rawSecret = `sk_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    const prefix = `${rawSecret.substring(0, 12)}...`;

    const newKey: ApiKey = {
      id: `key_${Math.random().toString(36).substring(2, 6)}`,
      name: newKeyName,
      keyPrefix: prefix,
      scope: newKeyScope,
      created: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setApiKeys(prev => [newKey, ...prev]);
    setGeneratedKeyVisible(rawSecret);
    setNewKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => {
      if (k.id === id) {
        return { ...k, status: 'revoked' as const };
      }
      return k;
    }));
  };

  const handleSendWebhook = () => {
    setIsSendingWebhook(true);
    setWebhookConsole('» PINGING ENDPOINT: POST ' + webhookUrl + '\n» Dispatching headers...\n» Content-Type: application/json\n» User-Agent: Paydiya-Webhook-Bot/v2.1\n» X-Paydiya-Signature: sha256=' + Math.random().toString(36).substring(2, 15) + '\n\nLoading responses...');
    
    setTimeout(() => {
      const mockPayload = {
        id: `evt_${Math.random().toString(36).substring(2, 8)}`,
        object: 'event',
        type: webhookEvent,
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `pi_${Math.random().toString(36).substring(2, 8)}`,
            amount: 8900,
            currency: 'usd',
            customer: 'cus_991823A',
            payment_method: 'card_1928a',
            status: webhookEvent.includes('succeeded') ? 'succeeded' : 'failed'
          }
        }
      };

      setWebhookConsole(
        `» POST ${webhookUrl}
» Headers sent:
  Host: api.merchant.com
  User-Agent: Paydiya-Webhook-Bot/v2.1
  X-Paydiya-Signature: t=${Math.floor(Date.now()/1000)},v1=7382efd9...

» JSON Payloads dispatched:
${JSON.stringify(mockPayload, null, 2)}

» Response received:
  HTTP/1.1 200 OK
  Content-Type: application/json
  Server: NGINX
  Payload Response: {"status": "received", "event_id": "${mockPayload.id}"}`
      );
      setIsSendingWebhook(false);
    }, 1500);
  };

  // Filter api keys
  const filteredKeys = apiKeys.filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {subTab === 'keys' && 'API Access Tokens'}
          {subTab === 'webhooks' && 'Webhook Gateway dispatch'}
          {subTab === 'usage' && 'Gateway API Latencies'}
        </h1>
        <span className="page-subtitle">
          {subTab === 'keys' && 'Deploy private authorization tokens, roll secrets, and review developer scopes.'}
          {subTab === 'webhooks' && 'Trigger test transaction events to verify merchant endpoint webhook listeners.'}
          {subTab === 'usage' && 'Monitor real-time request counts, API endpoints load distribution, and microservices latency.'}
        </span>
      </div>

      {/* RENDER API KEYS WORKSPACE */}
      {subTab === 'keys' && (
        <div className="two-col-grid-12-20">
          {/* Create Key Panel */}
          <div className="card" style={{ height: 'fit-content' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Generate Secret Token</span>
            <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Token Name / Description</label>
                <input 
                  type="text" 
                  value={newKeyName} 
                  onChange={(e) => setNewKeyName(e.target.value)} 
                  placeholder="e.g. WooCommerce Integration Key"
                  className="search-bar" 
                  style={{ height: '34px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Access Scopes</label>
                <select 
                  value={newKeyScope} 
                  onChange={(e) => setNewKeyScope(e.target.value as any)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="Read-Only">Read-Only Access</option>
                  <option value="Write-Only">Write-Only Access</option>
                  <option value="Full Access">Full Access (Root Intent)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>
                Create Secret Key
              </button>
            </form>

            {/* Secret key visible block */}
            {generatedKeyVisible && (
              <div className="card animate-pulse-slow" style={{ marginTop: '16px', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>Key Generated Successfully!</span>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Please copy this key now. For security reasons, you will not be able to view it again.
                </p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={generatedKeyVisible} 
                    readOnly
                    className="search-bar" 
                    style={{ height: '30px', fontFamily: 'var(--font-mono)', fontSize: '10px', flexGrow: 1 }}
                  />
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 10px', fontSize: '11px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKeyVisible);
                      alert('Token secret copied to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tokens Registry Table */}
          <ScrollableTable className="card" style={{ margin: '0' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Active Secrets Registry</span>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token description</th>
                  <th>Key prefix</th>
                  <th>Developer scopes</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map(key => (
                  <tr key={key.id}>
                    <td style={{ fontWeight: 600 }}>{key.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{key.keyPrefix}</td>
                    <td>
                      <span className="status-badge neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {key.scope}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{key.created}</td>
                    <td>
                      <span className={`status-badge ${key.status === 'active' ? 'success' : 'failed'}`}>
                        {key.status}
                      </span>
                    </td>
                    <td>
                      {key.status === 'active' ? (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error)', borderColor: 'var(--error-glow)' }}
                          onClick={() => handleRevokeKey(key.id)}
                        >
                          Revoke Token
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </div>
      )}

      {/* RENDER WEBHOOK GATEWAY */}
      {subTab === 'webhooks' && (
        <div className="two-col-grid-12-20">
          {/* Simulator Panel */}
          <div className="card" style={{ height: 'fit-content' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Webhook payload Simulator</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Destination URL</label>
                <input 
                  type="text" 
                  value={webhookUrl} 
                  onChange={(e) => setWebhookUrl(e.target.value)} 
                  className="search-bar" 
                  style={{ height: '34px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Network Event Trigger</label>
                <select 
                  value={webhookEvent} 
                  onChange={(e) => setWebhookEvent(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="payment.intent.succeeded">payment.intent.succeeded</option>
                  <option value="payment.intent.failed">payment.intent.failed</option>
                  <option value="chargeback.created">chargeback.created</option>
                  <option value="merchant.kyc.approved">merchant.kyc.approved</option>
                </select>
              </div>

              <button 
                className="btn-primary" 
                onClick={handleSendWebhook} 
                disabled={isSendingWebhook}
                style={{ marginTop: '6px' }}
              >
                {isSendingWebhook ? 'Dispatching...' : 'Send Mock Webhook Trigger'}
              </button>
            </div>
          </div>

          {/* Webhook Response Log Terminal */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Terminal Response Logger</span>
            <pre 
              className="console-box" 
              style={{ 
                flexGrow: 1, 
                maxHeight: 'none', 
                height: '340px',
                backgroundColor: '#03050a',
                border: '1px solid var(--border-color)'
              }}
            >
              {webhookConsole}
            </pre>
          </div>
        </div>
      )}

      {/* RENDER API LATENCIES AND USAGE */}
      {subTab === 'usage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* API Load statistics */}
          <section className="metrics-grid">
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Global Request Count</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px' }}>4,920 req/s</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average server requests handled per second.</p>
            </div>
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Engine Latency SLA</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px', color: 'var(--success)' }}>42ms</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average routing turnaround and database response speed.</p>
            </div>
            <div className="card">
              <span className="metric-label" style={{ fontSize: '11px' }}>Queue Message Buffer</span>
              <h2 className="metric-value" style={{ margin: '8px 0', fontSize: '24px' }}>0 items</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Webhooks queue load factor buffer operational.</p>
            </div>
          </section>

          {/* Custom SVG usage grid */}
          <div className="card">
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>API Latency distribution (Last 24 Hours)</span>
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: '16px 0 8px' }}>
              {/* Plot custom mock bars */}
              {[45, 52, 41, 38, 48, 62, 55, 42, 38, 32, 40, 48, 56, 42, 39, 41, 48, 62, 74, 52, 41, 38, 42, 45].map((lat, idx) => (
                <div key={idx} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${(lat / 80) * 120}px`, 
                      backgroundColor: lat > 65 ? 'var(--warning)' : 'var(--primary)',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height var(--transition-normal)'
                    }}
                  ></div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>{idx}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
