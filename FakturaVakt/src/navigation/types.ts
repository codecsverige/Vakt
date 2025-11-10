export type MainTabsParamList = {
  Upcoming: undefined;
  Dashboard: undefined;
  Archive: undefined;
  Settings: undefined;
};

import type { BillInput } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  BillForm: { billId?: string; prefill?: Partial<BillInput> } | undefined;
  QRScanner: { billId?: string } | undefined;
  PaymentExtension: { billId: string };
  AttachmentViewer: { billId: string; attachmentId?: string };
};
