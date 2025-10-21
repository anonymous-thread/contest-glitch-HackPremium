import React from "react";
import Link from "next/link";

const Page = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-[#01040c] via-[#041026] to-[#020617] px-6 py-16 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="hacker-grid" />
        <div className="hacker-scan" />
        <div className="hacker-noise" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-slate-700/60 bg-[#05132c]/60 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-300/70">
          Systems Online
        </span>

        <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
          Penetrate the network.
          <span className="text-[#04f1b6]"> Stay in the shadows.</span>
        </h1>

        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Operate inside a fortified environment crafted for elite operators. Monitor targets,
          intercept signals, and deploy countermeasures with precision.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-48 rounded-md border border-[#04f1b6]/70 bg-[#05132c]/80 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#04f1b6] shadow-[0_0_18px_rgba(4,241,182,0.28)] transition hover:border-[#04f1b6] hover:bg-[#04f1b6] hover:text-[#01040c]"
          >
            Initiate Access
          </Link>

          <Link
            href="/welcome"
            className="w-48 rounded-md border border-slate-700/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-slate-300 transition hover:border-slate-500 hover:text-[#04f1b6]"
          >
            Enter Sandbox
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#00040a] via-transparent" />
    </main>
  );
};

export default Page;
