import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId is required" },
      { status: 400 }
    );
  }

  let userIdBig: bigint;
  try {
    userIdBig = BigInt(userId);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid userId" },
      { status: 400 }
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: userIdBig },
    include: { park: true },
    orderBy: [{ visitDate: "asc" }],
  });

  const mapped = tickets.map((t) => ({
    ticketId: t.ticketId.toString(),
    parkName: t.park?.name ?? "Unknown park",
    status: t.status,
    visitDate: t.visitDate.toISOString(),
  }));

  return NextResponse.json({ success: true, tickets: mapped });
}
