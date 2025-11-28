import { prisma } from "../db";

const nextUserId = async () => {
  const lastUser = await prisma.user.findFirst({
    orderBy: { userId: "desc" },
    select: { userId: true },
  });
  return (lastUser?.userId ?? BigInt(0)) + BigInt(1);
};

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(fullName: string, email: string, passwordHash: string) {
    const nextId = await nextUserId();

    return prisma.user.create({
      data: {
        userId: nextId,
        fullName,
        email,
        passwordHash,
      },
    });
  },

  async upsertUser(fullName: string, email: string, passwordHash: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.passwordHash === passwordHash && existing.fullName === fullName) {
        return existing;
      }
      return prisma.user.update({
        where: { email },
        data: { fullName, passwordHash },
      });
    }

    const nextId = await nextUserId();
    return prisma.user.create({
      data: { userId: nextId, fullName, email, passwordHash },
    });
  },

  async findById(userId: bigint) {
    return prisma.user.findUnique({ where: { userId } });
  },

  async countUsers() {
    return prisma.user.count();
  },
};
