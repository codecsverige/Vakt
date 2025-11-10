import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import AttachmentList from '../components/AttachmentList';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import type { Bill, BillFrequency, BillInput } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { DEFAULT_CURRENCY, DEFAULT_REMINDER_OFFSETS } from '../utils/constants';
import { formatDate } from '../utils/dates';
import {
  captureImageAttachment,
  chooseImageAttachment,
  pickDocumentAttachment,
  removeAttachmentFromDisk,
} from '../services/attachmentService';

type Props = NativeStackScreenProps<RootStackParamList, 'BillForm'>;

type FormValues = {
  serviceName: string;
  amount: string;
  currency: string;
  dueDate: string;
  frequency: BillFrequency;
  category: Bill['category'];
  reminderOffsets: number[];
  notes?: string;
  referenceNumber?: string;
  providerEmail?: string;
  providerPhone?: string;
  providerWebsite?: string;
  isAutoPay: boolean;
};

const frequencies: BillFrequency[] = [
  'once',
  'monthly',
  'quarterly',
  'semiannually',
  'annually',
  'weekly',
  'biweekly',
  'bimonthly',
];

const categories: Bill['category'][] = [
  'housing',
  'utilities',
  'internet',
  'insurance',
  'transport',
  'streaming',
  'health',
  'other',
];

const schema: yup.ObjectSchema<FormValues> = yup.object({
  serviceName: yup.string().required(),
  amount: yup
    .string()
    .required()
    .test('positive', 'Amount must be positive', (value) => {
      const num = Number.parseFloat(value ?? '');
      return Number.isFinite(num) && num > 0;
    }),
  currency: yup.string().required(),
  dueDate: yup.string().required(),
  frequency: yup.string().oneOf(frequencies).required() as yup.SchemaOf<BillFrequency>,
  category: yup.string().oneOf(categories).required() as yup.SchemaOf<Bill['category']>,
  reminderOffsets: yup.array().of(yup.number().required()).min(1).required(),
  notes: yup.string().optional(),
  referenceNumber: yup.string().optional(),
  providerEmail: yup.string().email().optional(),
  providerPhone: yup.string().optional(),
  providerWebsite: yup.string().optional(),
  isAutoPay: yup.boolean().required(),
});

const BillFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { billId, prefill } = route.params ?? {};
  const { t } = useTranslation();
  const { theme } = useTheme();
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const addAttachmentToBill = useBillStore((state) => state.addAttachment);
  const removeAttachmentFromBill = useBillStore((state) => state.removeAttachment);
  const bills = useBillStore((state) => state.bills);
  const existingBill = bills.find((bill) => bill.id === billId);
  const primaryTextColor = React.useMemo(() => ({ color: theme.colors.text }), [theme.colors.text]);
  const secondaryTextColor = React.useMemo(
    () => ({ color: theme.colors.textSecondary }),
    [theme.colors.textSecondary],
  );

  const defaultValues: FormValues = useMemo(() => {
    if (existingBill) {
      return {
        serviceName: existingBill.serviceName,
        amount: existingBill.amount.toString(),
        currency: existingBill.currency,
        dueDate: existingBill.dueDate,
        frequency: existingBill.frequency,
        category: existingBill.category,
        reminderOffsets: existingBill.remindSettings.map((reminder) => reminder.offsetDays),
        notes: existingBill.notes,
        referenceNumber: existingBill.referenceNumber,
        providerEmail: existingBill.providerContact?.email,
        providerPhone: existingBill.providerContact?.phone,
        providerWebsite: existingBill.providerContact?.website,
        isAutoPay: existingBill.isAutoPay ?? false,
      };
    }

    return {
      serviceName: prefill?.serviceName ?? '',
      amount: prefill?.amount ? String(prefill.amount) : '',
      currency: prefill?.currency ?? DEFAULT_CURRENCY,
      dueDate: prefill?.dueDate ?? dayjs().add(7, 'day').toISOString(),
      frequency: prefill?.frequency ?? 'monthly',
      category: prefill?.category ?? 'utilities',
      reminderOffsets: prefill?.remindSettings?.map((item) => item.offsetDays) ?? DEFAULT_REMINDER_OFFSETS,
      notes: prefill?.notes ?? '',
      referenceNumber: prefill?.referenceNumber ?? '',
      providerEmail: prefill?.providerContact?.email,
      providerPhone: prefill?.providerContact?.phone,
      providerWebsite: prefill?.providerContact?.website,
      isAutoPay: prefill?.isAutoPay ?? false,
    };
  }, [existingBill, prefill]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (prefill) {
      if (prefill.serviceName) setValue('serviceName', prefill.serviceName);
      if (prefill.amount) setValue('amount', String(prefill.amount));
      if (prefill.dueDate) setValue('dueDate', prefill.dueDate);
      if (prefill.referenceNumber) setValue('referenceNumber', prefill.referenceNumber);
      if (prefill.providerContact?.email) setValue('providerEmail', prefill.providerContact.email);
      if (prefill.providerContact?.phone) setValue('providerPhone', prefill.providerContact.phone);
      if (prefill.providerContact?.website) setValue('providerWebsite', prefill.providerContact.website);
    }
  }, [prefill, setValue]);

  const dueDate = watch('dueDate');
  const reminderOffsets = watch('reminderOffsets');

  const onSelectDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setValue('dueDate', date.toISOString(), { shouldValidate: true });
    }
  };

  const onToggleReminder = (offset: number) => {
    const exists = reminderOffsets.includes(offset);
    if (exists) {
      const next = reminderOffsets.filter((value) => value !== offset);
      setValue('reminderOffsets', next.length ? next : DEFAULT_REMINDER_OFFSETS, { shouldValidate: true });
    } else {
      setValue('reminderOffsets', [...reminderOffsets, offset].sort((a, b) => a - b), { shouldValidate: true });
    }
  };

  const mapOffsetsToReminders = (offsets: number[], bill?: Bill): Bill['remindSettings'] => {
    const existing = bill?.remindSettings ?? [];

    return offsets.map((offset) => {
      const match = existing.find((item) => item.offsetDays === offset);
      return match ?? { id: uuidv4(), offsetDays: offset };
    });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: BillInput = {
      serviceName: values.serviceName,
      amount: Number.parseFloat(values.amount),
      currency: values.currency,
      dueDate: values.dueDate,
      frequency: values.frequency,
      category: values.category,
      notes: values.notes,
      referenceNumber: values.referenceNumber,
      remindSettings: mapOffsetsToReminders(values.reminderOffsets, existingBill),
      providerContact:
        values.providerEmail || values.providerPhone || values.providerWebsite
          ? {
              email: values.providerEmail,
              phone: values.providerPhone,
              website: values.providerWebsite,
            }
          : undefined,
      attachments: existingBill?.attachments,
      isAutoPay: values.isAutoPay,
    };

    try {
      if (existingBill) {
        const updatePayload: Partial<Bill> = {
          ...payload,
        };
        await updateBill(existingBill.id, updatePayload);
        Alert.alert(t('screens.billForm.createSuccess'), undefined, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const created = addBill(payload);
        Alert.alert(t('screens.billForm.createSuccess'), undefined, [
          {
            text: t('common.assistant'),
            onPress: () => navigation.navigate('PaymentExtension', { billId: created.id }),
          },
          {
            text: 'OK',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert(t('screens.billForm.createError'), (error as Error).message);
    }
  };

  const addAttachment = async (method: 'camera' | 'gallery' | 'document') => {
    if (!existingBill) {
      Alert.alert('Attachments', 'Please save the bill before adding attachments.');
      return;
    }

    try {
      let attachment = null;
      if (method === 'camera') {
        attachment = await captureImageAttachment(existingBill.id);
      } else if (method === 'gallery') {
        attachment = await chooseImageAttachment(existingBill.id);
      } else if (method === 'document') {
        attachment = await pickDocumentAttachment(existingBill.id);
      }

      if (attachment) {
        addAttachmentToBill(existingBill.id, attachment);
      }
    } catch (error) {
      Alert.alert('Attachments', (error as Error).message);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    if (!existingBill) return;
    const attachment = existingBill.attachments.find((item) => item.id === attachmentId);
    if (!attachment) return;
    removeAttachmentFromBill(existingBill.id, attachmentId);
    await removeAttachmentFromDisk(attachment);
  };

  return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {existingBill ? t('screens.billForm.editTitle') : t('screens.billForm.createTitle')}
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('screens.billForm.serviceName')}</Text>
          <Controller
            control={control}
            name="serviceName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor: theme.colors.divider, color: theme.colors.text }]}
                placeholder={t('screens.billForm.serviceName')}
                placeholderTextColor={theme.colors.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.serviceName && <Text style={styles.error}>{t('validation.required')}</Text>}

          <Text style={[styles.label, { color: theme.colors.text }]}>{t('screens.billForm.amountPlaceholder')}</Text>
          <View style={styles.row}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.inputHalf,
                    { borderColor: theme.colors.divider, color: theme.colors.text },
                  ]}
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.inputSmall,
                    { borderColor: theme.colors.divider, color: theme.colors.text },
                  ]}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          {errors.amount && <Text style={styles.error}>{t('validation.positive')}</Text>}

          <Text style={[styles.label, { color: theme.colors.text }]}>{t('screens.billForm.dueDatePlaceholder')}</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateButton,
              { borderColor: theme.colors.divider, backgroundColor: theme.colors.surfaceElevated },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={theme.colors.textSecondary}
              style={styles.iconSpacing}
            />
            <Text style={[styles.dateText, primaryTextColor]}>{formatDate(dueDate, 'YYYY-MM-DD')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={dayjs(dueDate).toDate()}
              onChange={onSelectDate}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
            />
          )}
        </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, primaryTextColor]}>{t('common.frequency')}</Text>
          <Controller
            control={control}
            name="frequency"
            render={({ field: { value, onChange } }) => (
              <View style={styles.row}>
                {frequencies.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    onPress={() => onChange(frequency)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: value === frequency ? theme.colors.primary : theme.colors.surfaceElevated,
                        borderColor: value === frequency ? theme.colors.primary : theme.colors.divider,
                      },
                    ]}
                  >
                      <Text
                        style={[
                          styles.pillText,
                          value === frequency ? styles.pillTextActive : secondaryTextColor,
                        ]}
                      >
                      {t(`frequency.${frequency}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

            <Text style={[styles.sectionTitle, styles.sectionSpacing, primaryTextColor]}>
            {t('common.category')}
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.row}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => onChange(category)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: value === category ? theme.colors.primary : theme.colors.surfaceElevated,
                        borderColor: value === category ? theme.colors.primary : theme.colors.divider,
                      },
                    ]}
                  >
                      <Text
                        style={[
                          styles.pillText,
                          value === category ? styles.pillTextActive : secondaryTextColor,
                        ]}
                      >
                      {t(`categories.${category}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, primaryTextColor]}>{t('screens.billForm.remindMe')}</Text>
          <View style={styles.row}>
            {reminderOptions.map((option) => {
              const active = reminderOffsets.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => onToggleReminder(option)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceElevated,
                      borderColor: active ? theme.colors.primary : theme.colors.divider,
                    },
                  ]}
                >
                    <Text
                      style={[
                        styles.pillText,
                        active ? styles.pillTextActive : secondaryTextColor,
                      ]}
                    >
                    {t('screens.settings.reminderDays', { count: option })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, primaryTextColor]}>{t('common.notes')}</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  { borderColor: theme.colors.divider, color: theme.colors.text },
                ]}
                placeholder={t('common.notes')}
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

            <Text style={[styles.sectionTitle, styles.sectionSpacing, primaryTextColor]}>
              {t('screens.billForm.referenceNumber')}
            </Text>
          <Controller
            control={control}
            name="referenceNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { borderColor: theme.colors.divider, color: theme.colors.text }]}
                placeholder={t('screens.billForm.referenceNumber')}
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

            <TouchableOpacity
              onPress={() => navigation.navigate('QRScanner', { billId })}
              style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
            >
              <Ionicons
                name="qr-code-outline"
                size={20}
                color={theme.colors.primary}
                style={styles.iconSpacing}
              />
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>{t('screens.billForm.fromQr')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, primaryTextColor]}>{t('common.assistant')}</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.subtitle, secondaryTextColor]}>{t('screens.assistant.description')}</Text>
            <TouchableOpacity
              onPress={() => {
                if (existingBill) {
                  navigation.navigate('PaymentExtension', { billId: existingBill.id });
                } else {
                  Alert.alert(t('common.assistant'), t('screens.billForm.createSuccess'));
                }
              }}
            >
              <Ionicons name="arrow-forward-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.attachments')}</Text>
          {existingBill && (
            <>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
                  onPress={() => addAttachment('camera')}
                >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={styles.iconSpacing}
                />
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  {t('screens.billForm.addAttachment')}
                </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
                  onPress={() => addAttachment('document')}
                >
                <Ionicons
                  name="document-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={styles.iconSpacing}
                />
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  {t('screens.billForm.addAttachment')}
                </Text>
                </TouchableOpacity>
              </View>
              <AttachmentList attachments={existingBill.attachments} onRemove={removeAttachment} />
            </>
          )}
          {!existingBill && (
            <Text style={[styles.subtitle, secondaryTextColor, styles.marginTopSmall]}>
              {t('screens.attachments.empty')}
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, primaryTextColor]}>{t('common.reminders')}</Text>
            <Controller
              control={control}
              name="isAutoPay"
              render={({ field: { value, onChange } }) => (
                <View style={styles.row}>
                  <Text style={[styles.subtitle, secondaryTextColor, styles.iconSpacing]}>{t('common.paid')}</Text>
                  <Switch value={value} onValueChange={onChange} />
                </View>
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonLabel}>
            {existingBill ? t('common.update') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const reminderOptions = [1, 3, 7, 14, 30];

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputHalf: {
    flex: 1,
    marginRight: 12,
  },
  inputSmall: {
    width: 80,
  },
  error: {
    color: '#F35D4F',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  outlineButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 12,
  },
  iconSpacing: {
    marginRight: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  marginTopSmall: {
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  sectionSpacing: {
    marginTop: 16,
  },
});

export default BillFormScreen;
