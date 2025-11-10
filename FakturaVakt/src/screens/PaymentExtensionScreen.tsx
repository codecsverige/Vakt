import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { formatCurrency } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentExtension'>;

type Template = {
  language: 'sv' | 'ar' | 'en';
  title: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  callScript: string;
};

const buildTemplates = (params: {
  serviceName: string;
  dueDate: string;
  amount: number;
  currency: string;
  referenceNumber?: string;
}) => {
  const { serviceName, dueDate, amount, currency, referenceNumber } = params;
  const formattedDate = dayjs(dueDate).format('YYYY-MM-DD');
  const formattedAmount = formatCurrency(amount, currency);

  const templates: Template[] = [
    {
      language: 'sv',
      title: 'Svenska',
      subject: `Begäran om uppskov för faktura ${referenceNumber ?? ''}`.trim(),
      emailBody: `Hej ${serviceName},

Jag vill gärna be om uppskov för fakturan som förfaller ${formattedDate} på ${formattedAmount}${
        referenceNumber ? ` (referens: ${referenceNumber})` : ''
      }.

Jag behöver ett par extra dagar för att slutföra betalningen och föreslår det nya betalningsdatumet ${
        dayjs(dueDate).add(7, 'day').format('YYYY-MM-DD')
      }.

Tack för er förståelse och vänligen bekräfta om detta är möjligt.

Med vänliga hälsningar,`,
      smsBody: `Hej ${serviceName}, kan jag få uppskov till ${dayjs(dueDate).add(7, 'day').format(
        'YYYY-MM-DD',
      )} för fakturan ${referenceNumber ?? ''}?`,
      callScript: `Hej, mitt namn är _______. Jag ringer angående fakturan som förfaller ${formattedDate} för ${formattedAmount}. Skulle det vara möjligt att få uppskov till ${dayjs(dueDate)
        .add(7, 'day')
        .format('YYYY-MM-DD')}?`,
    },
    {
      language: 'ar',
      title: 'العربية',
      subject: `طلب تأجيل دفع الفاتورة ${referenceNumber ?? ''}`.trim(),
      emailBody: `مرحباً ${serviceName}،

أود طلب تأجيل دفع الفاتورة المستحقة بتاريخ ${formattedDate} بمبلغ ${formattedAmount}${
        referenceNumber ? ` (المرجع: ${referenceNumber})` : ''
      }.

أحتاج إلى بضعة أيام إضافية لإكمال الدفع وأقترح تاريخ ${dayjs(dueDate).add(7, 'day').format(
        'YYYY-MM-DD',
      )} كتاريخ جديد للسداد.

شكراً لتفهمكم، وأرجو تأكيد إمكانية ذلك.

مع أطيب التحيات،`,
      smsBody: `مرحبا ${serviceName}، هل يمكن تأجيل فاتورة ${referenceNumber ?? ''} حتى ${dayjs(dueDate)
        .add(7, 'day')
        .format('YYYY-MM-DD')}؟`,
      callScript: `مرحباً، اسمي _______. أتواصل بخصوص الفاتورة المستحقة في ${formattedDate} بمبلغ ${formattedAmount}. هل من الممكن تأجيلها إلى ${dayjs(dueDate)
        .add(7, 'day')
        .format('YYYY-MM-DD')}؟`,
    },
    {
      language: 'en',
      title: 'English',
      subject: `Request to postpone invoice ${referenceNumber ?? ''}`.trim(),
      emailBody: `Hello ${serviceName},

I would like to request a short extension for the invoice due on ${formattedDate} for ${formattedAmount}${
        referenceNumber ? ` (reference: ${referenceNumber})` : ''
      }.

I expect to complete the payment within the next few days and propose ${dayjs(dueDate).add(7, 'day').format(
        'YYYY-MM-DD',
      )} as the new payment date.

Thank you for your understanding. Please let me know if this is acceptable.

Best regards,`,
      smsBody: `Hello ${serviceName}, could I postpone invoice ${referenceNumber ?? ''} until ${dayjs(dueDate)
        .add(7, 'day')
        .format('YYYY-MM-DD')}?`,
      callScript: `Hi, my name is _______. I'm calling about the invoice due on ${formattedDate} for ${formattedAmount}. Could we move the payment date to ${dayjs(dueDate)
        .add(7, 'day')
        .format('YYYY-MM-DD')}?`,
    },
  ];

  return templates;
};

