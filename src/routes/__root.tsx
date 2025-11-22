import { createRootRoute, Outlet } from "@tanstack/react-router";
import EunoiaLogo from "../assets/Eunoia.svg";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="relative min-h-screen bg-[#02040f] text-foreground">
      <LandingBackdrop />
      <div
        className="pointer-events-none fixed inset-0 bg-linear-to-br from-[#020312]/80 via-[#01030c]/70 to-[#050b1f]/70"
        aria-hidden="true"
      />
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function LandingBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-y-auto"
      aria-hidden="true"
    >
      <div className="min-h-screen bg-linear-to-br from-[#f7f5ff] via-[#f0f4ff] to-[#fbf6ff] text-foreground">
        <header className="bg-[#0d2c6f] text-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <img src={EunoiaLogo} alt="Eunoia" className="w-32" />
            <div className="flex gap-3 text-sm">
              <div className="rounded-full bg-white text-[#0d2c6f] px-4 py-2 uppercase tracking-[0.3em]">
                Sign up
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <section className="space-y-6">
            <h1 className="text-5xl font-semibold text-slate-900 leading-tight">
              Share presence, not prompts.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Eunoia is a 100% AI-free social garden. Notes, audio drops, and
              pulse circles are all authenticated through Ethos so you always
              meet a real human.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              Keep the tab open—verification happens invisibly and renews your
              access token every 24 hours.
            </p>
          </section>

          <section className="glass-panel w-full max-w-md space-y-6 border border-white/70 bg-white/60 p-8 text-left shadow-2xl backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.45em] text-slate-500">
              Feature Glimpses
            </p>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-900">
                  Pulse Circles
                </span>
                <p className="text-slate-500">
                  Fire-side chats curated by shared mood tags. No feeds, just
                  presence.
                </p>
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Echo Journals
                </span>
                <p className="text-slate-500">
                  Daily reflections logged privately or sent to your trust
                  lattice.
                </p>
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Human Signals
                </span>
                <p className="text-slate-500">
                  Ethos badges that fade if you miss a verification cycle.
                </p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
