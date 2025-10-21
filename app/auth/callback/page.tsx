"use client";

import { useEffect } from "react";

const parseHashFragment = (hash: string) => {
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleanHash);
  const entries = Array.from(params.entries());

  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

const AuthCallbackPage = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = parseHashFragment(window.location.hash ?? "");

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: "google-oauth-response",
          data: payload,
        },
        window.location.origin,
      );
    }

    const timeout = window.setTimeout(() => {
      window.close();
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-center text-sm text-white">
      <p className="text-lg font-semibold text-[#00d492]">Completing Google sign-in…</p>
      <p>You can close this window if it does not close automatically.</p>
    </div>
  );
};

export default AuthCallbackPage;
