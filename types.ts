

export enum AssetStatus {
  Available = 'Available',
  Assigned = 'Assigned',
  InRepair = 'In Repair',
  Retired = 'Retired',
  Lost = 'Lost',
  // New statuses for Subscriptions
  Active = 'Active',
  Expired = 'Expired'
}

export enum AssetType {
  Laptop = 'Laptop',
  Monitor = 'Monitor',
  Mobile = 'Mobile',
  Peripheral = 'Peripheral',
  Software = 'Software',
  Subscription = 'Subscription',
  Other = 'Other'
}

export type BillingCycle = 'Monthly' | 'Yearly' | 'One-Time' | 'Quarterly';

export interface Asset {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  type: AssetType;
  status: AssetStatus;
  purchaseDate: string;
  price: number;
  assignedTo?: string; // Employee Name or ID
  notes?: string;
  // Subscription specific fields
  renewalDate?: string;
  billingCycle?: BillingCycle;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export type ViewState = 'dashboard' | 'inventory' | 'subscriptions' | 'pdf-editor' | 'reports' | 'ai-assistant';

export interface DocumentTemplate {
  id: string;
  title: string;
  content: string; // HTML content
  lastModified: string;
  category: 'Form' | 'Report' | 'Letter' | 'Imported';
}
