import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { useApp } from "../contexts/AppContext";
import EunoiaLogo from "../assets/Eunoia.svg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { resetProgress } = useApp();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowDialog(true);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleBegin = () => {
    resetProgress();
    navigate({ to: "/captcha/ethos" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f6fbff] via-[#f2f5ff] to-white text-foreground">
      <header className="bg-[#0d2c6f] text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <img src={EunoiaLogo} alt="Eunoia" className="w-32" />
          <div className="flex gap-3 text-sm">
            <button className="rounded-full bg-white/10 px-4 py-2 uppercase tracking-[0.3em]">
              Log in
            </button>
            <button className="rounded-full bg-white text-[#0d2c6f] px-4 py-2 uppercase tracking-[0.3em]">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <section className="space-y-6">
          <h1 className="text-5xl font-semibold text-slate-900 leading-tight">
            The first social platform that refuses AI ghosts.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Eunoia celebrates unfiltered presence—handwritten notes, ambient
            voice rooms, spontaneous check-ins. Every interaction is anchored to
            a living, breathing human. No bots. No synthetic personas. Just
            friends, memory, and shared presence.
          </p>
          <p className="text-slate-500 text-base leading-relaxed">
            Ethos verification runs quietly in the background every time you
            visit. When it confirms you, your Eunoia home unlocks with zero
            friction.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleBegin}>Enter Now</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </section>
        <section className="glass-panel w-full max-w-md space-y-6 border border-white/70 bg-white/60 p-8 text-left shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-500">
            Life inside Eunoia
          </p>
          <ul className="space-y-4 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">
                Pulse Circles
              </span>
              <p className="text-slate-500">
                Micro-community rooms calibrated for calm, chaotic, or focused
                dialogue—pick the mood live.
              </p>
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Echo Journals
              </span>
              <p className="text-slate-500">
                Daily reflections shared privately or with your trust graph,
                archived permanently for your future self.
              </p>
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Human Signals
              </span>
              <p className="text-slate-500">
                Ethos-certified status badges, so everyone knows they’re
                speaking with a real mind.
              </p>
            </li>
          </ul>
        </section>
      </main>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              Quick identity refresh
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To keep Eunoia free of AI interference, we need to rerun the Ethos
              captcha. It only takes a moment and unlocks the social feed for
              the next 24 hours.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="danger" onClick={handleBegin}>
                Go to Ethos Captcha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
