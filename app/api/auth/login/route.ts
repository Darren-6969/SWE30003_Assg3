import { NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body ?? {};
  const result = await authService.login(email ?? "", password ?? "");
  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    message: result.message,
    user: result.user,
  });
}
