import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import type {
  MedicalAppointment,
  MedicalAppointmentInput,
  VabEntry,
  VabEntryInput,
} from '../types';
import { notificationService } from '../services/notificationService';
import { zustandStorage } from '../services/storage';
import { useSettingsStore } from './settingsStore';

const DEFAULT_VAB_REMINDER_OFFSETS = [1, 3, 7];
const DEFAULT_APPOINTMENT_REMINDER_OFFSETS = [7, 1];

const scheduleVabReminders = (entry: VabEntry) => {
  if (!useSettingsStore.getState().notificationsEnabled) {
    return;
  }

  notificationService.scheduleVabFollowUps(entry).catch(() => undefined);
};

const scheduleAppointmentReminders = (appointment: MedicalAppointment) => {
  if (!useSettingsStore.getState().notificationsEnabled) {
    return;
  }

  notificationService.scheduleMedicalAppointmentReminders(appointment).catch(() => undefined);
};

const buildVabEntry = (input: VabEntryInput): VabEntry => {
  const now = dayjs().toISOString();
  const startDate = dayjs(input.startDate).toISOString();
  const endDateCandidate = dayjs(input.endDate);
  const endDate = endDateCandidate.isAfter(startDate)
    ? endDateCandidate.toISOString()
    : dayjs(startDate).toISOString();

  return {
    id: uuidv4(),
    childName: input.childName.trim(),
    startDate,
    endDate,
    notes: input.notes?.trim() || undefined,
    reminderOffsets: (input.reminderOffsets?.length ? input.reminderOffsets : DEFAULT_VAB_REMINDER_OFFSETS).sort(
      (a, b) => a - b,
    ),
    createdAt: now,
    updatedAt: now,
  };
};

const buildMedicalAppointment = (input: MedicalAppointmentInput): MedicalAppointment => {
  const now = dayjs().toISOString();

  return {
    id: uuidv4(),
    title: input.title.trim(),
    personName: input.personName?.trim() || undefined,
    date: dayjs(input.date).toISOString(),
    location: input.location?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    reminderOffsets: (input.reminderOffsets?.length
      ? input.reminderOffsets
      : DEFAULT_APPOINTMENT_REMINDER_OFFSETS
    ).sort((a, b) => a - b),
    createdAt: now,
    updatedAt: now,
  };
};

export interface FamilyState {
  vabEntries: VabEntry[];
  appointments: MedicalAppointment[];
  addVabEntry: (input: VabEntryInput) => VabEntry;
  updateVabEntry: (id: string, updates: Partial<VabEntryInput>) => VabEntry | undefined;
  removeVabEntry: (id: string) => void;
  addAppointment: (input: MedicalAppointmentInput) => MedicalAppointment;
  updateAppointment: (id: string, updates: Partial<MedicalAppointmentInput>) => MedicalAppointment | undefined;
  removeAppointment: (id: string) => void;
  refreshReminders: () => Promise<void>;
}

export const useFamilyStore = create<FamilyState>()(
  devtools(
    persist(
      (set, get) => ({
        vabEntries: [],
        appointments: [],
        addVabEntry: (input) => {
          const entry = buildVabEntry(input);

          set((state) => ({
            vabEntries: [entry, ...state.vabEntries],
          }));

          scheduleVabReminders(entry);

          return entry;
        },
        updateVabEntry: (id, updates) => {
          let updatedEntry: VabEntry | undefined;

          set((state) => {
            const entries = state.vabEntries.map((entry) => {
              if (entry.id !== id) {
                return entry;
              }

              updatedEntry = {
                ...entry,
                childName: updates.childName !== undefined ? updates.childName.trim() : entry.childName,
                startDate: updates.startDate ? dayjs(updates.startDate).toISOString() : entry.startDate,
                endDate: updates.endDate
                  ? dayjs(updates.endDate).isAfter(updates.startDate ?? entry.startDate)
                    ? dayjs(updates.endDate).toISOString()
                    : entry.endDate
                  : entry.endDate,
                notes: updates.notes !== undefined ? updates.notes?.trim() || undefined : entry.notes,
                reminderOffsets:
                  updates.reminderOffsets && updates.reminderOffsets.length
                    ? [...updates.reminderOffsets].sort((a, b) => a - b)
                    : entry.reminderOffsets,
                updatedAt: dayjs().toISOString(),
              };

              return updatedEntry;
            });

            return { vabEntries: entries };
          });

          if (updatedEntry) {
            scheduleVabReminders(updatedEntry);
          }

          return updatedEntry;
        },
        removeVabEntry: (id) => {
          set((state) => ({
            vabEntries: state.vabEntries.filter((entry) => entry.id !== id),
          }));

          notificationService.cancelVabFollowUps(id).catch(() => undefined);
        },
        addAppointment: (input) => {
          const appointment = buildMedicalAppointment(input);

          set((state) => ({
            appointments: [appointment, ...state.appointments],
          }));

          scheduleAppointmentReminders(appointment);

          return appointment;
        },
        updateAppointment: (id, updates) => {
          let updatedAppointment: MedicalAppointment | undefined;

          set((state) => {
            const appointments = state.appointments.map((appointment) => {
              if (appointment.id !== id) {
                return appointment;
              }

              updatedAppointment = {
                ...appointment,
                title: updates.title !== undefined ? updates.title.trim() : appointment.title,
                personName:
                  updates.personName !== undefined ? updates.personName?.trim() || undefined : appointment.personName,
                date: updates.date ? dayjs(updates.date).toISOString() : appointment.date,
                location: updates.location !== undefined ? updates.location?.trim() || undefined : appointment.location,
                notes: updates.notes !== undefined ? updates.notes?.trim() || undefined : appointment.notes,
                reminderOffsets:
                  updates.reminderOffsets && updates.reminderOffsets.length
                    ? [...updates.reminderOffsets].sort((a, b) => a - b)
                    : appointment.reminderOffsets,
                updatedAt: dayjs().toISOString(),
              };

              return updatedAppointment;
            });

            return { appointments };
          });

          if (updatedAppointment) {
            scheduleAppointmentReminders(updatedAppointment);
          }

          return updatedAppointment;
        },
        removeAppointment: (id) => {
          set((state) => ({
            appointments: state.appointments.filter((appointment) => appointment.id !== id),
          }));

          notificationService.cancelMedicalAppointmentReminders(id).catch(() => undefined);
        },
        refreshReminders: async () => {
          if (!useSettingsStore.getState().notificationsEnabled) {
            return;
          }

          const { vabEntries, appointments } = get();

          await Promise.all([
            ...vabEntries.map((entry) => notificationService.scheduleVabFollowUps(entry).catch(() => undefined)),
            ...appointments.map((appointment) =>
              notificationService.scheduleMedicalAppointmentReminders(appointment).catch(() => undefined),
            ),
          ]);
        },
      }),
      {
        name: 'fakturavakt:family',
        storage: createJSONStorage(() => zustandStorage),
        version: 1,
        partialize: (state) => ({
          vabEntries: state.vabEntries,
          appointments: state.appointments,
        }),
      },
    ),
  ),
);
