// High-fidelity Mock Database for Paydiya Super Admin Dashboard

export interface Merchant {
  id: string;
  name: string;
  email: string;
  businessCategory: string;
  riskScore: number; // 0 - 100
  kycStatus: 'approved' | 'under_review' | 'rejected' | 'pending';
  revenueGenerated: number;
  joinedDate: string;
  taxId: string;
  status: 'active' | 'suspended';
}

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Wallet' | 'Net Banking';
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  fraudScore: number; // 0 - 100
  customerEmail: string;
  cardDetails?: string;
  ipAddress: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  amount: number;
  merchant: string;
  reason: string;
  status: 'needs_response' | 'under_review' | 'won' | 'lost';
  evidenceSubmitted: boolean;
  deadline: string;
}

export interface Settlement {
  id: string;
  merchant: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  bankName: string;
  accountNumber: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user: string;
  email: string;
  actionType: string;
  module: string;
  timestamp: string;
  ipAddress: string;
}

export interface SupportTicket {
  id: string;
  merchant: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  responseCount: number;
}

export interface SystemService {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number; // ms
  uptime: number; // %
  load: number; // %
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Risk Officer' | 'Finance Manager' | 'Compliance Specialist';
  department: 'Executive' | 'Operations' | 'Risk & Trust' | 'Finance';
  status: 'active' | 'suspended';
}

