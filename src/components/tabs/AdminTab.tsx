import React, { useState } from 'react';
import * as Icons from '../icons';
import { initialAdminUsers, initialAuditLogs } from '../../mockData';
import type { AdminUser, AuditLog } from '../../mockData';
import ScrollableTable from '../ScrollableTable';

interface AdminTabProps {
  searchQuery: string;
  subTab: string; // 'users' | 'roles' | 'audit'
}

interface RolePermission {
  role: string;
  permissions: {
    dashboard: boolean;
    merchants: boolean;
    kyc_approve: boolean;
    payout_trigger: boolean;
    refunds: boolean;
    risk_write: boolean;
    dev_keys: boolean;
  };
}

export default function AdminTab({ searchQuery, subTab }: AdminTabProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [selectedAuditModule, setSelectedAuditModule] = useState<string>('All');
  
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    { role: 'Super Admin', permissions: { dashboard: true, merchants: true, kyc_approve: true, payout_trigger: true, refunds: true, risk_write: true, dev_keys: true } },
    { role: 'Risk Officer', permissions: { dashboard: true, merchants: true, kyc_approve: true, payout_trigger: false, refunds: false, risk_write: true, dev_keys: false } },
    { role: 'Finance Manager', permissions: { dashboard: true, merchants: true, kyc_approve: false, payout_trigger: true, refunds: true, risk_write: false, dev_keys: false } },
    { role: 'Compliance Specialist', permissions: { dashboard: true, merchants: true, kyc_approve: true, payout_trigger: false, refunds: false, risk_write: false, dev_keys: false } },
  ]);

  const toggleUserStatus = (userId: string) => {
    setAdminUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const nextStatus = user.status === 'active' ? 'suspended' : 'active';
        
        // Log this action to the audit logs!
        const newAuditLog: AuditLog = {
          id: `log_${Math.random().toString(36).substring(2, 6)}`,
          user: 'Sarah Jenkins',
          email: 'sjenkins@paydiya.com',
          actionType: nextStatus === 'suspended' ? 'Admin Suspended' : 'Admin Reinstated',
          module: 'Administration',
          timestamp: new Date().toISOString(),
          ipAddress: '10.0.4.150'
        };
        setAuditLogs(prevLogs => [newAuditLog, ...prevLogs]);

        return { ...user, status: nextStatus };
      }
      return user;
    }));
  };

  const togglePermission = (roleIndex: number, permissionKey: keyof RolePermission['permissions']) => {
    setRolePermissions(prev => prev.map((rp, idx) => {
      if (idx === roleIndex) {
        return {
          ...rp,
          permissions: {
            ...rp.permissions,
            [permissionKey]: !rp.permissions[permissionKey]
          }
        };
      }
      return rp;
    }));
  };

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedAuditModule === 'All' || log.module === selectedAuditModule;
    return matchesSearch && matchesModule;
  });

  // Filter users
  const filteredUsers = adminUsers.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {subTab === 'users' && 'Internal Team Directory'}
          {subTab === 'roles' && 'Roles & Permissions Dashboard'}
          {subTab === 'audit' && 'System Audit Timeline'}
        </h1>
        <span className="page-subtitle">
          {subTab === 'users' && 'Audit team login credentials, issue corporate roles, and suspend accounts.'}
          {subTab === 'roles' && 'Modify global dashboards access policies and endpoint action restrictions.'}
          {subTab === 'audit' && 'Comprehensive history of actions processed by gateway administrators.'}
        </span>
      </div>

      {/* RENDER TEAM DIRECTORY */}
      {subTab === 'users' && (
        <ScrollableTable className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Corporate Email</th>
                <th>Gateway Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '11px', backgroundColor: 'var(--primary)' }}>
                        {user.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.department}</td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'success' : 'failed'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ 
                        padding: '4px 10px', 
                        fontSize: '11px', 
                        color: user.status === 'active' ? 'var(--error)' : 'var(--success)',
                        borderColor: user.status === 'active' ? 'var(--error-glow)' : 'var(--success-glow)'
                      }}
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === 'active' ? 'Suspend User' : 'Reinstate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>
      )}

      {/* RENDER ROLES & PERMISSIONS */}
      {subTab === 'roles' && (
        <ScrollableTable className="card">
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Dashboard RBAC Authorization Policies</span>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Designation</th>
                <th>Access Dashboard</th>
                <th>Inspect Merchants</th>
                <th>Verify KYC App</th>
                <th>Process Payouts</th>
                <th>Issue Refunds</th>
                <th>Modify Risk Rules</th>
                <th>Generate API Keys</th>
              </tr>
            </thead>
            <tbody>
              {rolePermissions.map((rp, idx) => (
                <tr key={rp.role} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 600 }}>{rp.role}</td>
                  {/* Dashboard */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.dashboard} 
                      onChange={() => togglePermission(idx, 'dashboard')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Inspect Merchants */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.merchants} 
                      onChange={() => togglePermission(idx, 'merchants')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Verify KYC */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.kyc_approve} 
                      onChange={() => togglePermission(idx, 'kyc_approve')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Payouts */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.payout_trigger} 
                      onChange={() => togglePermission(idx, 'payout_trigger')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Refunds */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.refunds} 
                      onChange={() => togglePermission(idx, 'refunds')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Risk Write */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.risk_write} 
                      onChange={() => togglePermission(idx, 'risk_write')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {/* Developer Keys */}
                  <td>
                    <input 
                      type="checkbox" 
                      checked={rp.permissions.dev_keys} 
                      onChange={() => togglePermission(idx, 'dev_keys')} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>
      )}

      {/* RENDER AUDIT LOGS */}
      {subTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters Row */}
          <div className="card filter-row">
            <div className="filter-group">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Module Filter:</span>
              {(['All', 'Merchants', 'Developer', 'Risk', 'Finance', 'Administration'] as const).map(mod => (
                <button 
                  key={mod}
                  className={`chart-filter-btn ${selectedAuditModule === mod ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => setSelectedAuditModule(mod)}
                >
                  {mod}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {filteredLogs.length} audit entries
            </span>
          </div>

          {/* Timeline box */}
          <div className="card">
            <div className="timeline">
              {filteredLogs.map(log => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-header">
                    <span className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{log.user}</strong> 
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({log.email})</span>
                      <span className="status-badge neutral" style={{ fontSize: '9px', padding: '1px 6px', display: 'inline-flex' }}>
                        {log.module}
                      </span>
                    </span>
                    <span className="timeline-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="timeline-desc">{log.actionType}</span>
                  <span className="timeline-meta">IP Log: {log.ipAddress}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
