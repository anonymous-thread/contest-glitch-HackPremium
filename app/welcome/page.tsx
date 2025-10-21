"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  email?: string;
  googleId?: string;
  name?: string;
  picture?: string;
};

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const ensureAuthenticated = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        if (isActive) setIsLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/v1/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const shouldClearToken =
          response.headers.get("x-clear-token") === "true";
        const redirectTarget = response.headers.get("x-redirect");

        if (shouldClearToken) {
          localStorage.removeItem("authToken");
        }

        if (response.status === 401 || redirectTarget === "/login") {
          if (isActive) setIsLoading(false);
          router.replace(redirectTarget ?? "/login");
          return;
        }

        const contentType = response.headers.get("content-type") ?? "";

        if (!response.ok || !contentType.includes("application/json")) {
          throw new Error("Unexpected response");
        }

        const data = (await response.json()) as { user?: UserProfile };

        if (isActive) {
          setUser(data.user ?? null);
        }
      } catch (error) {
        localStorage.removeItem("authToken");
        if (isActive) setIsLoading(false);
        router.replace("/login");
        return;
      }

      if (isActive) setIsLoading(false);
    };

    ensureAuthenticated();

    return () => {
      isActive = false;
    };
  }, [router]);

  const welcomeLabel = isLoading
    ? "Authenticating"
    : user?.name
    ? `Welcome ${user.name}`
    : "Welcome Agent";

  const premiumOperatives = useMemo(
    () => [
      {
        name: "Avery Collins",
        email: "avery.collins@glitchhq.io",
      },
      {
        name: "Morgan Reyes",
        email: "morgan.reyes@glitchhq.io",
      },
      {
        name: "Jordan Bennett",
        email: "jordan.bennett@glitchhq.io",
      },
      {
        name: "Rowan Patel",
        email: "rowan.patel@glitchhq.io",
      },
      {
        name: "Taylor Monroe",
        email: "taylor.monroe@glitchhq.io",
      },
    ],
    []
  );

  const displayEmail = user?.email ?? "Encrypted";

  const handleGenerateHashKey = () => {
    if (isGeneratingHash) return;

    setIsGeneratingHash(true);
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const generatedHash = Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      setHashKey(generatedHash.toUpperCase());
    } finally {
      setIsGeneratingHash(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-[#020712] via-[#031427] to-[#01030a] px-6 py-20 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="welcome-mesh" />
        <div className="welcome-rings" />
        <div className="welcome-pulse" />
      </div>

      <section className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
        <span className="rounded-full border border-[#0f5ad6]/50 bg-[#041a3a]/70 px-4 py-2 text-xs uppercase tracking-[0.42em] text-[#7db2ff]/80">
          {welcomeLabel}
        </span>

        {isLoading ? (
          <div className="flex flex-col items-center gap-5">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#04f1b6]/30 border-t-[#04f1b6]" />
            <p className="text-sm uppercase tracking-[0.35em] text-slate-300/80">
              Synchronizing Credentials
            </p>
            <p className="max-w-lg text-sm text-slate-300/80">
              Verifying your clearance level and prepping mission feed.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Control node secured.
                <span className="text-[#04f1b6]"> Operative channel live.</span>
              </h1>
              {/* <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Credentials verified for {user?.name ?? "Agent"}. Mission feed is active, encrypted uplink is stable, and premium network privileges are unlocked.
              </p> */}
            </div>

            <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#04f1b6]/25 bg-[#041020]/80 p-8 text-left shadow-[0_0_32px_rgba(4,241,182,0.14)]">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#04f1b6]/80">
                  Current Email :
                </p>
                <p className="mt-2 text-lg font-semibold text-[#04f1b6]">
                  {displayEmail}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">
                  Premium Operatives
                </p>
                <ul className="grid gap-3 text-left text-sm text-slate-200 sm:grid-cols-2">
                  {premiumOperatives.map((operative) => (
                    <li
                      key={operative.email}
                      className="flex flex-col gap-1 rounded-xl border border-slate-700/40 bg-[#020b19]/70 px-5 py-4"
                    >
                      <span className="text-base font-semibold text-slate-100">
                        {operative.name}
                      </span>
                      <span className="text-xs text-slate-300/80">
                        {operative.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-left text-sm text-slate-300/80">
                  Generate a temporary hash key to initiate premium sync or
                  share secure access with squad members.
                </div>
                <button
                  className="rounded-lg border border-[#04f1b6]/60 bg-[#041a3a]/80 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#04f1b6] transition hover:border-[#04f1b6] hover:text-white"
                  onClick={handleGenerateHashKey}
                  type="button"
                  disabled={isGeneratingHash}
                >
                  {isGeneratingHash ? "Generating..." : "Create Hash Key"}
                </button>
              </div>

              {hashKey && (
                <div className="rounded-xl border border-[#04f1b6]/30 bg-[#02101f]/80 px-5 py-4 text-sm tracking-widest text-[#04f1b6]">
                  {hashKey}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#00040a] via-transparent" />
    </main>
  );
};

export default Page;