const PaymentExtensionScreen: React.FC<Props> = ({ route }) => {
  const { billId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const bill = useBillStore((state) => state.bills.find((entry) => entry.id === billId));
  const [language, setLanguage] = useState<'sv' | 'ar' | 'en'>('sv');
  const primaryTextColor = React.useMemo(() => ({ color: theme.colors.text }), [theme.colors.text]);
  const secondaryTextColor = React.useMemo(
    () => ({ color: theme.colors.textSecondary }),
    [theme.colors.textSecondary],
  );

  const languageLabels: Record<'sv' | 'ar' | 'en', string> = {
    sv: 'Svenska',
    ar: 'العربية',
    en: 'English',
  };

  const template = useMemo(() => {
    if (!bill) {
      return null;
    }

    const [selected] = buildTemplates({
      serviceName: bill.serviceName,
      dueDate: bill.dueDate,
      amount: bill.amount,
      currency: bill.currency,
      referenceNumber: bill.referenceNumber,
    }).filter((item) => item.language === language);

    return selected;
  }, [bill, language]);

  if (!bill || !template) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
          <Text style={primaryTextColor}>{t('screens.archive.empty')}</Text>
      </View>
    );
  }

  const copyToClipboard = (content: string) => {
    Clipboard.setString(content);
    Alert.alert(t('screens.assistant.copy'), t('screens.assistant.copied'));
  };

  const providerContact = bill.providerContact;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
        <Text style={[styles.title, primaryTextColor]}>{t('screens.assistant.title')}</Text>
        <Text style={[styles.subtitle, secondaryTextColor, styles.marginBottomLarge]}>
        {t('screens.assistant.description')}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.languageRow}>
            {(['sv', 'ar', 'en'] as const).map((code) => (
              <TouchableOpacity
                key={code}
                onPress={() => setLanguage(code)}
                style={[
                  styles.languageChip,
                  {
                    backgroundColor: language === code ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: language === code ? theme.colors.primary : theme.colors.divider,
                  },
                ]}
              >
              <Text
                style={[
                  styles.languageChipText,
                  language === code ? styles.languageChipTextActive : primaryTextColor,
                ]}
              >
                {languageLabels[code]}
              </Text>
              </TouchableOpacity>
            ))}
          </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, primaryTextColor]}>{t('screens.assistant.channelEmail')}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(`${template.subject}\n\n${template.emailBody}`)}>
            <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.label, secondaryTextColor]}>{t('screens.assistant.subject')}</Text>
        <Text style={[styles.body, primaryTextColor]}>{template.subject}</Text>
        <Text style={[styles.label, secondaryTextColor, styles.marginTopMedium]}>
          {t('screens.assistant.message')}
        </Text>
        <Text style={[styles.body, primaryTextColor]}>{template.emailBody}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, primaryTextColor]}>{t('screens.assistant.channelSms')}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(template.smsBody)}>
            <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.body, primaryTextColor]}>{template.smsBody}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, primaryTextColor]}>{t('screens.assistant.channelPhone')}</Text>
        <Text style={[styles.body, primaryTextColor]}>
          {template.callScript}
        </Text>
      </View>

      {providerContact && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, primaryTextColor]}>{t('screens.assistant.providerContact')}</Text>
          {providerContact.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary} style={styles.contactIcon} />
              <Text style={primaryTextColor}>{providerContact.email}</Text>
            </View>
          )}
          {providerContact.phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={18} color={theme.colors.textSecondary} style={styles.contactIcon} />
              <Text style={primaryTextColor}>{providerContact.phone}</Text>
            </View>
          )}
          {providerContact.website && (
            <View style={styles.contactRow}>
              <Ionicons name="globe-outline" size={18} color={theme.colors.textSecondary} style={styles.contactIcon} />
              <Text style={primaryTextColor}>{providerContact.website}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  body: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  marginBottomLarge: {
    marginBottom: 16,
  },
  languageRow: {
    flexDirection: 'row',
  },
  languageChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  languageChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageChipTextActive: {
    color: '#fff',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  marginTopMedium: {
    marginTop: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentExtensionScreen;
