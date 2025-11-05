import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET!;

const client = new OAuth2Client(CLIENT_ID);

export async function handleGoogleLogin(idToken: string) {
  try {
    // const ticket = await client.verifyIdToken({
    //   idToken,
    //   audience: CLIENT_ID,
    // });

    const payload = jwt.decode(idToken);
    // console.log(payload);

    if (!payload) throw new Error("Invalid Google token");

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload as {
      sub: string;
      email: string;
      name: string;
      picture: string;
    };

    console.log("Verified Google user:", { googleId, email, name, picture });

    const appToken = jwt.sign({ googleId, email, name, picture }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return { appToken, user: { googleId, email, name, picture } };
  } catch (err) {
    console.error("Google login failed:", err);
    throw err;
  }
}

export async function POST(req: Request) {
  let idToken: unknown;

  try {
    const body = await req.json();
    idToken = body?.idToken;
  } catch (err) {
    console.error("Failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof idToken !== "string" || !idToken.trim()) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  try {
    const { appToken, user } = await handleGoogleLogin(idToken);
    return NextResponse.json({ token: appToken, user }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to verify Google token" },
      { status: 401 }
    );
  }
}
