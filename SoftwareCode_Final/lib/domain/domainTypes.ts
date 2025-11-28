export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type PaymentMethod = "CARD" | "WALLET" | "DUMMY";

export type CartItemInput = {
  productId: string;
  quantity: number;
};

export type OrderItemDTO = {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  lockedPrice: number;
};

export type OrderDTO = {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemDTO[];
};

export type TransactionReceipt = {
  orderId: string;
  totalAmount: number;
  status: OrderStatus;
};
