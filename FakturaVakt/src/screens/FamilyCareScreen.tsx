import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { useFamilyStore } from '../store';
import { useTheme } from '../theme';
import { formatDate } from '../utils/dates';

type VabFormValues = {
  childName: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

type AppointmentFormValues = {
  title: string;
  personName?: string;
  date: string;
  location?: string;
  notes?: string;
};

interface VabFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: VabFormValues) => void;
}

const VabFormModal: React.FC<VabFormModalProps> = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [childName, setChildName] = useState('');
  const [startDate, setStartDate] = useState(dayjs().toISOString());
  const [endDate, setEndDate] = useState(dayjs().toISOString());
  const [notes, setNotes] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  React.useEffect(() => {
    if (visible) {
      const initialDate = dayjs().toISOString();
      setChildName('');
      setStartDate(initialDate);
      setEndDate(initialDate);
      setNotes('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!childName.trim()) {
      Alert.alert(t('validation.required'), t('screens.family.validation.childName'));
      return;
    }

    onSubmit({
      childName: childName.trim(),
      startDate,
      endDate: dayjs(endDate).isAfter(startDate) ? endDate : startDate,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  };

  const onPickStart = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selected) {
      const iso = selected.toISOString();
      setStartDate(iso);
      if (dayjs(endDate).isBefore(iso)) {
        setEndDate(iso);
      }
    }
  };

  const onPickEnd = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selected) {
      const iso = selected.toISOString();
      setEndDate(dayjs(iso).isAfter(startDate) ? iso : startDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('screens.family.addVabTitle')}</Text>

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.childName')}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: theme.colors.divider, color: theme.colors.text }]}
            value={childName}
            onChangeText={setChildName}
            placeholder={t('screens.family.childNamePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.startDate')}</Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={[styles.dateButton, { borderColor: theme.colors.divider }]}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.endDate')}</Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={[styles.dateButton, { borderColor: theme.colors.divider }]}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>{formatDate(endDate)}</Text>
          </TouchableOpacity>

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('common.notes')}</Text>
          <TextInput
            style={[
              styles.modalInput,
              styles.modalTextarea,
              { borderColor: theme.colors.divider, color: theme.colors.text },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('screens.family.notesPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.modalButtonGhost]}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={dayjs(startDate).toDate()}
          mode="date"
          onChange={onPickStart}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={dayjs(endDate).toDate()}
          mode="date"
          minimumDate={dayjs(startDate).toDate()}
          onChange={onPickEnd}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />
      )}
    </Modal>
  );
};

