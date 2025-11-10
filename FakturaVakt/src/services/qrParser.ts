import dayjs from 'dayjs';
import type { BillInput } from '../types';
import { DEFAULT_CURRENCY, DEFAULT_REMINDER_OFFSETS } from '../utils/constants';

interface ParsedQrResult {
  data: Partial<BillInput>;
  rawFields: Record<string, string>;
}

const parseLineBasedFormat = (payload: string) => {
  const lines = payload.split(/\r?\n/);

  return lines.reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();

    if (key && value) {
      acc[key.trim().toUpperCase()] = value;
    }

    return acc;
  }, {});
};

const normaliseAmount = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const normalised = value.replace(',', '.').replace(/\s/g, '');
  const parsed = Number.parseFloat(normalised);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const normaliseDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (value.includes('-')) {
    return dayjs(value).isValid() ? dayjs(value).toISOString() : undefined;
  }

  if (value.length === 8) {
    return dayjs(value, 'YYYYMMDD').isValid()
      ? dayjs(value, 'YYYYMMDD').toISOString()
      : undefined;
  }

  return undefined;
};

export const parseSwedishInvoiceQr = (payload: string): ParsedQrResult | null => {
  const rawFields = parseLineBasedFormat(payload);

  if (Object.keys(rawFields).length === 0) {
    return null;
  }

  const amount =
    normaliseAmount(rawFields.AM) ??
    normaliseAmount(rawFields.AMOUNT) ??
    normaliseAmount(rawFields.BETBEL);

  const dueDate =
    normaliseDate(rawFields.DT) ??
    normaliseDate(rawFields.DUE) ??
    normaliseDate(rawFields.FORDFDAT);

  const providerName =
    rawFields.RN || rawFields.NAME || rawFields.KUND || rawFields.CNAM || undefined;

  const referenceNumber =
    rawFields.RF || rawFields.RR || rawFields.OCR || rawFields.KID || undefined;

  const contactEmail = rawFields.EMAIL ?? rawFields.MAIL;
  const contactPhone = rawFields.TEL ?? rawFields.PHON;
  const website = rawFields.URL ?? rawFields.WEB;

  const data: Partial<BillInput> = {
    serviceName: providerName,
    amount: amount ?? 0,
    currency: rawFields.CC ?? DEFAULT_CURRENCY,
    dueDate: dueDate ?? dayjs().add(14, 'day').toISOString(),
    referenceNumber,
    remindSettings: DEFAULT_REMINDER_OFFSETS.map((offset) => ({
      id: `${offset}`,
      offsetDays: offset,
    })),
    providerContact: contactEmail || contactPhone || website
      ? {
          email: contactEmail,
          phone: contactPhone,
          website,
        }
      : undefined,
  };

  return {
    data,
    rawFields,
  };
};
