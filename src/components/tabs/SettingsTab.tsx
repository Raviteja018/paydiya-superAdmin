import React, { useState } from 'react';
import * as Icons from '../icons';

export default function SettingsTab() {
  const [profileEmail, setProfileEmail] = useState<string>('sjenkins@paydiya.com');
  const [profilePhone, setProfilePhone] = useState<string>('+1 (555) 389-1029');
  
  // System Gateway Parameters Switches
  const [mfaEnforced, setMfaEnforced] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [smartRouting, setSmartRouting] = useState<boolean>(true);
  const [webhookRetries, setWebhookRetries] = useState<boolean>(true);
  
  const [saveBanner, setSaveBanner] = useState<string>('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveBanner('Profile credentials updated successfully!');
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const handleSystemSave = () => {
    setSaveBanner('System gateway routing configuration synced to edge nodes!');
    setTimeout(() => setSaveBanner(''), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <span className="page-subtitle">Configure admin preferences, roll credentials, and modify global payment routing parameters.</span>
      </div>

      {saveBanner && (
        <div className="card animate-fade-in" style={{ backgroundColor: 'var(--success-glow)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
          {saveBanner}
        </div>
      )}

      <div className="two-col-grid-11">
        {/* Profile Details Card */}
        <div className="card">
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Super Admin Profile Credentials</span>
          
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Full Corporate Name</label>
              <input 
                type="text" 
                value="Sarah Jenkins" 
                disabled
                className="search-bar" 
                style={{ height: '34px', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)}
                className="search-bar" 
                style={{ height: '34px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Office Mobile Phone</label>
              <input 
                type="text" 
                value={profilePhone} 
                onChange={(e) => setProfilePhone(e.target.value)}
                className="search-bar" 
                style={{ height: '34px' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '6px', alignSelf: 'flex-start' }}>
              Update Profile Details
            </button>
          </form>
        </div>

        {/* Global System Settings Switches Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Global Payment Gateway Parameters</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* MFA Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enforce Mandatory MFA</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Require 2FA verification for all corporate admin logins.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={mfaEnforced} 
                  onChange={() => setMfaEnforced(!mfaEnforced)}
                  style={{ cursor: 'pointer', width: '32px', height: '16px' }}
                />
              </div>

              {/* Maintenance Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Maintenance Outage Mode</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Redirect API request pipelines to placeholder downtime pages.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={maintenanceMode} 
                  onChange={() => setMaintenanceMode(!maintenanceMode)}
                  style={{ cursor: 'pointer', width: '32px', height: '16px' }}
                />
              </div>

              {/* Smart Routing Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Smart Bank Fallback Routing</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Reroute transactions to secondary processors if gateway fails.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={smartRouting} 
                  onChange={() => setSmartRouting(!smartRouting)}
                  style={{ cursor: 'pointer', width: '32px', height: '16px' }}
                />
              </div>

              {/* Webhook Retries Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Retry Failed Webhooks</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Enable automatic exponential backoff webhook dispatch queues.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={webhookRetries} 
                  onChange={() => setWebhookRetries(!webhookRetries)}
                  style={{ cursor: 'pointer', width: '32px', height: '16px' }}
                />
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '20px', alignSelf: 'flex-start' }} onClick={handleSystemSave}>
            Save Gateway Settings
          </button>
        </div>
      </div>
    </div>
  );
}
