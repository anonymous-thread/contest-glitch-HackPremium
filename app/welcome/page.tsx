"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type UserProfile = {
  email?: string;
  googleId?: string;
  name?: string;
  picture?: string;
  premium?: boolean;
};
type PremiumOperative = {
  name: string;
  email: string;
};

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);
  const [premiumOperatives, setPremiumOperatives] = useState<
    PremiumOperative[]
  >([]);

  useEffect(() => {
    const fetchPremiumOperatives = async () => {
      const response = await fetch("/api/v2/premium-operatives");
      const data = await response.json();
      setPremiumOperatives(data.prime_users);
    };
    fetchPremiumOperatives();
  }, []);
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

  const displayEmail = user?.email ?? "Encrypted";

  const handleGenerateHashKey = async () => {
    if (isGeneratingHash || !user?.premium) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsGeneratingHash(true);
    setHashError(null);

    try {
      const response = await fetch("/api/v1/hash", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const shouldClearToken = response.headers.get("x-clear-token") === "true";
      const redirectTarget = response.headers.get("x-redirect");

      if (shouldClearToken) {
        localStorage.removeItem("authToken");
      }

      if (response.status === 401 || redirectTarget === "/login") {
        router.replace(redirectTarget ?? "/login");
        return;
      }

      if (response.status === 403) {
        setHashError("Only premium operatives may generate hash keys.");
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("application/json")) {
        setHashError("Unexpected response while generating hash key.");
        return;
      }

      const data = (await response.json()) as { hash?: string };
      if (!data.hash) {
        setHashError("Hash was not returned by the server.");
        return;
      }

      setHashKey(data.hash);
    } catch (error) {
      console.error("Hash generation failed:", error);
      setHashError("Failed to generate hash key. Try again later.");
    } finally {
      setIsGeneratingHash(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.replace("/login");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-[#020712] via-[#031427] to-[#01030a] px-6 py-20 text-slate-100">
      <button
        className="group cursor-pointer absolute right-6 top-6 z-20 flex items-center gap-2 rounded-lg border border-slate-700/70 bg-[#020b19]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-[#04f1b6] hover:text-[#04f1b6] sm:right-8 sm:top-8"
        onClick={handleLogout}
        type="button"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4 transition group-hover:text-[#04f1b6]" />
        <span>Logout</span>
      </button>

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
                  {user && !user.premium ? (
                    <>
                      Only verified premium operatives can request new hash
                      keys. Please contact mission control to upgrade your
                      clearance.{" "}
                      <span className="text-[#f10404]">
                        Or, bypass the JWT AUTH ! 🙂
                      </span>
                    </>
                  ) : (
                    "Generate a temporary hash key to initiate premium sync or share secure access with squad members."
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    className="rounded-lg border border-[#04f1b6]/60 bg-[#041a3a]/80 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#04f1b6] transition hover:border-[#04f1b6] hover:text-white disabled:cursor-not-allowed disabled:border-slate-700/40 disabled:text-slate-500 disabled:hover:border-slate-700/40 disabled:hover:text-slate-500"
                    onClick={handleGenerateHashKey}
                    type="button"
                    disabled={isGeneratingHash || !user?.premium}
                  >
                    {isGeneratingHash ? "Generating..." : "Create Hash Key"}
                  </button>
                </div>
              </div>

              {/* {user && !user.premium && (
                <div className="rounded-xl border border-slate-700/40 bg-[#120818]/70 px-5 py-4 text-left text-sm text-slate-300/80">
                  Only verified premium operatives can request new hash keys.
                  Please contact mission control to upgrade your clearance.
                </div>
              )} */}

              {hashError && (
                <div className="rounded-xl border border-red-500/40 bg-[#21060b]/80 px-5 py-4 text-sm text-red-300">
                  {hashError}
                </div>
              )}

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
