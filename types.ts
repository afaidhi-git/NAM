
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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

export type ViewState = 'dashboard' | 'inventory' | 'subscriptions' | 'reports';

export interface User extends SupabaseUser {}
export interface AuthSession extends Session {}