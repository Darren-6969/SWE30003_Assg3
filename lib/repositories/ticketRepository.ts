import type { TicketStatus } from "@prisma/client";
import { prisma } from "../db";

export const ticketRepository = {
  // Find a ticket by ID
  async findById(ticketId: bigint) {
    return prisma.ticket.findUnique({
      where: { ticketId },
      include: { park: true, user: true },
    });
  },

  // Update ticket status (e.g., Cancelled)
  async updateStatus(ticketId: bigint, status: TicketStatus) {
    return prisma.ticket.update({
      where: { ticketId },
      data: { status },
    });
  },

  // Update visit date (Reschedule)
  async updateVisitDate(ticketId: bigint, visitDate: Date) {
    return prisma.ticket.update({
      where: { ticketId },
      data: { 
        visitDate,
        status: "RESCHEDULED" 
      },
    });
  },

  // CRITICAL: Counts active tickets for a park on a specific day
  // Matches "Inventory Race Conditions" logic in Assignment 3 [cite: 357]
  async countByParkAndDate(parkId: bigint, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.ticket.count({
      where: {
        parkId: parkId,
        status: { not: "CANCELLED" },
        visitDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }
};