// Initial Datasets
export const initialMerchants: Merchant[] = [
  { id: 'mer_01H9Y2', name: 'Apex Retailers', email: 'billing@apexretail.com', businessCategory: 'E-commerce', riskScore: 12, kycStatus: 'approved', revenueGenerated: 1420500, joinedDate: '2025-09-14', taxId: 'TAX-892019A', status: 'active' },
  { id: 'mer_01H9Y5', name: 'SaaSify Inc.', email: 'admin@saasify.co', businessCategory: 'Software / SaaS', riskScore: 8, kycStatus: 'approved', revenueGenerated: 894000, joinedDate: '2025-10-01', taxId: 'TAX-103948F', status: 'active' },
  { id: 'mer_01H9Y7', name: 'Zenith Logistics', email: 'ops@zenithlog.com', businessCategory: 'Transportation', riskScore: 34, kycStatus: 'under_review', revenueGenerated: 341000, joinedDate: '2026-01-20', taxId: 'TAX-574920B', status: 'active' },
  { id: 'mer_01H9Y8', name: 'Velocity Gaming', email: 'payments@velocity.gg', businessCategory: 'Gaming', riskScore: 78, kycStatus: 'under_review', revenueGenerated: 512000, joinedDate: '2026-03-02', taxId: 'TAX-493019D', status: 'active' },
  { id: 'mer_01H9ZA', name: 'Nova Freelance', email: 'payouts@nova.io', businessCategory: 'Marketplace', riskScore: 45, kycStatus: 'pending', revenueGenerated: 124000, joinedDate: '2026-05-11', taxId: 'TAX-228940C', status: 'active' },
  { id: 'mer_01H9ZB', name: 'Prime Crypto Swap', email: 'compliance@primeswap.io', businessCategory: 'Crypto / Forex', riskScore: 92, kycStatus: 'rejected', revenueGenerated: 0, joinedDate: '2026-05-15', taxId: 'TAX-110293X', status: 'suspended' },
  { id: 'mer_01H9ZC', name: 'Titan EdTech', email: 'finance@titan.edu', businessCategory: 'Education', riskScore: 15, kycStatus: 'approved', revenueGenerated: 2150000, joinedDate: '2025-08-11', taxId: 'TAX-339201M', status: 'active' },
  { id: 'mer_01H9ZD', name: 'Swift Delivery Corp', email: 'payouts@swiftdeliver.in', businessCategory: 'On-Demand', riskScore: 56, kycStatus: 'suspended' as any || 'approved', revenueGenerated: 673000, joinedDate: '2025-11-30', taxId: 'TAX-902910G', status: 'suspended' },
  { id: 'mer_01H9ZE', name: 'Luna Healthcare', email: 'billing@lunahealth.co', businessCategory: 'Medical', riskScore: 21, kycStatus: 'approved', revenueGenerated: 450000, joinedDate: '2025-12-12', taxId: 'TAX-558291P', status: 'active' },
  { id: 'mer_01H9ZF', name: 'Harbor Hospitality', email: 'guestservices@harborstay.com', businessCategory: 'Hospitality', riskScore: 29, kycStatus: 'approved', revenueGenerated: 381000, joinedDate: '2026-01-05', taxId: 'TAX-193020H', status: 'active' },
  { id: 'mer_01H9ZG', name: 'StackFix Subscription', email: 'finance@stackfix.io', businessCategory: 'Subscription Services', riskScore: 18, kycStatus: 'approved', revenueGenerated: 795000, joinedDate: '2025-12-01', taxId: 'TAX-772811D', status: 'active' },
  { id: 'mer_01H9ZH', name: 'Atlas Travel Co.', email: 'bookings@atlastravel.com', businessCategory: 'Travel', riskScore: 41, kycStatus: 'approved', revenueGenerated: 215000, joinedDate: '2026-02-18', taxId: 'TAX-668211E', status: 'active' },
  { id: 'mer_01H9ZI', name: 'Nosh Nation', email: 'orders@noshnation.com', businessCategory: 'Food & Beverage', riskScore: 53, kycStatus: 'under_review', revenueGenerated: 272000, joinedDate: '2026-04-06', taxId: 'TAX-882001N', status: 'active' },
  { id: 'mer_01H9ZJ', name: 'BulkLine Wholesale', email: 'sales@bulkline.co', businessCategory: 'Wholesale', riskScore: 33, kycStatus: 'approved', revenueGenerated: 982000, joinedDate: '2025-11-09', taxId: 'TAX-337709Q', status: 'active' },
  { id: 'mer_01H9ZK', name: 'GuardTrust Insurance', email: 'claims@guardtrust.io', businessCategory: 'Insurance', riskScore: 27, kycStatus: 'pending', revenueGenerated: 160000, joinedDate: '2026-03-29', taxId: 'TAX-777220I', status: 'active' },
  { id: 'mer_01H9ZL', name: 'Signal Networks', email: 'support@signalnet.tel', businessCategory: 'Telecom', riskScore: 36, kycStatus: 'approved', revenueGenerated: 1290000, joinedDate: '2025-10-14', taxId: 'TAX-993102W', status: 'active' },
  { id: 'mer_01H9ZM', name: 'DrivePro Automotive', email: 'fleet@drivepro.auto', businessCategory: 'Automotive', riskScore: 48, kycStatus: 'under_review', revenueGenerated: 680000, joinedDate: '2026-01-22', taxId: 'TAX-449801A', status: 'active' },
  { id: 'mer_01H9ZN', name: 'GridSense Utilities', email: 'billing@gridsense.com', businessCategory: 'Utilities', riskScore: 22, kycStatus: 'approved', revenueGenerated: 730000, joinedDate: '2025-09-27', taxId: 'TAX-281740P', status: 'active' },
  { id: 'mer_01H9ZO', name: 'Prime Counsel', email: 'info@primecounsel.com', businessCategory: 'Professional Services', riskScore: 16, kycStatus: 'approved', revenueGenerated: 413000, joinedDate: '2025-12-18', taxId: 'TAX-665493J', status: 'active' },
  { id: 'mer_01H9ZP', name: 'Skyline Properties', email: 'leasing@skylineprop.com', businessCategory: 'Real Estate', riskScore: 39, kycStatus: 'approved', revenueGenerated: 520000, joinedDate: '2026-02-02', taxId: 'TAX-114558L', status: 'active' },
  { id: 'mer_01H9ZQ', name: 'Pulse Media Group', email: 'creative@pulsemg.com', businessCategory: 'Media & Entertainment', riskScore: 61, kycStatus: 'pending', revenueGenerated: 360000, joinedDate: '2026-05-03', taxId: 'TAX-550913M', status: 'active' },
];

