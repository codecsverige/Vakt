import notifee, {
  AndroidImportance,
  AndroidStyle,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';
import type { Bill, ReminderSetting, MedicalAppointment, VabEntry } from '../types';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dates';
import { NOTIFICATION_CHANNEL_ID } from '../utils/constants';

class NotificationService {
  private ready = false;

  async initialize() {
    if (this.ready) {
      return;
    }

    const settings = await notifee.requestPermission();

    if (!settings.authorizationStatus) {
      // Permissions are optional; silently continue.
      this.ready = false;
      return;
    }

    await notifee.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'FakturaVakt reminders',
      importance: AndroidImportance.HIGH,
      vibration: true,
      lights: true,
      sound: 'default',
    });

    this.ready = true;
  }

  private buildNotificationId(billId: string, reminder: ReminderSetting) {
    return `${billId}-${reminder.offsetDays}`;
  }

  async cancelAllReminders() {
    const notifications = await notifee.getTriggerNotifications();
    const idsToCancel = notifications
      .map((entry) => entry.notification.id)
      .filter((id): id is string => Boolean(id));

    if (idsToCancel.length > 0) {
      await notifee.cancelTriggerNotifications(idsToCancel);
    }
  }

  async cancelRemindersForBill(billId: string) {
    const notifications = await notifee.getTriggerNotifications();

    const idsToCancel = notifications
      .filter((entry) => entry.notification.id?.startsWith(`${billId}-`))
      .map((entry) => entry.notification.id)
      .filter((id): id is string => Boolean(id));

    if (idsToCancel.length > 0) {
      await notifee.cancelTriggerNotifications(idsToCancel);
    }
  }

  async scheduleBillReminders(bill: Bill) {
    if (!this.ready) {
      await this.initialize();
    }

    if (!this.ready) {
      return;
    }

    await this.cancelRemindersForBill(bill.id);

    const baseDate = dayjs(bill.dueDate).hour(9).minute(0).second(0).millisecond(0);

    const schedules = bill.remindSettings
      .map((reminder) => ({
        reminder,
        triggerDate: baseDate.subtract(reminder.offsetDays, 'day'),
      }))
      .filter(({ triggerDate }) => triggerDate.isAfter(dayjs()))
      .sort((a, b) => a.triggerDate.valueOf() - b.triggerDate.valueOf());

    await Promise.all(
      schedules.map(async ({ reminder, triggerDate }) => {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.valueOf(),
          alarmManager: {
            allowWhileIdle: true,
          },
        };

        const id = this.buildNotificationId(bill.id, reminder);

        await notifee.createTriggerNotification(
          {
            id,
            title: `${bill.serviceName}`,
            subtitle: `${bill.currency} ${bill.amount}`,
            body: `Due ${formatDate(bill.dueDate)} (${reminder.offsetDays} days left)`,
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
              style: {
                type: AndroidStyle.BIGTEXT,
                text: `${bill.serviceName} · ${formatCurrency(bill.amount, bill.currency)}\nDue ${formatDate(
                  bill.dueDate,
                )}`,
              },
            },
            ios: {
              sound: 'default',
              categoryId: 'fakturavakt.reminders',
            },
            data: {
              billId: bill.id,
              reminderOffset: reminder.offsetDays.toString(),
            },
          },
          trigger,
        );
      }),
    );
  }

  private buildVabNotificationId(entryId: string, offset: number) {
    return `vab-${entryId}-${offset}`;
  }

  async cancelVabFollowUps(entryId: string) {
    const notifications = await notifee.getTriggerNotifications();

    const idsToCancel = notifications
      .filter((entry) => entry.notification.id?.startsWith(`vab-${entryId}-`))
      .map((entry) => entry.notification.id)
      .filter((id): id is string => Boolean(id));

    if (idsToCancel.length > 0) {
      await notifee.cancelTriggerNotifications(idsToCancel);
    }
  }

  async scheduleVabFollowUps(entry: VabEntry) {
    if (!this.ready) {
      await this.initialize();
    }

    if (!this.ready) {
      return;
    }

    await this.cancelVabFollowUps(entry.id);

    const reminders = entry.reminderOffsets
      .map((offset) => ({
        offset,
        triggerDate: dayjs(entry.endDate).add(offset, 'day').hour(9).minute(0).second(0).millisecond(0),
      }))
      .filter(({ triggerDate }) => triggerDate.isAfter(dayjs()))
      .sort((a, b) => a.triggerDate.valueOf() - b.triggerDate.valueOf());

    await Promise.all(
      reminders.map(async ({ offset, triggerDate }) => {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.valueOf(),
          alarmManager: {
            allowWhileIdle: true,
          },
        };

        const id = this.buildVabNotificationId(entry.id, offset);

        await notifee.createTriggerNotification(
          {
            id,
            title: entry.childName,
            subtitle: 'VAB',
            body: `Don't forget to report VAB for ${entry.childName}.`,
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
              categoryId: 'fakturavakt.reminders',
            },
            data: {
              type: 'vab',
              entryId: entry.id,
              offset: offset.toString(),
            },
          },
          trigger,
        );
      }),
    );
  }

  private buildAppointmentNotificationId(appointmentId: string, offset: number) {
    return `appointment-${appointmentId}-${offset}`;
  }

  async cancelMedicalAppointmentReminders(appointmentId: string) {
    const notifications = await notifee.getTriggerNotifications();

    const idsToCancel = notifications
      .filter((entry) => entry.notification.id?.startsWith(`appointment-${appointmentId}-`))
      .map((entry) => entry.notification.id)
      .filter((id): id is string => Boolean(id));

    if (idsToCancel.length > 0) {
      await notifee.cancelTriggerNotifications(idsToCancel);
    }
  }

  async scheduleMedicalAppointmentReminders(appointment: MedicalAppointment) {
    if (!this.ready) {
      await this.initialize();
    }

    if (!this.ready) {
      return;
    }

    await this.cancelMedicalAppointmentReminders(appointment.id);

    const reminders = appointment.reminderOffsets
      .map((offset) => ({
        offset,
        triggerDate: dayjs(appointment.date).subtract(offset, 'day'),
      }))
      .map(({ offset, triggerDate }) => ({
        offset,
        triggerDate: offset === 0 ? triggerDate : triggerDate.hour(9).minute(0).second(0).millisecond(0),
      }))
      .filter(({ triggerDate }) => triggerDate.isAfter(dayjs()))
      .sort((a, b) => a.triggerDate.valueOf() - b.triggerDate.valueOf());

    await Promise.all(
      reminders.map(async ({ offset, triggerDate }) => {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.valueOf(),
          alarmManager: {
            allowWhileIdle: true,
          },
        };

        const id = this.buildAppointmentNotificationId(appointment.id, offset);

        await notifee.createTriggerNotification(
          {
            id,
            title: appointment.title,
            subtitle: appointment.personName ?? undefined,
            body: appointment.personName
              ? `Reminder: ${appointment.personName} has an appointment on ${formatDate(appointment.date)}.`
              : `Reminder: appointment on ${formatDate(appointment.date)}.`,
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
              categoryId: 'fakturavakt.reminders',
            },
            data: {
              type: 'appointment',
              appointmentId: appointment.id,
              offset: offset.toString(),
            },
          },
          trigger,
        );
      }),
    );
  }
}

export const notificationService = new NotificationService();
