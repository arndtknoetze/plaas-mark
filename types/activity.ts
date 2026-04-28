export type ActivityItem = {
  id: string;
  type: "order_customer" | "order_seller" | "notification";
  title: string;
  subtitle: string;
  createdAt: string;
  status?: string;
};