export const initialTransactions: Transaction[] = [
  { id: 'tx_89a0f2', amount: 1250.00, merchant: 'Apex Retailers', paymentMethod: 'Credit Card', status: 'success', timestamp: '2026-06-12T12:28:10Z', fraudScore: 14, customerEmail: 'cust_johndoe@gmail.com', cardDetails: 'Visa •••• 4242', ipAddress: '192.168.1.45' },
  { id: 'tx_89a0f3', amount: 89.00, merchant: 'SaaSify Inc.', paymentMethod: 'Debit Card', status: 'success', timestamp: '2026-06-12T12:26:45Z', fraudScore: 5, customerEmail: 'billing@cloudcorp.org', cardDetails: 'MC •••• 5512', ipAddress: '99.88.77.66' },
  { id: 'tx_89a0f4', amount: 5000.00, merchant: 'Velocity Gaming', paymentMethod: 'UPI', status: 'success', timestamp: '2026-06-12T12:25:01Z', fraudScore: 68, customerEmail: 'gamer_pro99@yahoo.com', ipAddress: '14.139.122.3' },
  { id: 'tx_89a0f5', amount: 12500.00, merchant: 'Prime Crypto Swap', paymentMethod: 'Credit Card', status: 'failed', timestamp: '2026-06-12T12:22:15Z', fraudScore: 94, customerEmail: 'suspect_user@onionmail.org', cardDetails: 'Amex •••• 1007', ipAddress: '185.220.101.4' },
  { id: 'tx_89a0f6', amount: 450.00, merchant: 'Titan EdTech', paymentMethod: 'Net Banking', status: 'success', timestamp: '2026-06-12T12:20:00Z', fraudScore: 11, customerEmail: 'student_acct@university.edu', ipAddress: '115.110.231.42' },
  { id: 'tx_89a0f7', amount: 320.00, merchant: 'Luna Healthcare', paymentMethod: 'UPI', status: 'pending', timestamp: '2026-06-12T12:18:30Z', fraudScore: 19, customerEmail: 'patient_alpha@outlook.com', ipAddress: '27.59.102.181' },
  { id: 'tx_89a0f8', amount: 15.50, merchant: 'Apex Retailers', paymentMethod: 'Wallet', status: 'success', timestamp: '2026-06-12T12:15:10Z', fraudScore: 2, customerEmail: 'micro_buyer@gmail.com', ipAddress: '192.168.1.100' },
  { id: 'tx_89a0f9', amount: 1200.00, merchant: 'Zenith Logistics', paymentMethod: 'Net Banking', status: 'success', timestamp: '2026-06-12T12:10:00Z', fraudScore: 23, customerEmail: 'freight_manager@indcargo.in', ipAddress: '49.207.240.119' },
  { id: 'tx_89a1a0', amount: 3400.00, merchant: 'Velocity Gaming', paymentMethod: 'Credit Card', status: 'failed', timestamp: '2026-06-12T12:08:12Z', fraudScore: 82, customerEmail: 'whale_player@twitch.tv', cardDetails: 'Visa •••• 9921', ipAddress: '122.161.49.25' },
  { id: 'tx_89a1a1', amount: 299.00, merchant: 'SaaSify Inc.', paymentMethod: 'Credit Card', status: 'success', timestamp: '2026-06-12T12:05:00Z', fraudScore: 9, customerEmail: 'accounting@startup.io', cardDetails: 'Visa •••• 8823', ipAddress: '54.210.12.99' },
];

export const initialDisputes: Dispute[] = [
  { id: 'dsp_01G90A', transactionId: 'tx_89a1a0', amount: 3400.00, merchant: 'Velocity Gaming', reason: 'Fraudulent - Card Not Present', status: 'needs_response', evidenceSubmitted: false, deadline: '2026-06-25' },
  { id: 'dsp_01G90B', transactionId: 'tx_89a0f5', amount: 12500.00, merchant: 'Prime Crypto Swap', reason: 'Unrecognized Transaction', status: 'under_review', evidenceSubmitted: true, deadline: '2026-06-20' },
  { id: 'dsp_01G90C', transactionId: 'tx_89f1a2', amount: 120.00, merchant: 'Apex Retailers', reason: 'Product Not Received', status: 'won', evidenceSubmitted: true, deadline: '2026-05-30' },
  { id: 'dsp_01G90D', transactionId: 'tx_89f1a8', amount: 550.00, merchant: 'Swift Delivery Corp', reason: 'Services Not Rendered', status: 'lost', evidenceSubmitted: false, deadline: '2026-05-15' },
];

