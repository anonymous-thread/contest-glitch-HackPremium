import React from "react";

const Page = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-[#020712] via-[#031427] to-[#01030a] px-6 py-20 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="welcome-mesh" />
        <div className="welcome-rings" />
        <div className="welcome-pulse" />
      </div>

      <section className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
        <span className="rounded-full border border-[#0f5ad6]/50 bg-[#041a3a]/70 px-4 py-2 text-xs uppercase tracking-[0.42em] text-[#7db2ff]/80">
          Welcome Agent
        </span>

        <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
          Mission control synced.
          <span className="text-[#04f1b6]"> Operational clearance granted.</span>
        </h1>

        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Your credentials have been validated and the network lattice is now yours to command.
          Monitor active exploits, coordinate with the collective, and deploy precision signals.
        </p>

        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#04f1b6]/30 bg-[#031227]/70 p-6 text-left shadow-[0_0_24px_rgba(4,241,182,0.16)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#04f1b6]/70">Status</p>
            <p className="mt-3 text-lg font-semibold text-[#04f1b6]">Secure Channel</p>
            <p className="mt-2 text-sm text-slate-300/80">Encrypted uplink established. Monitoring for anomalies.</p>
          </div>
          <div className="rounded-2xl border border-[#0f5ad6]/30 bg-[#041a3a]/70 p-6 text-left shadow-[0_0_24px_rgba(15,90,214,0.16)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7db2ff]/70">Buffer</p>
            <p className="mt-3 text-lg font-semibold text-[#7db2ff]">Signal Streams</p>
            <p className="mt-2 text-sm text-slate-300/80">Real-time telemetry synced to your operator dashboard.</p>
          </div>
          <div className="rounded-2xl border border-slate-700/40 bg-[#020b19]/80 p-6 text-left shadow-[0_0_24px_rgba(15,23,42,0.26)]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/60">Next</p>
            <p className="mt-3 text-lg font-semibold text-slate-100">Deploy Sequence</p>
            <p className="mt-2 text-sm text-slate-300/80">Queue your next protocol or return to the main console.</p>
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#00040a] via-transparent" />
    </main>
  );
};

export default Page;
