import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/identify")({
  component: IdentifyCaptcha,
});

// Placeholder images - in production, replace with actual image URLs
const GRID_SIZE = 4;

interface GridCell {
  id: number;
  image: string;
  hasTarget: boolean;
}

function IdentifyCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  // Generate grid with some cells containing the "target"
  const targetIndices = [3, 7, 11]; // Cells that contain the tiny bicycle
  const [grid] = useState<GridCell[]>(() => {
    return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      id: i,
      image: `https://picsum.photos/200/200?random=${i}`,
      hasTarget: targetIndices.includes(i),
    }));
  });

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const toggleCell = (id: number) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleVerify = () => {
    const correctSelections = targetIndices.filter((id) =>
      selected.has(id)
    ).length;
    const incorrectSelections = Array.from(selected).filter(
      (id) => !targetIndices.includes(id)
    ).length;

    const isCorrect =
      correctSelections === targetIndices.length && incorrectSelections === 0;

    if (isCorrect) {
      setPassed(true);
      setShowResult(true);
      markCaptchaComplete("identify", true);
    } else {
      setAttempts((prev) => prev + 1);
      incrementAttempts("identify");

      if (attempts >= 1) {
        setShowHint(true);
      }

      // Show feedback without result screen, let them try again
      const message =
        correctSelections < targetIndices.length
          ? "Some targets are missing from your selection."
          : "You selected squares that do not contain the target.";

      alert(`Verification Failed: ${message}`);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setSelected(new Set());
    setAttempts(0);
    setShowHint(false);
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/emotion" });
  };

  return (
    <CaptchaContainer
      title="OBJECT IDENTIFICATION VERIFICATION"
      description="Select all squares containing a bicycle. Look carefully - some objects may be extremely small."
    >
      <div className="space-y-8">
        <div className="gradient-border max-w-xl mx-auto">
          <div className="glass-panel p-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-accent-neon/70 mb-4">
              Visual Target
            </p>
            <p className="text-accent-bright font-semibold">
              SELECT ALL SQUARES WITH:{" "}
              <span className="text-xl">🚲 BICYCLE</span>
            </p>
          </div>
        </div>

        {showHint && (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-muted animate-fade-in">
            💡 Hint: Look at the corners and edges of each image. Some bicycles
            are very small.
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {grid.map((cell) => (
            <button
              key={cell.id}
              onClick={() => toggleCell(cell.id)}
              className={`aspect-square relative overflow-hidden rounded-2xl border transition-all ${
                selected.has(cell.id)
                  ? "border-accent-neon bg-accent-neon/10 scale-95 shadow-glow"
                  : "border-white/15 bg-white/5 hover:border-accent-bright/60"
              }`}
            >
              <img
                src={cell.image}
                alt={`Grid cell ${cell.id}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay bicycle icon on target cells (hidden in actual game, shown here for testing) */}
              {cell.hasTarget && (
                <div className="absolute bottom-1 right-1 text-xs opacity-30">
                  🚲
                </div>
              )}
              {selected.has(cell.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-accent-neon/30 flex items-center justify-center">
                  <div className="text-4xl text-accent-bright">✓</div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 items-center md:flex-row md:justify-between pt-4">
          <div className="text-sm text-muted">
            {selected.size} square{selected.size !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelected(new Set())}>
              Clear Selection
            </Button>
            <Button onClick={handleVerify} disabled={selected.size === 0}>
              Verify
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted text-center">
          Note: In production, images would be carefully curated with hidden
          objects.
        </p>
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      )}
    </CaptchaContainer>
  );
}
