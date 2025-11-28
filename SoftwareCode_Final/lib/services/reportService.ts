import type { OrderStatus } from "@prisma/client";
import { orderRepository } from "../repositories/orderRepository";
import { userRepository } from "../repositories/userRepository";

const toOrderDTO = (order: Awaited<ReturnType<typeof orderRepository.findAll>>[number]) => ({
  orderId: order.orderId.toString(),
  createdAt: order.createdAt.toISOString(),
  status: order.status as OrderStatus,
  totalAmount: Number(order.totalAmount),
  items: order.items.map((item) => ({
    itemId: item.itemId.toString(),
    productId: item.productId.toString(),
    productName: item.product.productName,
    quantity: item.quantity,
    lockedPrice: Number(item.lockedPrice),
  })),
});

export const reportService = {
  async getOrdersByUser(userId: string) {
    const orders = await orderRepository.findByUser(BigInt(userId));
    return orders.map(toOrderDTO);
  },

  async getSystemSummary() {
    const userCount = await userRepository.countUsers();
    const orders = await orderRepository.findAll();
    const orderDTOs = orders.map(toOrderDTO);
    const totalRevenue = orderDTOs.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalUsers: userCount,
      totalOrders: orderDTOs.length,
      totalRevenue,
      orders: orderDTOs,
    };
  },
};
