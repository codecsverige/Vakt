export type BillFrequency =
  | 'once'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'custom';

export type BillCategory =
  | 'housing'
  | 'utilities'
  | 'internet'
  | 'insurance'
  | 'transport'
  | 'streaming'
  | 'health'
  | 'other';

export interface ContactInformation {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export interface ReminderSetting {
  id: string;
  offsetDays: number;
  scheduledAt?: string;
}

export interface Attachment {
  id: string;
  billId: string;
  name: string;
  type: 'image' | 'pdf' | 'file';
  uri: string;
  size?: number;
  mimeType?: string;
  addedAt: string;
}

export type BillStatus = 'scheduled' | 'paid' | 'overdue' | 'paused';

export interface Bill {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  dueDate: string;
  frequency: BillFrequency;
  category: BillCategory;
  notes?: string;
  remindSettings: ReminderSetting[];
  attachments: Attachment[];
  referenceNumber?: string;
  providerContact?: ContactInformation;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  status: BillStatus;
  isAutoPay?: boolean;
  nextOccurrence?: string;
}

export interface BillInput {
  serviceName: string;
  amount: number;
  currency: string;
  dueDate: string;
  frequency: BillFrequency;
  category: BillCategory;
  notes?: string;
  remindSettings: ReminderSetting[];
  referenceNumber?: string;
  providerContact?: ContactInformation;
  attachments?: Attachment[];
  isAutoPay?: boolean;
}
