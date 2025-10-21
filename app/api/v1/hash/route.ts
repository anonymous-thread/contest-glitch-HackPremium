import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { isPremiumEmail } from "@/lib/premium-operatives";

const JWT_SECRET = process.env.JWT_SECRET;

const LOGIN_REDIRECT_HEADER = "x-redirect";
const CLEAR_TOKEN_HEADER = "x-clear-token";

function unauthorized(message: string) {
  const response = NextResponse.json({ error: message }, { status: 401 });
  response.headers.set(LOGIN_REDIRECT_HEADER, "/login");
  response.headers.set(CLEAR_TOKEN_HEADER, "true");
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function GET(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured for /api/v1/hash");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return unauthorized("Missing bearer token");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string };
    if (!isPremiumEmail(decoded.email)) {
      return NextResponse.json(
        { error: "Only premium operatives may request hash keys" },
        { status: 403 }
      );
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const hash = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    return NextResponse.json({ hash }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Failed to verify JWT in /api/v1/hash:", error);
    return unauthorized("Invalid or expired token");
  }
}
