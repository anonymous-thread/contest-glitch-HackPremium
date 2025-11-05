import { NextRequest, NextResponse } from "next/server";
import { PREMIUM_OPERATIVES } from "@/app/api/utils/premium-operatives";

export async function GET(request: NextRequest) {
  return NextResponse.json({ prime_users: PREMIUM_OPERATIVES });
}
