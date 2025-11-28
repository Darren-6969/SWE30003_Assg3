import { prisma } from "../db";

export const bookingService = {
  async cancelTicket(ticketIdInput: string, userIdInput: string) {
    if (!ticketIdInput || !userIdInput) {
      return { success: false, message: "Ticket ID and user ID are required." };
    }
    let ticketId: bigint;
    let userId: bigint;
    try {
      ticketId = BigInt(ticketIdInput);
      userId = BigInt(userIdInput);
    } catch {
      return { success: false, message: "Invalid identifiers supplied." };
    }

    const ticket = await prisma.ticket.findUnique({ where: { ticketId } });
    if (!ticket || ticket.userId !== userId) {
      return { success: false, message: "Ticket not found for this user." };
    }

    await prisma.ticket.update({
      where: { ticketId },
      data: { status: "CANCELLED" },
    });

    // Mock refund hook could be placed here.

    return { success: true, message: "Ticket cancelled." };
  },

  async rescheduleTicket(ticketIdInput: string, newDateInput: string, userIdInput: string) {
    if (!ticketIdInput || !newDateInput || !userIdInput) {
      return { success: false, message: "Ticket ID, new date, and user ID are required." };
    }
    let ticketId: bigint;
    let userId: bigint;
    try {
      ticketId = BigInt(ticketIdInput);
      userId = BigInt(userIdInput);
    } catch {
      return { success: false, message: "Invalid identifiers supplied." };
    }

    const newDate = new Date(newDateInput);
    if (Number.isNaN(newDate.getTime())) {
      return { success: false, message: "Invalid visit date." };
    }

    const ticket = await prisma.ticket.findUnique({ where: { ticketId } });
    if (!ticket || ticket.userId !== userId) {
      return { success: false, message: "Ticket not found for this user." };
    }

    const updated = await prisma.ticket.update({
      where: { ticketId },
      data: { visitDate: newDate, status: "RESCHEDULED" },
    });

    return {
      success: true,
      message: "Ticket rescheduled.",
      ticket: {
        ticketId: updated.ticketId.toString(),
        status: updated.status,
        visitDate: updated.visitDate.toISOString(),
      },
    };
  },
};
