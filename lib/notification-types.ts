/** Values for `Notification.type` (string column; validate at write time). */
export const NOTIFICATION_TYPES = [
  "order_created",
  "order_update",
  "new_store_order",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}
