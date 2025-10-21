"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GoogleGlyph = () => (
  <svg
    aria-hidden
    className="h-6 w-6"
    fill="none"
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.35 12.17c0 5.34-3.52 9.65-9.35 9.65-5.24 0-9.5-4.26-9.5-9.5s4.26-9.5 9.5-9.5c2.55 0 4.54.92 6.03 2.29l-2.47 2.3c-.64-.6-1.78-1.31-3.56-1.31-3.12 0-5.66 2.58-5.66 6.22 0 3.56 2.54 6.22 5.66 6.22 3.61 0 4.96-2.58 5.18-3.9h-5.18v-3.36h8.85c.09.49.18.98.18 1.39Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const OAUTH_POPUP_FEATURES =
  "width=480,height=640,menubar=0,toolbar=0,status=0";
const STATE_STORAGE_KEY = "google_oauth_state";
const NONCE_STORAGE_KEY = "google_oauth_nonce";

type GoogleOAuthPayload = {
  access_token?: string;
  token_type?: string;
  expires_in?: string;
  scope?: string;
  state?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

const LoginPage = () => {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);
  const popupMonitorRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data ?? {};
      if (type !== "google-oauth-response") return;

      popupRef.current?.close();
      popupRef.current = null;
      setIsLoadingGoogle(false);

      const storedState = sessionStorage.getItem(STATE_STORAGE_KEY);

      if (!data || typeof data !== "object") {
        console.error("Invalid Google OAuth response payload.", data);
        return;
      }

      const payload = data as GoogleOAuthPayload;

      if (payload.error) {
        console.error(
          "Google OAuth error:",
          payload.error,
          payload.error_description
        );
        sessionStorage.removeItem(STATE_STORAGE_KEY);
        sessionStorage.removeItem(NONCE_STORAGE_KEY);
        return;
      }

      if (storedState && payload.state !== storedState) {
        console.error("State mismatch in Google OAuth response.");
        sessionStorage.removeItem(STATE_STORAGE_KEY);
        sessionStorage.removeItem(NONCE_STORAGE_KEY);
        return;
      }

      sessionStorage.removeItem(STATE_STORAGE_KEY);
      sessionStorage.removeItem(NONCE_STORAGE_KEY);

      if (payload.access_token)
        console.log("Google access token:", payload.access_token);
      if (!payload.id_token) {
        console.error("No ID token received from Google.");
        return;
      }

      console.log("Google ID token:", payload.id_token);

      // Send ID token to your backend to verify and issue your own JWT
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: payload.id_token }),
        });

        const responseData = await res.json();
        if (responseData.token) {
          localStorage.setItem("authToken", responseData.token);
          console.log("Your app JWT:", responseData.token);
          console.log("Redirecting to welcome page...");
          router.push("/welcome");
        } else {
          console.error("Failed to get app JWT:", responseData);
        }
      } catch (err) {
        console.error("Error sending ID token to backend:", err);
      }

      console.log("Full Google OAuth payload:", payload);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    return () => {
      if (popupMonitorRef.current !== null) {
        window.clearInterval(popupMonitorRef.current);
        popupMonitorRef.current = null;
      }

      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  const handleContinueWithGoogle = () => {
    if (isLoadingGoogle) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Please add it to your environment before using Google login."
      );
      return;
    }

    const state = window.crypto.randomUUID();
    const nonce = window.crypto.randomUUID();
    const redirectUri = `${window.location.origin}/auth/callback`;

    sessionStorage.setItem(STATE_STORAGE_KEY, state);
    sessionStorage.setItem(NONCE_STORAGE_KEY, nonce);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token id_token",
      scope: "openid email profile",
      include_granted_scopes: "true",
      prompt: "select_account",
      state,
      nonce,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    setIsLoadingGoogle(true);

    popupRef.current = window.open(
      authUrl,
      "google-oauth-popup",
      `${OAUTH_POPUP_FEATURES},top=120,left=120`
    );

    if (!popupRef.current) {
      console.error("Google sign-in popup was blocked by the browser.");
      setIsLoadingGoogle(false);
      return;
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#01040c] via-[#031029] to-[#020617] px-6 py-20 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="hacker-grid" />
        <div className="hacker-scan" />
        <div className="hacker-noise" />
      </div>

      <section className="relative z-10 w-full max-w-xl">
        <div
          className="relative overflow-hidden rounded-[32px] border border-[#00d492]/35 px-12 py-16"
          style={{
            backgroundColor: "rgba(0, 12, 28, 0.96)",
            backgroundImage:
              "radial-gradient(120% 120% at 50% 0%, rgba(0, 212, 146, 0.15) 0%, rgba(0, 45, 80, 0.1) 38%, rgba(0, 12, 28, 0.98) 72%)",
          }}
        >
          <div className="relative space-y-10 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-wide text-[#00d492]">
                Login
              </h1>
              <p className="text-sm font-medium uppercase tracking-[0.4em] text-[#00d492]">
                glitch-HackPremium
              </p>
              <p className="text-base leading-relaxed text-[#00d492]">
                Unlock the premium social dashboard and keep your glitch
                strategies synchronized across devices.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#00d492]">
                Continue with
              </p>
              <button
                className="group flex cursor-pointer items-center gap-3 rounded-full border border-[#00d492] bg-black/80 px-8 py-3 text-sm font-semibold text-[#00d492] transition-all duration-300 hover:-translate-y-1 hover:border-[#00d492]/80 hover:bg-[#001437]/90 hover:text-white"
                onClick={handleContinueWithGoogle}
                aria-busy={isLoadingGoogle}
                type="button"
              >
                <span className="cursor-pointer rounded-full bg-[#00d492]/10 p-2 transition group-hover:bg-[#00d492]/25">
                  <GoogleGlyph />
                </span>
                <span className="cursor-pointer text-base tracking-wide group-hover:text-white">
                  Continue with Google
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#00040a] via-transparent" />
    </main>
  );
};

export default LoginPage;
