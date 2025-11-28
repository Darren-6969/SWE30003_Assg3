import { prisma } from "../db";

export const parkRepository = {
  async findAllParks() {
    return prisma.park.findMany({ orderBy: { parkId: "asc" } });
  },

  async findById(parkId: bigint) {
    return prisma.park.findUnique({ where: { parkId } });
  },
};
