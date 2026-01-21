
import { Asset, AssetStatus, AssetType } from './types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    model: 'M2 Max',
    serialNumber: 'FVFX1234K9',
    type: AssetType.Laptop,
    status: AssetStatus.Assigned,
    purchaseDate: '2023-05-15',
    price: 3499,
    assignedTo: 'Sarah Jenkins',
    notes: 'Primary dev machine for Lead Engineer'
  },
  {
    id: 'AST-002',
    name: 'Dell XPS 15',
    model: '9520',
    serialNumber: '8H29A11',
    type: AssetType.Laptop,
    status: AssetStatus.Available,
    purchaseDate: '2023-01-20',
    price: 2100,
    notes: 'Returned by previous employee, reformatted.'
  },
  {
    id: 'AST-003',
    name: 'Dell UltraSharp 27"',
    model: 'U2723QE',
    serialNumber: 'CN-0M5-74261',
    type: AssetType.Monitor,
    status: AssetStatus.Assigned,
    purchaseDate: '2023-06-10',
    price: 650,
    assignedTo: 'Sarah Jenkins'
  },
  {
    id: 'AST-004',
    name: 'iPhone 14 Pro',
    model: 'A2890',
    serialNumber: 'L992KA82',
    type: AssetType.Mobile,
    status: AssetStatus.InRepair,
    purchaseDate: '2022-11-05',
    price: 999,
    assignedTo: 'Michael Chen',
    notes: 'Screen cracked, sent to vendor.'
  },
  {
    id: 'AST-005',
    name: 'Logitech MX Master 3S',
    model: 'MR0077',
    serialNumber: '2133LZ51',
    type: AssetType.Peripheral,
    status: AssetStatus.Available,
    purchaseDate: '2024-02-01',
    price: 99,
  },
  {
    id: 'AST-006',
    name: 'Adobe Creative Cloud',
    model: 'All Apps License',
    serialNumber: 'LIC-9921-22',
    type: AssetType.Subscription,
    status: AssetStatus.Active,
    purchaseDate: '2024-01-01',
    renewalDate: '2025-01-01',
    billingCycle: 'Yearly',
    price: 600,
    assignedTo: 'Marketing Team'
  },
  {
    id: 'AST-007',
    name: 'ThinkPad X1 Carbon',
    model: 'Gen 10',
    serialNumber: 'PF-2K91AA',
    type: AssetType.Laptop,
    status: AssetStatus.Retired,
    purchaseDate: '2020-03-15',
    price: 1800,
    notes: 'End of lifecycle.'
  },
  {
    id: 'AST-008',
    name: 'Herman Miller Aeron',
    model: 'Size B',
    serialNumber: 'HM-12941',
    type: AssetType.Other,
    status: AssetStatus.Assigned,
    purchaseDate: '2022-08-20',
    price: 1400,
    assignedTo: 'David Miller'
  },
  {
    id: 'SUB-101',
    name: 'Slack Enterprise',
    model: 'Business Plus',
    serialNumber: 'SLK-2291',
    type: AssetType.Subscription,
    status: AssetStatus.Active,
    purchaseDate: '2023-05-01',
    renewalDate: '2024-05-01',
    billingCycle: 'Monthly',
    price: 1250,
    assignedTo: 'Company Wide'
  },
  {
    id: 'SUB-102',
    name: 'Figma',
    model: 'Professional',
    serialNumber: 'FIG-8821',
    type: AssetType.Subscription,
    status: AssetStatus.Active,
    purchaseDate: '2023-08-15',
    renewalDate: '2024-08-15',
    billingCycle: 'Yearly',
    price: 144,
    assignedTo: 'Design Team'
  },
  {
    id: 'SUB-103',
    name: 'Jira Cloud',
    model: 'Standard',
    serialNumber: 'AT-9921',
    type: AssetType.Subscription,
    status: AssetStatus.Expired,
    purchaseDate: '2022-01-01',
    renewalDate: '2023-01-01',
    billingCycle: 'Yearly',
    price: 2000,
    notes: 'Migrated to Linear'
  }
];

export const STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.Available]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [AssetStatus.Assigned]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AssetStatus.InRepair]: 'bg-amber-100 text-amber-800 border-amber-200',
  [AssetStatus.Retired]: 'bg-slate-100 text-slate-800 border-slate-200',
  [AssetStatus.Lost]: 'bg-red-100 text-red-800 border-red-200',
  [AssetStatus.Active]: 'bg-teal-100 text-teal-800 border-teal-200',
  [AssetStatus.Expired]: 'bg-gray-100 text-gray-500 border-gray-200',
};
