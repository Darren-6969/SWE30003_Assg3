import { NextResponse } from "next/server";
import { cartService } from "@/lib/services/cartService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const result = await cartService.getCart(userId ?? "");

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