export const initialSettlements: Settlement[] = [
  { id: 'set_9901A', merchant: 'Apex Retailers', amount: 245900.00, status: 'completed', bankName: 'HDFC Bank', accountNumber: '••••••••8920', timestamp: '2026-06-12T06:00:00Z' },
  { id: 'set_9901B', merchant: 'SaaSify Inc.', amount: 189200.00, status: 'completed', bankName: 'Silicon Valley Bank', accountNumber: '••••••••4029', timestamp: '2026-06-12T06:00:00Z' },
  { id: 'set_9901C', merchant: 'Titan EdTech', amount: 312000.00, status: 'completed', bankName: 'ICICI Bank', accountNumber: '••••••••1102', timestamp: '2026-06-12T06:00:00Z' },
  { id: 'set_9901D', merchant: 'Zenith Logistics', amount: 45000.00, status: 'pending', bankName: 'State Bank of India', accountNumber: '••••••••5739', timestamp: '2026-06-12T12:00:00Z' },
  { id: 'set_9901E', merchant: 'Velocity Gaming', amount: 89000.00, status: 'failed', bankName: 'Axis Bank', accountNumber: '••••••••9901', timestamp: '2026-06-12T12:00:00Z' },
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'log_01', user: 'Sarah Jenkins', email: 'sjenkins@paydiya.com', actionType: 'KYC Approved', module: 'Merchants', timestamp: '2026-06-12T12:15:30Z', ipAddress: '10.0.4.150' },
  { id: 'log_02', user: 'Alex Rivera', email: 'arivera@paydiya.com', actionType: 'API Key Created', module: 'Developer', timestamp: '2026-06-12T11:42:01Z', ipAddress: '10.0.4.12' },
  { id: 'log_03', user: 'Sarah Jenkins', email: 'sjenkins@paydiya.com', actionType: 'Merchant Suspended', module: 'Merchants', timestamp: '2026-06-12T10:05:00Z', ipAddress: '10.0.4.150' },
  { id: 'log_04', user: 'David Chen', email: 'dchen@paydiya.com', actionType: 'Dispute Responded', module: 'Risk', timestamp: '2026-06-12T09:12:45Z', ipAddress: '10.0.2.88' },
  { id: 'log_05', user: 'Alex Rivera', email: 'arivera@paydiya.com', actionType: 'Refund Processed', module: 'Finance', timestamp: '2026-06-12T08:30:10Z', ipAddress: '10.0.4.12' },
];

export const initialSupportTickets: SupportTicket[] = [
  { id: 'tkt_2940', merchant: 'Apex Retailers', subject: 'Dispute Chargeback Evidence Rejected API Error', status: 'open', priority: 'high', createdAt: '2026-06-12T10:20:00Z', responseCount: 2 },
  { id: 'tkt_2941', merchant: 'Velocity Gaming', subject: 'Payout delays to Axis Bank Accounts', status: 'pending', priority: 'medium', createdAt: '2026-06-12T08:45:00Z', responseCount: 1 },
  { id: 'tkt_2942', merchant: 'SaaSify Inc.', subject: 'Requesting Tier 2 Fee Pricing Tier Upgrade', status: 'resolved', priority: 'low', createdAt: '2026-06-11T14:30:00Z', responseCount: 4 },
  { id: 'tkt_2943', merchant: 'Nova Freelance', subject: 'KYC Document upload failure on PAN card validation', status: 'open', priority: 'high', createdAt: '2026-06-12T11:50:00Z', responseCount: 0 },
];

export const initialSystemServices: SystemService[] = [
  { name: 'Payment API Gateway', status: 'online', latency: 42, uptime: 99.98, load: 34 },
  { name: 'Core Database cluster', status: 'online', latency: 8, uptime: 99.99, load: 45 },
  { name: 'Settlement Engine', status: 'online', latency: 120, uptime: 99.95, load: 12 },
  { name: 'Notification Service (SMS/Email)', status: 'degraded', latency: 850, uptime: 99.85, load: 88 },
  { name: 'Webhook Dispatch Queue', status: 'online', latency: 18, uptime: 99.97, load: 5 },
];

export const initialAdminUsers: AdminUser[] = [
  { id: 'adm_01', name: 'Sarah Jenkins', email: 'sjenkins@paydiya.com', role: 'Super Admin', department: 'Executive', status: 'active' },
  { id: 'adm_02', name: 'David Chen', email: 'dchen@paydiya.com', role: 'Risk Officer', department: 'Risk & Trust', status: 'active' },
  { id: 'adm_03', name: 'Alex Rivera', email: 'arivera@paydiya.com', role: 'Finance Manager', department: 'Finance', status: 'active' },
  { id: 'adm_04', name: 'Elana Rostova', email: 'erostova@paydiya.com', role: 'Compliance Specialist', department: 'Operations', status: 'active' },
];

