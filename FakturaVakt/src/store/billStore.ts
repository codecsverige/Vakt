import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment, Bill, BillInput, ReminderSetting } from '../types';
import { notificationService } from '../services/notificationService';
import { zustandStorage } from '../services/storage';
import { calculateBillStatus, getNextOccurrence } from '../utils/dates';
import { DEFAULT_CURRENCY, DEFAULT_REMINDER_OFFSETS } from '../utils/constants';
import { useSettingsStore } from './settingsStore';

const scheduleRemindersIfEnabled = (bill: Bill) => {
  if (!useSettingsStore.getState().notificationsEnabled) {
    return;
  }

  notificationService.scheduleBillReminders(bill).catch(() => undefined);
};

export interface Metrics {
  currentMonthTotal: number;
  previousMonthTotal: number;
  overdueCount: number;
  upcomingWeekCount: number;
  topCategories: Array<{ category: Bill['category']; amount: number }>;
}

export type BillState = {
  bills: Bill[];
  addBill: (input: BillInput) => Bill;
  updateBill: (id: string, updates: Partial<Bill>) => Bill | undefined;
  removeBill: (id: string) => void;
  markPaid: (id: string, paidAt?: string) => void;
  togglePause: (id: string) => void;
  addAttachment: (billId: string, attachment: Attachment) => void;
  removeAttachment: (billId: string, attachmentId: string) => void;
  setReminders: (billId: string, reminders: ReminderSetting[]) => void;
  refreshNotifications: () => Promise<void>;
  metrics: () => Metrics;
  upcomingBills: () => Bill[];
  overdueBills: () => Bill[];
  paidBills: () => Bill[];
};

const buildBill = (input: BillInput): Bill => {
  const id = uuidv4();
  const now = dayjs().toISOString();

  const remindSettings =
    (input.remindSettings?.length ?? 0) > 0
      ? input.remindSettings
      : DEFAULT_REMINDER_OFFSETS.map((offset) => ({
          id: uuidv4(),
          offsetDays: offset,
        }));

  const bill: Bill = {
    id,
    serviceName: input.serviceName,
    amount: input.amount,
    currency: input.currency ?? DEFAULT_CURRENCY,
    frequency: input.frequency,
    category: input.category,
    dueDate: dayjs(input.dueDate).toISOString(),
    notes: input.notes,
    remindSettings,
    attachments: input.attachments ?? [],
    referenceNumber: input.referenceNumber,
    providerContact: input.providerContact,
    createdAt: now,
    updatedAt: now,
    paidAt: undefined,
    status: 'scheduled',
    isAutoPay: input.isAutoPay,
    nextOccurrence: getNextOccurrence({
      ...input,
      id,
      attachments: input.attachments ?? [],
      createdAt: now,
      updatedAt: now,
      status: 'scheduled',
      remindSettings,
    } as Bill),
  };

  return bill;
};

