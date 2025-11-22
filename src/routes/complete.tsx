import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/Button";
import { useApp } from "../contexts/AppContext";
import EthosLogo from "../assets/Ethos.svg";

export const Route = createFileRoute("/complete")({
  component: CompletePage,
});

function CompletePage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - state.startTime) / 1000)
  );
  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  const handleContinue = () => {
    navigate({ to: "/app" });
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#040510] via-[#05071c] to-[#020109] text-foreground px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_40px_140px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4 text-center">
          <img
            src={EthosLogo}
            alt="Ethos verification mark"
            className="mx-auto w-48 drop-shadow-[0_10px_50px_rgba(225,104,104,0.45)]"
          />
          <p className="text-xs uppercase tracking-[0.5em] text-rose-200/70">
            Ethos // Verification Complete
          </p>
          <h1 className="text-4xl font-semibold text-white heading-glow">
            Human identity authenticated
          </h1>
          <p className="text-sm text-slate-200">
            Cognitive tempo, affect range, and fine-motor cadence match a live
            human profile. Clearance token ready for transmission to Eunoia.
          </p>
        </div>

        <div className="grid gap-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-left md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">
              Sequence duration
            </p>
            <p className="mt-2 text-3xl font-semibold text-white tabular-nums">
              {minutes}:{seconds}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">
              Challenges cleared
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {state.completedCaptchas.length} / 6
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">
              Session token
            </p>
            <p className="mt-2 font-mono text-lg text-slate-200">
              {state.startTime.toString(36).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-200">
            Ethos custody ends here. Continue to Eunoia to resume your facade.
          </p>
          <div className="flex justify-center">
            <Button onClick={handleContinue}>Transfer to Eunoia</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
