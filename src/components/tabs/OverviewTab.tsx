import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../icons';
import { chartData, kpiMetrics, paymentMethodDist, initialTransactions, initialSystemServices } from '../../mockData';
import type { Transaction } from '../../mockData';

export default function OverviewTab() {
  const [chartFilter, setChartFilter] = useState<'Today' | 'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'volume' | 'successRate'>('revenue');
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>(initialTransactions.slice(0, 5));
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ x: number; y: number; label: string; val: string; val2: string } | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  // Auto-inject a new transaction every 8 seconds to simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      const merchants = ['Apex Retailers', 'SaaSify Inc.', 'Velocity Gaming', 'Zenith Logistics', 'Titan EdTech'];
      const methods = ['UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Net Banking'] as const;
      const statuses = ['success', 'success', 'success', 'failed', 'pending'] as const;
      const amounts = [120, 45, 950, 2200, 310, 15, 60, 480];
      
      const newTx: Transaction = {
        id: `tx_${Math.random().toString(36).substring(2, 8)}`,
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        merchant: merchants[Math.floor(Math.random() * merchants.length)],
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date().toISOString(),
        fraudScore: Math.floor(Math.random() * 45) + (Math.random() > 0.8 ? 50 : 0),
        customerEmail: `user_${Math.random().toString(36).substring(2, 6)}@gmail.com`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };

      setLiveTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Compute Sparkline Path Coordinates
  const getSparklinePath = (points: number[]): string => {
    const width = 70;
    const height = 24;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * height + 1; // 1px offset padding
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const renderKpiCard = (
    key: string,
    label: string,
    value: string,
    change: string,
    sparkline: number[],
    icon: React.ReactNode
  ) => {
    const isNegative = change.startsWith('-');
    const arrow = isNegative ? '↘' : '↗';
    
    // Inverted metrics (where negative change is GOOD):
    const invertedMetrics = ['failedTransactions', 'pendingSettlements', 'fraudAlerts', 'chargebackRatio'];
    const isInverted = invertedMetrics.includes(key);
    
    const trendClass = (isNegative && !isInverted) || (!isNegative && isInverted) ? 'down' : 'up';
    
    return (
      <div className="card metric-card" key={key}>
        <div className="metric-top-row">
          <div className="metric-icon-squircle">
            {icon}
          </div>
          <svg className="metric-sparkline-graph" viewBox="0 0 70 24">
            <path 
              d={getSparklinePath(sparkline)} 
              fill="none" 
              stroke={trendClass === 'up' ? 'var(--success)' : 'var(--error)'} 
              strokeWidth="2.2" 
            />
          </svg>
        </div>
        
        <div className="metric-middle">
          <span className="metric-label-classic">{label}</span>
          <span className="metric-value-classic">{value}</span>
        </div>
        
        <div className="metric-bottom-classic">
          <span className={`trend-text ${trendClass}`}>
            {arrow} {change}
          </span>
          <span className="trend-compare-text">vs last period</span>
        </div>
      </div>
    );
  };

  // SVG Area Chart Rendering Math
  const currentData = chartData[chartFilter];
  const chartHeight = 220;
  const chartWidth = 680;
  const paddingX = 40;
  const paddingY = 20;

  // Extract values
  const yValues = currentData.map(d => d[activeMetric]);
  const yMin = 0;
  const yMax = Math.max(...yValues) * 1.15 || 10;
  const yRange = yMax - yMin;

  const points = currentData.map((d, idx) => {
    const x = paddingX + (idx / (currentData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((d[activeMetric] - yMin) / yRange) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // SVG path generation
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  
  // Close the path at the bottom to fill gradient
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(chartHeight - paddingY).toFixed(1)} L ${points[0].x.toFixed(1)} ${(chartHeight - paddingY).toFixed(1)} Z`
    : '';

  // Handle Chart mouse move for dynamic Tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartRef.current || points.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale mouse position to SVG viewbox coords
    const svgMouseX = (mouseX / rect.width) * chartWidth;
    
    // Find closest point
    let closest = points[0];
    let minDist = Math.abs(points[0].x - svgMouseX);
    
    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - svgMouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = points[i];
      }
    }

    const valueFormatter = (val: number) => {
      if (activeMetric === 'revenue') return `$${(val / 1000).toFixed(1)}K`;
      if (activeMetric === 'successRate') return `${val.toFixed(2)}%`;
      return val.toLocaleString();
    };

    const secondaryValFormatter = (pt: typeof closest.data) => {
      if (activeMetric === 'revenue') return `Volume: ${pt.volume.toLocaleString()}`;
      return `Revenue: $${(pt.revenue / 1000).toFixed(1)}K`;
    };

    setHoveredDataPoint({
      x: closest.x,
      y: closest.y,
      label: closest.data.label,
      val: valueFormatter(closest.data[activeMetric]),
      val2: secondaryValFormatter(closest.data)
    });
  };

  const handleMouseLeave = () => {
    setHoveredDataPoint(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Executive Dashboard</h1>
            <span className="page-subtitle">Real-time gateway statistics & transactional performance.</span>
          </div>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            <Icons.RefreshIcon size={16} />
            <span>Reload data</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <section className="metrics-grid">
        {renderKpiCard('tpv', 'Total Payment Volume', kpiMetrics.tpv.value, kpiMetrics.tpv.change, kpiMetrics.tpv.sparkline, <Icons.FinanceIcon size={22} />)}
        {renderKpiCard('successTransactions', 'Successful Payments', kpiMetrics.successTransactions.value, kpiMetrics.successTransactions.change, kpiMetrics.successTransactions.sparkline, <Icons.KYCApprovedIcon size={22} />)}
        {renderKpiCard('failedTransactions', 'Failed Payments', kpiMetrics.failedTransactions.value, kpiMetrics.failedTransactions.change, kpiMetrics.failedTransactions.sparkline, <Icons.BanIcon size={22} />)}
        {renderKpiCard('activeMerchants', 'Active Merchants', kpiMetrics.activeMerchants.value, kpiMetrics.activeMerchants.change, kpiMetrics.activeMerchants.sparkline, <Icons.MerchantIcon size={22} />)}
        {renderKpiCard('todayRevenue', "Today's Revenue", kpiMetrics.todayRevenue.value, kpiMetrics.todayRevenue.change, kpiMetrics.todayRevenue.sparkline, <Icons.TrendingUpIcon size={22} />)}
        {renderKpiCard('pendingSettlements', 'Pending Settlements', kpiMetrics.pendingSettlements.value, kpiMetrics.pendingSettlements.change, kpiMetrics.pendingSettlements.sparkline, <Icons.TransactionIcon size={22} />)}
        {renderKpiCard('fraudAlerts', 'Fraud Incidents', kpiMetrics.fraudAlerts.value, kpiMetrics.fraudAlerts.change, kpiMetrics.fraudAlerts.sparkline, <Icons.ShieldIcon size={22} />)}
        {renderKpiCard('chargebackRatio', 'Chargeback Ratio', kpiMetrics.chargebackRatio.value, kpiMetrics.chargebackRatio.change, kpiMetrics.chargebackRatio.sparkline, <Icons.DisputeIcon size={22} />)}
      </section>

      {/* Primary Analytics & Donut layout */}
      <div className="analytics-layout">
        {/* Main interactive chart */}
        <div className="card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Advanced Analytics Network</span>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
                <span 
                  onClick={() => setActiveMetric('revenue')} 
                  style={{ color: activeMetric === 'revenue' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeMetric === 'revenue' ? 600 : 500 }}
                >
                  Revenue Trends
                </span>
                <span 
                  onClick={() => setActiveMetric('volume')} 
                  style={{ color: activeMetric === 'volume' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeMetric === 'volume' ? 600 : 500 }}
                >
                  Payment Volume
                </span>
                <span 
                  onClick={() => setActiveMetric('successRate')} 
                  style={{ color: activeMetric === 'successRate' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeMetric === 'successRate' ? 600 : 500 }}
                >
                  Success Rate
                </span>
              </div>
            </div>
            <div className="chart-filters">
              {(['Today', 'Week', 'Month', 'Quarter', 'Year'] as const).map(f => (
                <button 
                  key={f} 
                  className={`chart-filter-btn ${chartFilter === f ? 'active' : ''}`}
                  onClick={() => setChartFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <svg 
              ref={chartRef}
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ overflow: 'visible', cursor: 'crosshair' }}
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                return (
                  <line 
                    key={i} 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="var(--border-color)" 
                    strokeWidth="0.5" 
                    strokeDasharray="4 4" 
                  />
                );
              })}

              {/* Gradient Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#chartGlow)" />}

              {/* Main Line Path */}
              {linePath && <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />}

              {/* Data points markers */}
              {points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  r="3.5" 
                  fill="var(--bg-app)" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                />
              ))}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <text 
                  key={idx} 
                  x={p.x} 
                  y={chartHeight - 4} 
                  fill="var(--text-muted)" 
                  fontSize="9" 
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {p.data.label}
                </text>
              ))}

              {/* Interactive Tooltip vertical cursor line */}
              {hoveredDataPoint && (
                <>
                  <line 
                    x1={hoveredDataPoint.x} 
                    y1={paddingY} 
                    x2={hoveredDataPoint.x} 
                    y2={chartHeight - paddingY} 
                    stroke="var(--primary)" 
                    strokeWidth="1" 
                    strokeDasharray="2 2" 
                  />
                  <circle 
                    cx={hoveredDataPoint.x} 
                    cy={hoveredDataPoint.y} 
                    r="6" 
                    fill="var(--primary)" 
                    stroke="var(--bg-app)" 
                    strokeWidth="2.5" 
                  />
                </>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredDataPoint && (
              <div 
                className="chart-tooltip animate-fade-in"
                style={{ 
                  left: `${(hoveredDataPoint.x / chartWidth) * 100}%`, 
                  top: `${(hoveredDataPoint.y / chartHeight) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)' 
                }}
              >
                <div className="chart-tooltip-date">{hoveredDataPoint.label}</div>
                <div className="chart-tooltip-row">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                  <span style={{ color: 'var(--text-primary)' }}>{hoveredDataPoint.val}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{hoveredDataPoint.val2}</div>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart Distribution */}
        <div className="card">
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Payment Distribution</span>
          <div className="donut-grid" style={{ marginTop: '16px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut-svg">
                {/* UPI Segment (42%) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--primary)" strokeWidth="4.5" strokeDasharray="42 58" strokeDashoffset="25" />
                {/* Credit Cards (31%) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--secondary)" strokeWidth="4.5" strokeDasharray="31 69" strokeDashoffset="83" />
                {/* Debit Cards (15%) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--success)" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="52" />
                {/* Wallets (8%) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--warning)" strokeWidth="4.5" strokeDasharray="8 92" strokeDashoffset="37" />
                {/* Net Banking (4%) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--error)" strokeWidth="4.5" strokeDasharray="4 96" strokeDashoffset="29" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>$342M</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volume</span>
              </div>
            </div>

            <div className="donut-legend">
              {paymentMethodDist.map(item => (
                <div key={item.name} className="legend-item">
                  <div className="legend-label-group">
                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}</span>
                  </div>
                  <span className="legend-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Transaction feed and Health monitors */}
      <div className="analytics-layout" style={{ marginTop: '0' }}>
        {/* Real-time transaction feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Live Transaction Stream</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
              <span className="live-pulse"></span> Streaming
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            {liveTransactions.map((tx, idx) => (
              <div 
                key={tx.id} 
                className="animate-fade-in"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)',
                  opacity: 1 - idx * 0.15 // Fades out trailing items
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-xs)', 
                    backgroundColor: tx.status === 'success' ? 'var(--success-glow)' : tx.status === 'failed' ? 'var(--error-glow)' : 'var(--warning-glow)',
                    color: tx.status === 'success' ? 'var(--success)' : tx.status === 'failed' ? 'var(--error)' : 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tx.paymentMethod === 'UPI' && <Icons.KeyboardIcon size={16} />}
                    {tx.paymentMethod === 'Credit Card' && <Icons.FinanceIcon size={16} />}
                    {tx.paymentMethod === 'Debit Card' && <Icons.FinanceIcon size={16} />}
                    {tx.paymentMethod === 'Wallet' && <Icons.MerchantIcon size={16} />}
                    {tx.paymentMethod === 'Net Banking' && <Icons.TransactionIcon size={16} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{tx.merchant}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tx.id} • {tx.paymentMethod}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>${tx.amount.toFixed(2)}</span>
                  <span 
                    className={`status-badge ${tx.status}`} 
                    style={{ 
                      fontSize: '9px', 
                      padding: '1px 6px',
                      backgroundColor: 'transparent',
                      color: tx.status === 'success' ? 'var(--success)' : tx.status === 'failed' ? 'var(--error)' : 'var(--warning)'
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Center */}
        <div className="card">
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>System Operations Health</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {initialSystemServices.map(srv => (
              <div 
                key={srv.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`health-indicator ${srv.status}`}></span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{srv.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Uptime: {srv.uptime}% • Load: {srv.load}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {srv.latency}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
