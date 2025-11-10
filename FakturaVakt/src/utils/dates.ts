import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import type { TFunction } from 'i18next';
import type { Bill, BillFrequency } from '../types';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
});

export const formatDate = (isoDate: string, format = 'YYYY-MM-DD') => dayjs(isoDate).format(format);

export const formatMonthLabel = (isoDate: string) => dayjs(isoDate).format('MMMM YYYY');

export const isOverdue = (bill: Bill, referenceDate = dayjs()) => {
  if (bill.status === 'paid' || bill.status === 'paused') {
    return false;
  }

  return dayjs(bill.dueDate).isBefore(referenceDate, 'day');
};

export const daysUntilDue = (bill: Bill, referenceDate = dayjs()) =>
  dayjs(bill.dueDate).startOf('day').diff(referenceDate.startOf('day'), 'day');

export const getNextOccurrence = (bill: Bill): string | undefined => {
  const { dueDate, frequency } = bill;
  const baseDate = dayjs(dueDate);

  if (frequency === 'once') {
    return undefined;
  }

  const incrementMap: Record<BillFrequency, dayjs.ManipulateType> = {
    once: 'month',
    weekly: 'week',
    biweekly: 'week',
    monthly: 'month',
    bimonthly: 'month',
    quarterly: 'month',
    semiannually: 'month',
    annually: 'year',
    custom: 'month',
  };

  const amountMap: Record<BillFrequency, number> = {
    once: 0,
    weekly: 1,
    biweekly: 2,
    monthly: 1,
    bimonthly: 2,
    quarterly: 3,
    semiannually: 6,
    annually: 12,
    custom: 1,
  };

  const unit = incrementMap[frequency];
  const amount = amountMap[frequency];

  return baseDate.add(amount, unit).toISOString();
};

export const monthKey = (isoDate: string) => dayjs(isoDate).format('YYYY-MM');

export const calculateBillStatus = (bill: Bill, referenceDate = dayjs()): Bill['status'] => {
  if (bill.status === 'paused') {
    return 'paused';
  }

  if (bill.status === 'paid' || bill.paidAt) {
    return 'paid';
  }

  if (isOverdue(bill, referenceDate)) {
    return 'overdue';
  }

  return 'scheduled';
};

export const beginningOfMonth = (date = dayjs()) => date.startOf('month').toISOString();

export const endOfMonth = (date = dayjs()) => date.endOf('month').toISOString();

export const currentMonthKey = () => monthKey(dayjs().toISOString());

export const previousMonthKey = () => monthKey(dayjs().subtract(1, 'month').toISOString());

export const displayRelativeDue = (bill: Bill, t?: TFunction) => {
  const diff = daysUntilDue(bill);

  if (diff === 0) {
    return t ? t('common.due.today') : 'Due today';
  }

  if (diff > 0) {
    return t ? t('common.due.inDays', { count: diff }) : `Due in ${diff} day${diff === 1 ? '' : 's'}`;
  }

  const overdueBy = Math.abs(diff);
  return t
    ? t('common.due.overdue', { count: overdueBy })
    : `Overdue by ${overdueBy} day${overdueBy === 1 ? '' : 's'}`;
};
