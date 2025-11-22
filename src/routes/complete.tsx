import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/Button";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/complete")({
  component: CompletePage,
});

function CompletePage() {
  const navigate = useNavigate();
  const { state, resetProgress } = useApp();

  const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const handleRestart = () => {
    resetProgress();
    navigate({ to: "/" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="absolute inset-0 bg-hero-glow opacity-80 blur-3xl pointer-events-none" />
      <div className="mx-auto max-w-4xl text-center space-y-12">
        <div className="space-y-6 animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-neon/60 text-5xl text-accent-neon shadow-glow">
            ✓
          </div>
          <p className="text-xs uppercase tracking-[0.6em] text-accent-neon/70">
            Status // Verified
          </p>
          <h1 className="text-5xl font-bold heading-glow">
            Human Identity Confirmed
          </h1>
          <p className="text-lg text-muted">
            Biometric heuristics, emotional analysis, and cognition telemetry
            meet all criteria. You are now cleared for full-spectrum system
            access.
          </p>
        </div>

        <div
          className="gradient-border animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="glass-panel relative p-10">
            <div className="grid-lines" />
            <div className="relative z-10 grid gap-8 md:grid-cols-2 text-left">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-muted mb-3">
                  Verification Time
                </p>
                <p className="text-4xl font-semibold text-accent-bright tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-muted mb-3">
                  Challenges Passed
                </p>
                <p className="text-4xl font-semibold text-accent-neon">6 / 6</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-muted mb-3">
                  Session Token
                </p>
                <p className="font-mono text-xl text-foreground/90">
                  {state.startTime.toString(36).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-muted mb-3">
                  Access Level
                </p>
                <p className="text-2xl font-semibold text-accent-bright">
                  Tier IV • Granted
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="space-y-4 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <p className="text-muted text-sm">
            A cryptographic attestation has been stored in the Global Human
            Registry. Your clearance remains valid for the next 24 hours.
          </p>
          <Button onClick={handleRestart} variant="secondary">
            Initiate New Verification
          </Button>
        </div>
      </div>
    </section>
  );
}
