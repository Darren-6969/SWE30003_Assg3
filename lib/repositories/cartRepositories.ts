import { prisma } from "../db";

export const cartRepository = {
  async findItemsByUser(userId: bigint) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { cartItemId: "asc" }, // adjust if your PK name differs
    });
  },

  async findItem(userId: bigint, productId: bigint) {
    return prisma.cartItem.findFirst({
      where: { userId, productId },
    });
  },

  async addOrUpdateItem(userId: bigint, productId: bigint, quantity: number) {
    const existing = await this.findItem(userId, productId);

    if (existing) {
      return prisma.cartItem.update({
        where: { cartItemId: existing.cartItemId },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  },

  async setQuantity(userId: bigint, productId: bigint, quantity: number) {
    const existing = await this.findItem(userId, productId);
    if (!existing) {
      return prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }
    return prisma.cartItem.update({
      where: { cartItemId: existing.cartItemId },
      data: { quantity },
    });
  },

  async removeItem(userId: bigint, productId: bigint) {
    return prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
  },

  async clearCart(userId: bigint) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  },
};
