import React, { useState } from 'react';
import * as Icons from '../icons';
import { initialSupportTickets } from '../../mockData';
import type { SupportTicket } from '../../mockData';
import ScrollableTable from '../ScrollableTable';

interface SupportTabProps {
  searchQuery: string;
}

interface ChatMessage {
  id: string;
  sender: 'merchant' | 'admin';
  text: string;
  time: string;
}

export default function SupportTab({ searchQuery }: SupportTabProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<Record<string, ChatMessage[]>>({
    tkt_2940: [
      { id: '1', sender: 'merchant', text: 'Hi, we are attempting to submit transaction chargeback dispute evidence via the API endpoint but we are consistently receiving a 502 Bad Gateway response. Can you please check if the disputes storage bucket is experiencing downtime?', time: '10:20 AM' },
      { id: '2', sender: 'admin', text: 'Hello, our core team is investigating this. Let me verify the storage APIs latency load.', time: '10:25 AM' }
    ],
    tkt_2941: [
      { id: '1', sender: 'merchant', text: 'Payout batch set_9901E has failed for Velocity Gaming. We need this settled immediately as our vendors are waiting for payouts.', time: '8:45 AM' }
    ]
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText) return;

    const ticketId = selectedTicket.id;
    const newMessage: ChatMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'admin',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newMessage]
    }));

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'pending' as const, responseCount: t.responseCount + 1 };
      }
      return t;
    }));

    setReplyText('');
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const resolved: SupportTicket = { ...t, status: 'resolved' as const };
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(resolved);
        }
        return resolved;
      }
      return t;
    }));
  };

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    return t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getMetrics = () => {
    let openCount = 0;
    let resolvedCount = 0;
    tickets.forEach(t => {
      if (t.status === 'open' || t.status === 'pending') openCount++;
      else resolvedCount++;
    });
    return { openCount, resolvedCount };
  };

  const metrics = getMetrics();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Support Center Operations</h1>
        <span className="page-subtitle">Respond to merchant queries, coordinate compliance investigations, and review SLA health.</span>
      </div>

      {/* Support KPI Metrics */}
      <section className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-label-group">
              <span className="metric-label">Active Open Tickets</span>
              <span className="metric-value">{metrics.openCount}</span>
            </div>
            <div className="metric-icon-wrapper" style={{ color: 'var(--warning)' }}>
              <Icons.SupportIcon size={20} />
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-label-group">
              <span className="metric-label">Resolved Tickets</span>
              <span className="metric-value">{metrics.resolvedCount}</span>
            </div>
            <div className="metric-icon-wrapper" style={{ color: 'var(--success)' }}>
              <Icons.CheckIcon size={20} />
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-label-group">
              <span className="metric-label">Average Response Time</span>
              <span className="metric-value">14m</span>
            </div>
            <div className="metric-icon-wrapper">
              <Icons.RefreshIcon size={20} />
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-label-group">
              <span className="metric-label">CSAT Satisfaction Index</span>
              <span className="metric-value">4.85 / 5.0</span>
            </div>
            <div className="metric-icon-wrapper" style={{ color: 'var(--secondary)' }}>
              <Icons.TrendingUpIcon size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Support desk inbox splits */}
      <div 
        className={selectedTicket ? "two-col-grid-12-20" : ""} 
        style={selectedTicket ? {} : { display: 'block' }}
      >
        {/* Ticket Registry */}
        <ScrollableTable className="card" style={{ margin: '0' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Incoming Merchants Requests</span>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Filing Merchant</th>
                <th>Subject Topic</th>
                <th>Priority</th>
                <th>Responses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(tkt => (
                <tr key={tkt.id} onClick={() => setSelectedTicket(tkt)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{tkt.id}</td>
                  <td style={{ fontWeight: 600 }}>{tkt.merchant}</td>
                  <td>{tkt.subject}</td>
                  <td>
                    <span 
                      className={`status-badge ${tkt.priority === 'high' ? 'failed' : tkt.priority === 'medium' ? 'pending' : 'neutral'}`}
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                    >
                      {tkt.priority}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{tkt.responseCount}</td>
                  <td>
                    <span className={`status-badge ${tkt.status === 'open' ? 'failed' : tkt.status === 'pending' ? 'pending' : 'success'}`}>
                      {tkt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>

        {/* Selected ticket chat log */}
        {selectedTicket && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Ticket Workspace: {selectedTicket.id}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Merchant Partner: {selectedTicket.merchant}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedTicket.status !== 'resolved' && (
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--success)' }}
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                  >
                    Resolve ticket
                  </button>
                )}
                <button className="sidebar-toggle-btn" onClick={() => setSelectedTicket(null)}>
                  <Icons.CloseIcon size={16} />
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '12px' }}>
              {/* Core merchant subject description */}
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Subject: {selectedTicket.subject}</span>
              </div>

              {/* Chat timeline items */}
              {(chatLogs[selectedTicket.id] || []).map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backgroundColor: msg.sender === 'admin' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (msg.sender === 'admin' ? 'var(--primary)' : 'var(--border-color)'),
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ color: msg.sender === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '10px', marginBottom: '4px' }}>
                    {msg.sender === 'admin' ? 'Sarah Jenkins (You)' : selectedTicket.merchant}
                  </div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{msg.text}</div>
                  <div style={{ textAlign: 'right', fontSize: '8px', color: 'var(--text-muted)', marginTop: '4px' }}>{msg.time}</div>
                </div>
              ))}
            </div>

            {/* Reply textbox */}
            {selectedTicket.status !== 'resolved' ? (
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder="Type your response to merchant..." 
                  className="search-bar" 
                  style={{ flexGrow: 1, height: '36px' }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ height: '36px', paddingInline: '16px' }}>
                  Send
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px' }}>
                This ticket has been marked resolved.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
