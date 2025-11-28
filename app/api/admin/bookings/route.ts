import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = "admin@admin.com";

export async function GET(request: Request) {
  const adminEmail = request.headers.get("x-admin-email")?.toLowerCase();
  if (adminEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.ticket.findMany({
    include: { park: true },
    orderBy: [{ orderId: "desc" }, { ticketId: "desc" }],
  });

  const mapped = tickets.map((t) => ({
    ticketId: t.ticketId.toString(),
    orderId: t.orderId.toString(),
    parkName: t.park?.name ?? "Unknown park",
    status: t.status,
    visitDate: t.visitDate.toISOString(),
  }));

  return NextResponse.json({ success: true, tickets: mapped });
}
