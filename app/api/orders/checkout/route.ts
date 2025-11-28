import { NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, cartItems, paymentMethod } = body ?? {};

  const result = await orderService.processCheckout(
    userId ?? "",
    Array.isArray(cartItems) ? cartItems : [],
    paymentMethod ?? "CARD"
  );

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: result.message,
    receipt: result.receipt,
  });
}
