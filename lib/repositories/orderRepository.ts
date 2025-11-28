// NO more import of OrderStatus or Prisma.Decimal
import { prisma } from "../db";

// Match whatever statuses you use in your schema / services
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

type CreateOrderItem = {
  productId: bigint;
  quantity: number;
  lockedPrice: number; // number is fine even if DB uses Decimal/Float
};

export const orderRepository = {
  async createOrder(userId: bigint, items: CreateOrderItem[], status: OrderStatus) {
    const totalAmountNumber = items.reduce(
      (sum, i) => sum + i.lockedPrice * i.quantity,
      0
    );

    const [lastOrder, lastItem] = await prisma.$transaction([
      prisma.order.findFirst({
        orderBy: { orderId: "desc" },
        select: { orderId: true },
      }),
      prisma.orderItem.findFirst({
        orderBy: { itemId: "desc" },
        select: { itemId: true },
      }),
    ]);

    const nextOrderId = (lastOrder?.orderId ?? BigInt(0)) + BigInt(1);
    let nextItemId = (lastItem?.itemId ?? BigInt(0)) + BigInt(1);

    return prisma.order.create({
      data: {
        orderId: nextOrderId,
        userId,
        status,
        // Prisma accepts number here even if the field is Decimal
        totalAmount: totalAmountNumber,
        items: {
          create: items.map((item) => {
            const itemId = nextItemId;
            nextItemId += BigInt(1);
            return {
              itemId,
              productId: item.productId,
              quantity: item.quantity,
              // same here – plain number is OK
              lockedPrice: item.lockedPrice,
            };
          }),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  },

  async findByUser(userId: bigint) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findAll() {
    return prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async cancelOrder(orderId: bigint) {
    return prisma.order.updateMany({
      where: { orderId },
      data: { status: "CANCELLED" },
    });
  },
};
