import { NextResponse } from "next/server";
import { cartService } from "@/lib/services/cartService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { userId, productId, quantity } = body ?? {};

  const qty = typeof quantity === "number" ? quantity : Number(quantity ?? 1);

  const result = await cartService.addItem(userId ?? "", productId ?? "", qty);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
