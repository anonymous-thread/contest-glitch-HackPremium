import { NextRequest, NextResponse } from "next/server";

const LOGIN_PATH = "/login";
const LOGIN_REDIRECT_HEADER = "x-redirect";
const CLEAR_TOKEN_HEADER = "x-clear-token";

const JWT_SECRET = process.env.JWT_SECRET;

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const sanitized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = sanitized.length % 4 === 0 ? 0 : 4 - (sanitized.length % 4);
  const base64 = sanitized + "=".repeat(padding);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function verifyJwt(token: string, secret: string) {
  const segments = token.split(".");
  if (segments.length !== 3) {
    throw new Error("Malformed JWT");
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const encoder = new TextEncoder();
  const verificationKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const data = encoder.encode(`${headerSegment}.${payloadSegment}`);
  const signatureBytes = base64UrlToUint8Array(signatureSegment);
  // Wrap in a fresh Uint8Array to ensure BufferSource compatibility
  const signatureView = new Uint8Array(signatureBytes);
  const isValid = await crypto.subtle.verify({ name: "HMAC" }, verificationKey, signatureView, data);

  if (!isValid) {
    throw new Error("Invalid JWT signature");
  }

  const payloadBytes = base64UrlToUint8Array(payloadSegment);
  const payloadText = new TextDecoder().decode(payloadBytes);
  const payload = JSON.parse(payloadText) as { exp?: number };

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Expired JWT");
  }

  return payload;
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL(LOGIN_PATH, req.url);
  const response = NextResponse.redirect(loginUrl, { status: 307 });
  response.headers.set(LOGIN_REDIRECT_HEADER, LOGIN_PATH);
  response.headers.set(CLEAR_TOKEN_HEADER, "true");
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function middleware(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured for middleware");
    return redirectToLogin(req);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return redirectToLogin(req);
  }

  try {
    await verifyJwt(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error("JWT validation failed in middleware:", error);
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
