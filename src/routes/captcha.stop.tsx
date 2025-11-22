import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/stop")({
  component: StopCaptcha,
});

const BAR_WIDTH = 600;
const TARGET_SIZE = 60;
const TARGET_POSITION = (BAR_WIDTH - TARGET_SIZE) / 2;
const SPEED = 4; // pixels per frame
const TOLERANCE = 30; // pixels

export function StopCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [stoppedPosition, setStoppedPosition] = useState<number | null>(null);

  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      setPosition((prev) => {
        let newPos = prev + SPEED * direction;

        if (newPos >= BAR_WIDTH - 20) {
          newPos = BAR_WIDTH - 20;
          setDirection(-1);
        } else if (newPos <= 0) {
          newPos = 0;
          setDirection(1);
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && isActive) {
        e.preventDefault();
        handleStop();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, position]);

  const startTest = () => {
    setIsActive(true);
    setPosition(0);
    setDirection(1);
    setStoppedPosition(null);
    setAttempts((prev) => prev + 1);
  };

  const handleStop = () => {
    setIsActive(false);
    setStoppedPosition(position);

    const targetCenter = TARGET_POSITION + TARGET_SIZE / 2;
    const barCenter = position + 10;
    const distance = Math.abs(barCenter - targetCenter);

    const success = distance <= TOLERANCE;
    setPassed(success);
    setShowResult(true);

    if (success) {
      markCaptchaComplete("stop", true, 100 - distance);
    } else {
      incrementAttempts("stop");
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStoppedPosition(null);
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/emotion" });
  };

  const getAccuracy = () => {
    if (stoppedPosition === null) return 0;
    const targetCenter = TARGET_POSITION + TARGET_SIZE / 2;
    const barCenter = stoppedPosition + 10;
    const distance = Math.abs(barCenter - targetCenter);
    return Math.max(0, 100 - (distance / TOLERANCE) * 100);
  };

  return (
    <CaptchaContainer
      title="REACTION TIME VERIFICATION"
      description="Press SPACEBAR to stop the moving bar inside the target zone. Timing is critical."
    >
      <div className="space-y-8">
        {!isActive && stoppedPosition === null ? (
          <div className="text-center py-10 space-y-5">
            <p className="text-muted">
              A luminous bar will sweep at unpredictable speeds. Arrest it
              inside the narrow target to prove human-grade reaction latency.
            </p>
            <p className="text-accent-neon font-semibold">
              Press SPACEBAR to stop
            </p>
            <Button onClick={startTest}>
              {attempts > 0 ? "Try Again" : "Start Test"}
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-muted text-sm mb-2">
                Attempts: <span className="text-accent-bright">{attempts}</span>
              </p>
              {isActive && (
                <p className="text-accent-neon font-bold text-lg animate-pulse">
                  Press SPACEBAR to stop!
                </p>
              )}
            </div>

            <div className="max-w-3xl mx-auto">
              <div
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                style={{
                  height: "120px",
                  width: `${BAR_WIDTH}px`,
                  margin: "0 auto",
                }}
              >
                {/* Target zone */}
                <div
                  className="absolute top-0 bottom-0 bg-accent-neon/10 border-2 border-accent-neon"
                  style={{
                    left: `${TARGET_POSITION}px`,
                    width: `${TARGET_SIZE}px`,
                  }}
                >
                  <div className="h-full flex items-center justify-center">
                    <span className="text-accent-neon font-bold text-xs tracking-[0.4em]">
                      TARGET
                    </span>
                  </div>
                </div>

                {/* Moving bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-24 w-5 rounded-full border border-white/20 transition-transform duration-100"
                  style={{
                    left: `${stoppedPosition !== null ? stoppedPosition : position}px`,
                    background: isActive
                      ? "linear-gradient(180deg, #9d7bff 0%, #46f0ff 100%)"
                      : stoppedPosition !== null
                        ? "rgba(246, 247, 251, 0.9)"
                        : "rgba(157, 123, 255, 0.85)",
                    boxShadow: isActive
                      ? "0 0 25px rgba(70, 240, 255, 0.65)"
                      : "0 0 15px rgba(157, 123, 255, 0.35)",
                  }}
                >
                  <div className="absolute inset-0 opacity-40 blur-xl bg-accent-neon"></div>
                </div>

                {/* Center line indicator */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-accent-neon/60"
                  style={{ left: `${TARGET_POSITION + TARGET_SIZE / 2}px` }}
                />
              </div>

              {stoppedPosition !== null && !showResult && (
                <div className="mt-4 text-center animate-fade-in">
                  <p className="text-foreground text-lg mb-2">
                    Accuracy:{" "}
                    <span className="text-accent-bright font-bold">
                      {getAccuracy().toFixed(1)}%
                    </span>
                  </p>
                  <Button onClick={startTest} variant="secondary">
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-muted text-xs">
                💡 Focus on the target zone. React quickly when the bar
                approaches.
              </p>
            </div>
          </>
        )}
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={
            passed
              ? `Perfect timing! Accuracy: ${getAccuracy().toFixed(1)}%`
              : `Too far from target. Try to stop closer to the center.`
          }
        />
      )}
    </CaptchaContainer>
  );
}
