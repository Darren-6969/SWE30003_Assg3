import { NextResponse } from "next/server";
import { bookingService } from "@/lib/services/bookingService";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Context) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const { userId, newDate } = body ?? {};

  const result = await bookingService.rescheduleTicket(id, newDate ?? "", userId ?? "");
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
