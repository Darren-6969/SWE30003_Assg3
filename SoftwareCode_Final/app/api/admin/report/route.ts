import { NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";

export async function GET() {
  const report = await reportService.getSystemSummary();
  return NextResponse.json({ success: true, report });
}
