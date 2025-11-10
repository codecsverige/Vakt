import type { BillCategory, BillFrequency } from '../types';

export const formatCurrency = (value: number, currency = 'SEK', locale: string = 'sv-SE') =>
  Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export const categoryIcon: Record<BillCategory, string> = {
  housing: 'home',
  utilities: 'flash',
  internet: 'wifi',
  insurance: 'shield',
  transport: 'car',
  streaming: 'film',
  health: 'heart',
  other: 'list',
};

export const frequencyLabel = (frequency: BillFrequency, t: (key: string) => string) =>
  t(`frequency.${frequency}`);
