import type { OrderDTO, OrderItemDTO, TransactionReceipt } from "./domainTypes";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export const calculateCartTotal = (items: { lockedPrice: number; quantity: number }[]) =>
  items.reduce((sum, item) => sum + item.lockedPrice * item.quantity, 0);

export const calculateItemCount = (items: { quantity: number }[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const buildOrderDTO = (params: {
  orderId: string;
  createdAt: Date;
  status: string;
  items: OrderItemDTO[];
  totalAmount: number;
}): OrderDTO => ({
  orderId: params.orderId,
  createdAt: params.createdAt.toISOString(),
  status: params.status as OrderDTO["status"],
  items: params.items,
  totalAmount: params.totalAmount,
});

export const buildReceipt = (params: {
  orderId: string;
  totalAmount: number;
  status: string;
}): TransactionReceipt => ({
  orderId: params.orderId,
  totalAmount: params.totalAmount,
  status: params.status as TransactionReceipt["status"],
});
