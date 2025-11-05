import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { isPremiumEmail } from "@/app/api/utils/premium-operatives";

type DecodedToken = {
  googleId?: string;
  email?: string;
  name?: string;
  picture?: string;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET;

const LOGIN_REDIRECT_HEADER = "x-redirect";

function unauthorizedResponse(message: string) {
  return NextResponse.json(
    { error: message },
    {
      status: 401,
      headers: {
        [LOGIN_REDIRECT_HEADER]: "/login",
        "cache-control": "no-store",
      },
    }
  );
}

export async function GET(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set.");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return unauthorizedResponse("Missing bearer token");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const { googleId, email, name, picture } = decoded;

    const premium = isPremiumEmail(email);

    return NextResponse.json(
      {
        user: {
          googleId: googleId ?? null,
          email: email ?? null,
          name: name ?? null,
          picture: picture ?? null,
          premium,
        },
      },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to verify JWT in /api/v1/user:", error);
    return unauthorizedResponse("Invalid or expired token");
  }
}
