import { NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
  }

  const orders = await orderService.getOrdersByUser(userId);
  return NextResponse.json({ success: true, orders });
}
