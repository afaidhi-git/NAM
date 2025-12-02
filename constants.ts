
import { Asset, AssetStatus, AssetType, DocumentTemplate } from './types';

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

export const INITIAL_DOCUMENTS: DocumentTemplate[] = [
  {
    id: 'DOC-001',
    title: 'Asset Handover Form',
    category: 'Form',
    lastModified: '2024-03-20',
    content: `
      <h1 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">Asset Handover Form</h1>
      <p><strong>Date:</strong> [Current Date]</p>
      <p><strong>Employee Name:</strong> [Employee Name]</p>
      <p><strong>Employee ID:</strong> [ID]</p>
      <hr />
      <h3>Asset Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Asset ID</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Serial No.</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Condition</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">[Asset ID]</td>
          <td style="border: 1px solid #ddd; padding: 8px;">[Asset Name]</td>
          <td style="border: 1px solid #ddd; padding: 8px;">[Serial]</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Good</td>
        </tr>
      </table>
      <br />
      <h3>Declaration</h3>
      <p>I hereby acknowledge receipt of the above assets and agree to maintain them in good condition.</p>
      <br /><br />
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div style="border-top: 1px solid #000; width: 40%; padding-top: 5px;"><strong>Employee Signature</strong></div>
        <div style="border-top: 1px solid #000; width: 40%; padding-top: 5px;"><strong>IT Manager Signature</strong></div>
      </div>
    `
  },
  {
    id: 'DOC-002',
    title: 'Incident Report - Lost Asset',
    category: 'Report',
    lastModified: '2024-03-15',
    content: `
      <h1 style="color: #b91c1c;">Lost/Stolen Asset Report</h1>
      <p><strong>Incident Date:</strong> [Date]</p>
      <p><strong>Reported By:</strong> [Name]</p>
      <hr />
      <h3>Incident Details</h3>
      <p>Please describe how the loss occurred:</p>
      <div style="background: #f9fafb; border: 1px dashed #ccc; height: 100px; padding: 10px;">
        (Type details here...)
      </div>
      <h3>Asset Information</h3>
      <ul>
        <li><strong>Asset Model:</strong> [Model]</li>
        <li><strong>Serial Number:</strong> [Serial]</li>
        <li><strong>Last Known Location:</strong> [Location]</li>
      </ul>
      <p style="font-size: 0.9em; color: #666; margin-top: 30px;">This report will be filed with the finance department for write-off processing.</p>
    `
  }
];
