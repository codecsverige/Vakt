import notifee, {
  AndroidImportance,
  AndroidStyle,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';
import type { Bill, ReminderSetting } from '../types';
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
}

export const notificationService = new NotificationService();
