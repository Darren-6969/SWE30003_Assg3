import { Prisma, type OrderStatus } from "@prisma/client";
import { calculateCartTotal, buildReceipt } from "../domain/domainHelpers";
import type { CartItemInput, TransactionReceipt, PaymentMethod } from "../domain/domainTypes";
import { paymentStrategyFactory } from "../factory/paymentStrategyFactory";
import { productRepository } from "../repositories/productRepository";
import { orderRepository } from "../repositories/orderRepository";
import { userRepository } from "../repositories/userRepository";
import { prisma } from "../db";
import { systemConfiguration } from "../config/systemConfiguration";

const toOrderDTO = (order: Awaited<ReturnType<typeof orderRepository.findByUser>>[number]) => ({
  orderId: order.orderId.toString(),
  createdAt: order.createdAt.toISOString(),
  totalAmount: Number(order.totalAmount),
  status: order.status as OrderStatus,
  items: order.items.map((item) => ({
    itemId: item.itemId.toString(),
    productId: item.productId.toString(),
    productName: item.product.productName,
    quantity: item.quantity,
    lockedPrice: Number(item.lockedPrice),
  })),
});

export const orderService = {
  async processCheckout(
    userIdInput: string,
    cartItems: CartItemInput[],
    paymentMethod: string
  ): Promise<
    | { success: false; message: string }
    | { success: true; message: string; receipt: TransactionReceipt }
  > {
    if (!userIdInput) {
      return { success: false, message: "User is required." };
    }
    if (!cartItems.length) {
      return { success: false, message: "Cart is empty." };
    }

    let userId: bigint;
    try {
      userId = BigInt(userIdInput);
    } catch {
      return { success: false, message: "User is invalid." };
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    const productIds = cartItems.map((c) => BigInt(c.productId));
    const products = await productRepository.findByIds(productIds);
    if (products.length !== cartItems.length) {
      return { success: false, message: "One or more products are invalid." };
    }

    const orderItems = cartItems.map((item) => {
      const product = products.find((p) => p.productId === BigInt(item.productId))!;
      return {
        productId: product.productId,
        quantity: item.quantity,
        lockedPrice: Number(product.unitPrice),
        productType: product.type,
        parkId: product.parkId ?? null,
      };
    });

    // Booking rules: quantities must be positive integers
    if (orderItems.some((i) => !Number.isInteger(i.quantity) || i.quantity <= 0)) {
      return { success: false, message: "Quantities must be whole numbers greater than zero." };
    }

    // Booking rules: enforce max tickets per order across all ticket SKUs
    const totalTickets = orderItems
      .filter((i) => i.productType === "TICKET")
      .reduce((sum, i) => sum + i.quantity, 0);
    if (totalTickets > systemConfiguration.maxTicketsPerOrder) {
      return {
        success: false,
        message: `You can only buy up to ${systemConfiguration.maxTicketsPerOrder} tickets per order.`,
      };
    }

    const totalAmount = calculateCartTotal(
      orderItems.map((i) => ({ lockedPrice: i.lockedPrice, quantity: i.quantity }))
    );

    const strategy = paymentStrategyFactory(paymentMethod as PaymentMethod);
    const payment = await strategy.execute(totalAmount);
    if (!payment.success) {
      return { success: false, message: payment.message };
    }

    const created = await prisma.$transaction(async (tx) => {
      const [lastOrder, lastItem] = await Promise.all([
        tx.order.findFirst({
          orderBy: { orderId: "desc" },
          select: { orderId: true },
        }),
        tx.orderItem.findFirst({
          orderBy: { itemId: "desc" },
          select: { itemId: true },
        }),
      ]);
      const nextOrderId = (lastOrder?.orderId ?? BigInt(0)) + BigInt(1);
      let nextItemId = (lastItem?.itemId ?? BigInt(0)) + BigInt(1);

      const order = await tx.order.create({
        data: {
          orderId: nextOrderId,
          userId,
          status: "PAID",
          totalAmount: new Prisma.Decimal(totalAmount),
          items: {
            create: orderItems.map((i) => ({
              itemId: nextItemId++,
              productId: i.productId,
              quantity: i.quantity,
              lockedPrice: new Prisma.Decimal(i.lockedPrice),
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      const ticketCreates: {
        status: string;
        visitDate: Date;
        qrCode: string;
        userId: bigint;
        orderId: bigint;
        parkId: bigint;
      }[] = [];

      for (const item of orderItems) {
        if (item.productType === "TICKET") {
          if (!item.parkId) {
            throw new Error("Ticket product missing park reference.");
          }
          for (let i = 0; i < item.quantity; i += 1) {
            ticketCreates.push({
              status: "ACTIVE",
              visitDate: new Date(),
              qrCode: `ORDER-${order.orderId}-${item.productId}-${i + 1}`,
              userId,
              orderId: order.orderId,
              parkId: item.parkId,
            });
          }
        }
      }

      if (ticketCreates.length) {
        const lastTicket = await tx.ticket.findFirst({
          orderBy: { ticketId: "desc" },
          select: { ticketId: true },
        });
        let nextTicketId = (lastTicket?.ticketId ?? BigInt(0)) + BigInt(1);
        await tx.ticket.createMany({
          data: ticketCreates.map((t) => ({
            ticketId: nextTicketId++,
            ...t,
          })),
        });
      }

      return order;
    });

    return {
      success: true,
      message: payment.message ?? "Payment processed and order created.",
      receipt: buildReceipt({
        orderId: created.orderId.toString(),
        totalAmount,
        status: created.status,
      }),
    };
  },

  async cancelOrder(orderIdInput: string) {
    if (!orderIdInput) {
      return { success: false, message: "Order ID required." };
    }
    try {
      const orderId = BigInt(orderIdInput);
      const result = await orderRepository.cancelOrder(orderId);
      if (result.count === 0) {
        return { success: false, message: "Order not found or already cancelled." };
      }
      return { success: true, message: "Order cancelled." };
    } catch {
      return { success: false, message: "Invalid order id." };
    }
  },

  async getOrdersByUser(userIdInput: string) {
    try {
      const userId = BigInt(userIdInput);
      const orders = await orderRepository.findByUser(userId);
      return orders.map(toOrderDTO);
    } catch {
      return [];
    }
  },
};
