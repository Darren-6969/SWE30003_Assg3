import { NextResponse } from "next/server";
import { cartService } from "@/lib/services/cartService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { userId } = body ?? {};

  const result = await cartService.clearCart(userId ?? "");

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
