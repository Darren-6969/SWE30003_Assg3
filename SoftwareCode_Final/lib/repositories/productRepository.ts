import { prisma } from "../db";

export const productRepository = {
  async findTickets() {
    return prisma.product.findMany({
      where: { type: "TICKET" },
      orderBy: { productId: "asc" },
    });
  },

  async findMerchandise() {
    return prisma.product.findMany({
      where: { type: "MERCH" },
      orderBy: { productId: "asc" },
    });
  },

  async findById(productId: bigint) {
    return prisma.product.findUnique({ where: { productId } });
  },

  async findByIds(ids: bigint[]) {
    return prisma.product.findMany({ where: { productId: { in: ids } } });
  },
};