export const useBillStore = create<BillState>()(
  devtools(
    persist(
      (set, get) => ({
        bills: [],
        addBill: (input) => {
          const bill = buildBill(input);

          set((state) => ({
            bills: [...state.bills, bill],
          }));

          scheduleRemindersIfEnabled(bill);

          return bill;
        },
        updateBill: (id, updates) => {
          let updatedBill: Bill | undefined;
          set((state) => {
            const bills = state.bills.map((bill) => {
              if (bill.id !== id) {
                return bill;
              }

              updatedBill = {
                ...bill,
                ...updates,
                remindSettings: updates.remindSettings ?? bill.remindSettings,
                attachments: updates.attachments ?? bill.attachments,
                updatedAt: dayjs().toISOString(),
              };

              updatedBill.status = calculateBillStatus(updatedBill);
              updatedBill.nextOccurrence = getNextOccurrence(updatedBill);

              return updatedBill;
            });

            return { bills };
          });

          if (updatedBill) {
            scheduleRemindersIfEnabled(updatedBill);
          }

          return updatedBill;
        },
        removeBill: (id) => {
          set((state) => ({
            bills: state.bills.filter((bill) => bill.id !== id),
          }));

          notificationService.cancelRemindersForBill(id).catch(() => undefined);
        },
        markPaid: (id, paidAt) => {
          const timestamp = paidAt ?? dayjs().toISOString();

          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === id
                ? {
                    ...bill,
                    paidAt: timestamp,
                    status: 'paid',
                    updatedAt: timestamp,
                  }
                : bill,
            ),
          }));

          notificationService.cancelRemindersForBill(id).catch(() => undefined);
        },
        togglePause: (id) => {
          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === id
                ? {
                    ...bill,
                    status: bill.status === 'paused' ? 'scheduled' : 'paused',
                    updatedAt: dayjs().toISOString(),
                  }
                : bill,
            ),
          }));
        },
        addAttachment: (billId, attachment) => {
          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === billId
                ? {
                    ...bill,
                    attachments: [...bill.attachments, attachment],
                    updatedAt: dayjs().toISOString(),
                  }
                : bill,
            ),
          }));
        },
        removeAttachment: (billId, attachmentId) => {
          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === billId
                ? {
                    ...bill,
                    attachments: bill.attachments.filter((attachment) => attachment.id !== attachmentId),
                    updatedAt: dayjs().toISOString(),
                  }
                : bill,
            ),
          }));
        },
        setReminders: (billId, reminders) => {
          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === billId
                ? {
                    ...bill,
                    remindSettings: reminders,
                    updatedAt: dayjs().toISOString(),
                  }
                : bill,
            ),
          }));

          const updated = get().bills.find((bill) => bill.id === billId);

          if (updated) {
            scheduleRemindersIfEnabled(updated);
          }
        },
        refreshNotifications: async () => {
          const bills = get().bills;

          if (!useSettingsStore.getState().notificationsEnabled) {
            return;
          }

          await Promise.all(bills.map((bill) => notificationService.scheduleBillReminders(bill).catch(() => undefined)));
        },
        metrics: () => {
          const bills = get().bills;

          const currentMonthStart = dayjs().startOf('month');
          const currentMonthEnd = dayjs().endOf('month');
          const previousMonthStart = dayjs().subtract(1, 'month').startOf('month');
          const previousMonthEnd = dayjs().subtract(1, 'month').endOf('month');

          const currentMonthTotal = bills
            .filter((bill) => dayjs(bill.dueDate).isBetween(currentMonthStart, currentMonthEnd, 'day', '[]'))
            .reduce((sum, bill) => sum + bill.amount, 0);

          const previousMonthTotal = bills
            .filter((bill) =>
              dayjs(bill.dueDate).isBetween(previousMonthStart, previousMonthEnd, 'day', '[]'),
            )
            .reduce((sum, bill) => sum + bill.amount, 0);

          const overdueCount = bills.filter((bill) => bill.status === 'overdue').length;
          const upcomingWeekCount = bills.filter((bill) =>
            dayjs(bill.dueDate).isBefore(dayjs().add(7, 'day')),
          ).length;

          const categoryTotals = bills.reduce<Record<string, number>>((acc, bill) => {
            acc[bill.category] = (acc[bill.category] ?? 0) + bill.amount;
            return acc;
          }, {});

          const topCategories = Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category: category as Bill['category'], amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

          return { currentMonthTotal, previousMonthTotal, overdueCount, upcomingWeekCount, topCategories };
        },
        upcomingBills: () =>
          get()
            .bills.filter((bill) => bill.status === 'scheduled')
            .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
        overdueBills: () =>
          get()
            .bills.filter((bill) => bill.status === 'overdue')
            .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
        paidBills: () =>
          get()
            .bills.filter((bill) => bill.status === 'paid')
            .sort((a, b) => dayjs(b.paidAt ?? 0).valueOf() - dayjs(a.paidAt ?? 0).valueOf()),
      }),
      {
        name: 'fakturavakt:bills',
        storage: createJSONStorage(() => zustandStorage),
        version: 1,
        partialize: (state) => ({ bills: state.bills }),
        merge: (persisted, current) => ({
          ...current,
          ...persisted,
        }),
      },
    ),
  ),
);
