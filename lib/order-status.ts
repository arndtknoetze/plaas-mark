/** Allowed values for `Order.status` (MySQL string column). */
export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "ready",
  "completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
