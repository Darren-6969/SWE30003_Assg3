// lib/services/reportService.ts
import { prisma } from "../db";
import { orderRepository } from "../repositories/orderRepository";

export type SystemSummary = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalTickets: number;
  activeTickets: number;
  cancelledTickets: number;
};

const toOrderDTO = (order: Awaited<ReturnType<typeof orderRepository.findAll>>[number]) => ({
  orderId: order.orderId.toString(),
  createdAt: order.createdAt.toISOString(),
  totalAmount: Number(order.totalAmount),
  status: order.status,
  items: order.items.map((item) => ({
    itemId: item.itemId.toString(),
    productId: item.productId.toString(),
    productName: item.product.productName,
    quantity: item.quantity,
    lockedPrice: Number(item.lockedPrice),
  })),
});

export const reportService = {
  /**
   * Used by admin dashboard to show high-level stats.
   */
  async getSystemSummary(): Promise<SystemSummary> {
    const [totalUsers, orderAgg, ticketGroups] = await Promise.all([
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { orderId: true },
      }),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: { ticketId: true },
      }),
    ]);

    const totalOrders = orderAgg._count.orderId ?? 0;
    const totalRevenue = Number(orderAgg._sum.totalAmount ?? 0);

    let totalTickets = 0;
    let activeTickets = 0;
    let cancelledTickets = 0;

    for (const row of ticketGroups) {
      const count = row._count.ticketId;
      totalTickets += count;
      if (row.status === "ACTIVE") activeTickets += count;
      if (row.status === "CANCELLED") cancelledTickets += count;
    }

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      totalTickets,
      activeTickets,
      cancelledTickets,
    };
  },

  /**
   * Used by the admin “Transaction report” page to list all orders.
   */
  async getOrdersReport() {
    const orders = await orderRepository.findAll();
    return orders.map(toOrderDTO);
  },
};