interface AppointmentFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: AppointmentFormValues) => void;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [personName, setPersonName] = useState('');
  const [date, setDate] = useState(
    dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
  );
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setTitle('');
      setPersonName('');
      setDate(dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString());
      setLocation('');
      setNotes('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('validation.required'), t('screens.family.validation.title'));
      return;
    }

    onSubmit({
      title: title.trim(),
      personName: personName.trim() ? personName.trim() : undefined,
      date,
      location: location.trim() ? location.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  };

  const onPickDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selected) {
      setDate(selected.toISOString());
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('screens.family.addAppointmentTitle')}</Text>

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.appointmentTitle')}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: theme.colors.divider, color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder={t('screens.family.appointmentTitlePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.personName')}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: theme.colors.divider, color: theme.colors.text }]}
            value={personName}
            onChangeText={setPersonName}
            placeholder={t('screens.family.personNamePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.date')}</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, { borderColor: theme.colors.divider }]}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>{dayjs(date).format('YYYY-MM-DD HH:mm')}</Text>
          </TouchableOpacity>

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('screens.family.location')}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: theme.colors.divider, color: theme.colors.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder={t('screens.family.locationPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('common.notes')}</Text>
          <TextInput
            style={[
              styles.modalInput,
              styles.modalTextarea,
              { borderColor: theme.colors.divider, color: theme.colors.text },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('screens.family.notesPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.modalButtonGhost]}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dayjs(date).toDate()}
          mode="datetime"
          onChange={onPickDate}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />
      )}
    </Modal>
  );
};

const FamilyCareScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { vabEntries, appointments, addVabEntry, removeVabEntry, addAppointment, removeAppointment } =
    useFamilyStore();
  const [vabModalVisible, setVabModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);

  const sortedVabEntries = useMemo(
    () => [...vabEntries].sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()),
    [vabEntries],
  );
  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    [appointments],
  );

  const openCreateVab = () => {
    setVabModalVisible(true);
  };

  const openCreateAppointment = () => {
    setAppointmentModalVisible(true);
  };

  const handleSaveVab = (values: VabFormValues) => {
    addVabEntry(values);
    setVabModalVisible(false);
  };

  const handleSaveAppointment = (values: AppointmentFormValues) => {
    addAppointment(values);
    setAppointmentModalVisible(false);
  };

  const confirmDeleteVab = (id: string) => {
    Alert.alert(t('screens.family.removeVabTitle'), t('screens.family.removeVabMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeVabEntry(id),
      },
    ]);
  };

  const confirmDeleteAppointment = (id: string) => {
    Alert.alert(t('screens.family.removeAppointmentTitle'), t('screens.family.removeAppointmentMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeAppointment(id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('screens.family.title')}</Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader
            title={t('screens.family.vabSectionTitle')}
            icon="medkit-outline"
            actionLabel={t('screens.family.addVabEntry')}
            onPressAction={openCreateVab}
          />

          {sortedVabEntries.length === 0 ? (
            <EmptyState
              icon="calendar-clear-outline"
              title={t('screens.family.vabEmptyTitle')}
              description={t('screens.family.vabEmptyDescription')}
            />
          ) : (
            sortedVabEntries.map((entry) => {
              const period =
                formatDate(entry.startDate) === formatDate(entry.endDate)
                  ? formatDate(entry.startDate)
                  : `${formatDate(entry.startDate)} → ${formatDate(entry.endDate)}`;

              const nextReminder = entry.reminderOffsets
                .map((offset) => dayjs(entry.endDate).add(offset, 'day'))
                .find((date) => date.isAfter(dayjs()));

              return (
                <View key={entry.id} style={[styles.itemContainer, { borderColor: theme.colors.divider }]}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{entry.childName}</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => confirmDeleteVab(entry.id)} style={styles.actionIcon}>
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                    {t('screens.family.vabPeriod', { period })}
                  </Text>
                  {entry.notes ? (
                    <Text style={[styles.itemNotes, { color: theme.colors.textSecondary }]}>{entry.notes}</Text>
                  ) : null}
                  {nextReminder ? (
                    <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                      {t('screens.family.nextReminder', { date: formatDate(nextReminder.toISOString()) })}
                    </Text>
                  ) : (
                    <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                      {t('screens.family.remindersComplete')}
                    </Text>
                  )}
                </View>
              );
            })
          )}

          <TouchableOpacity onPress={openCreateVab} style={[styles.secondaryButton, { borderColor: theme.colors.divider }]}>
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} style={styles.secondaryButtonIcon} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
              {t('screens.family.addVabEntry')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader
            title={t('screens.family.appointmentsSectionTitle')}
            icon="heart-outline"
            actionLabel={t('screens.family.addAppointment')}
            onPressAction={openCreateAppointment}
          />

          {sortedAppointments.length === 0 ? (
            <EmptyState
              icon="medkit-outline"
              title={t('screens.family.appointmentsEmptyTitle')}
              description={t('screens.family.appointmentsEmptyDescription')}
            />
          ) : (
            sortedAppointments.map((appointment) => (
              <View key={appointment.id} style={[styles.itemContainer, { borderColor: theme.colors.divider }]}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{appointment.title}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => confirmDeleteAppointment(appointment.id)}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                {appointment.personName ? (
                  <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                    {t('screens.family.personLabel', { name: appointment.personName })}
                  </Text>
                ) : null}
                <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                  {dayjs(appointment.date).format('YYYY-MM-DD HH:mm')}
                </Text>
                {appointment.location ? (
                  <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                    {t('screens.family.locationLabel', { location: appointment.location })}
                  </Text>
                ) : null}
                {appointment.notes ? (
                  <Text style={[styles.itemNotes, { color: theme.colors.textSecondary }]}>{appointment.notes}</Text>
                ) : null}
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={openCreateAppointment}
            style={[styles.secondaryButton, { borderColor: theme.colors.divider }]}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={theme.colors.primary}
              style={styles.secondaryButtonIcon}
            />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
              {t('screens.family.addAppointment')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VabFormModal visible={vabModalVisible} onClose={() => setVabModalVisible(false)} onSubmit={handleSaveVab} />
      <AppointmentFormModal
        visible={appointmentModalVisible}
        onClose={() => setAppointmentModalVisible(false)}
        onSubmit={handleSaveAppointment}
      />
    </View>
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
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  itemContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 6,
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalTextarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  modalButtonGhost: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
  dateButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 15,
  },
});

export default FamilyCareScreen;
