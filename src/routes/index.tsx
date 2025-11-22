import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/Button";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { resetProgress } = useApp();

  const handleBegin = () => {
    resetProgress();
    navigate({ to: "/captcha/stop" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="absolute inset-0 bg-hero-glow opacity-70 blur-3xl pointer-events-none" />
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="text-xs uppercase tracking-[0.6em] text-accent-neon/70">
              Protocol // V-7.2
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight heading-glow">
              The 2025 standard for human verification
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Civilization now requires irrefutable proof of humanity. Complete
              a gauntlet of high-fidelity cognition, coordination, and empathy
              challenges crafted to expose even the most advanced AI imposters.
            </p>
            <div className="flex flex-wrap gap-4 ">
              <Button variant="danger" onClick={handleBegin}>
                Begin Verification
              </Button>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-muted">
              <div>
                <p className="text-3xl font-bold text-accent-bright">6</p>
                <p>Adaptive Challenges</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-neon">&lt; 12m</p>
                <p>Average Completion</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-bright">99.7%</p>
                <p>AI Detection Accuracy</p>
              </div>
            </div>
          </div>

          <div
            id="protocol-card"
            className="gradient-border animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="glass-panel relative p-8">
              <div className="grid-lines" />
              <div className="relative z-10 space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-accent-neon/70">
                  Ethos notice:
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  This moment is about shared trust. Your identity confirmation
                  is essential to proceed. It protects our collective security
                  and data. Thank you for maintaining this collaboration
                </p>
                <div className="border border-border-glow/50 rounded-2xl p-5">
                  <div className="text-xs text-muted uppercase tracking-[0.5em] mb-3">
                    Sequence
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li>01. Extreme Counting</li>
                    <li>02. Micro-object Detection</li>
                    <li>03. Precision Motor Control</li>
                    <li>04. Reaction Integrity</li>
                    <li>05. Emotion Recognition</li>
                  </ul>
                </div>
                <p className="text-xs text-muted">
                  Protocol Version 7.2.4 • Compliance Level: Mandated by the
                  Global Human Registry Council
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