// Payment Method Distribution (Donut Chart representation)
export const paymentMethodDist = [
  { name: 'UPI', value: 42, color: '#0F764E', raw: 142800 },
  { name: 'Credit Cards', value: 31, color: '#D97706', raw: 105400 },
  { name: 'Debit Cards', value: 15, color: '#10B981', raw: 51000 },
  { name: 'Wallets', value: 8, color: '#F59E0B', raw: 27200 },
  { name: 'Net Banking', value: 4, color: '#F43F5E', raw: 13600 },
];

// Interactive SVGs Chart Data points for Revenue Trends and Volumes
// Format: label (X-axis), value (Y-axis revenue in $k), value2 (Y-axis volume in count)
export const chartData = {
  Today: [
    { label: '00:00', revenue: 120, volume: 840, successRate: 98.4 },
    { label: '04:00', revenue: 80, volume: 510, successRate: 98.1 },
    { label: '08:00', revenue: 220, volume: 1650, successRate: 98.7 },
    { label: '12:00', revenue: 450, volume: 3200, successRate: 99.2 },
    { label: '16:00', revenue: 380, volume: 2900, successRate: 98.9 },
    { label: '20:00', revenue: 290, volume: 2100, successRate: 99.0 },
  ],
  Week: [
    { label: 'Mon', revenue: 2100, volume: 14500, successRate: 98.6 },
    { label: 'Tue', revenue: 2400, volume: 16800, successRate: 98.8 },
    { label: 'Wed', revenue: 2800, volume: 18900, successRate: 99.1 },
    { label: 'Thu', revenue: 2600, volume: 17200, successRate: 98.9 },
    { label: 'Fri', revenue: 3200, volume: 22000, successRate: 99.0 },
    { label: 'Sat', revenue: 1900, volume: 13400, successRate: 98.2 },
    { label: 'Sun', revenue: 1700, volume: 11900, successRate: 98.5 },
  ],
  Month: [
    { label: 'Week 1', revenue: 12500, volume: 87000, successRate: 98.7 },
    { label: 'Week 2', revenue: 14200, volume: 98000, successRate: 98.9 },
    { label: 'Week 3', revenue: 16800, volume: 112000, successRate: 99.2 },
    { label: 'Week 4', revenue: 15400, volume: 104000, successRate: 98.8 },
  ],
  Quarter: [
    { label: 'Jan', revenue: 52000, volume: 340000, successRate: 98.8 },
    { label: 'Feb', revenue: 48000, volume: 320000, successRate: 98.6 },
    { label: 'Mar', revenue: 58000, volume: 390000, successRate: 99.1 },
  ],
  Year: [
    { label: '2025 Q1', revenue: 145000, volume: 980000, successRate: 98.7 },
    { label: '2025 Q2', revenue: 162000, volume: 1100000, successRate: 98.9 },
    { label: '2025 Q3', revenue: 180000, volume: 1230000, successRate: 99.0 },
    { label: '2025 Q4', revenue: 210000, volume: 1450000, successRate: 99.2 },
    { label: '2026 Q1', revenue: 225000, volume: 1510000, successRate: 99.1 },
    { label: '2026 Q2 (Est)', revenue: 245000, volume: 1690000, successRate: 99.3 },
  ],
};

// Generates dynamic values for KPI charts
export const kpiMetrics = {
  tpv: { value: '$342,910,250', change: '+14.2%', sparkline: [10, 15, 8, 12, 19, 14, 25, 22, 28] },
  successTransactions: { value: '2,940,115', change: '+11.8%', sparkline: [5, 12, 9, 14, 11, 18, 16, 22, 24] },
  failedTransactions: { value: '45,820', change: '-4.3%', sparkline: [18, 14, 16, 12, 11, 9, 8, 5, 4] },
  activeMerchants: { value: '8,420', change: '+6.1%', sparkline: [10, 11, 11, 12, 12, 13, 13, 14, 15] },
  todayRevenue: { value: '$428,900', change: '+22.4%', sparkline: [8, 5, 12, 25, 18, 20, 26, 22, 30] },
  pendingSettlements: { value: '$134,000', change: '-2.1%', sparkline: [20, 22, 18, 15, 19, 14, 16, 12, 10] },
  fraudAlerts: { value: '14', change: '-30.7%', sparkline: [12, 15, 8, 14, 9, 7, 5, 2, 3] },
  chargebackRatio: { value: '0.12%', change: '-0.03%', sparkline: [18, 17, 19, 15, 14, 12, 13, 11, 10] },
};
