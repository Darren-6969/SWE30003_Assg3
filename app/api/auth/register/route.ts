import { NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const { fullName, email, password } = body ?? {};
  const result = await authService.register(fullName ?? "", email ?? "", password ?? "");
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json({
    success: true,
    message: result.message,
    user: result.user,
  });
}
