import React from "react";
import { Button } from "./Button";

interface ResultScreenProps {
  passed: boolean;
  onRetry?: () => void;
  onContinue?: () => void;
  message?: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ passed, onRetry, onContinue, message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <div className="absolute inset-0 bg-hero-glow opacity-40 blur-3xl pointer-events-none" />
      <div
        className={`relative max-w-lg w-full mx-6 overflow-hidden rounded-3xl border ${
          passed ? "border-accent-bright/60" : "border-red-500/60"
        } bg-background-card/80 p-12 text-center shadow-[0_40px_120px_rgba(4,5,12,0.85)] animate-slide-up`}
      >
        <div className="grid-lines" />
        <div className="relative z-10 mb-8">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
              passed ? "border-accent-bright/60 text-accent-bright" : "border-red-400/70 text-red-400"
            } text-4xl`}
          >
            {passed ? "✓" : "✗"}
          </div>
          <h2
            className={`text-3xl font-bold heading-glow ${
              passed ? "text-accent-bright" : "text-red-400"
            }`}
          >
            {passed ? "VERIFICATION PASSED" : "VERIFICATION FAILED"}
          </h2>
          <p className="mt-4 text-muted">
            {message ||
              (passed ? "Proceeding to next verification stage..." : "Human detection inconclusive. Please retry.")}
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4 justify-center">
          {!passed && onRetry && (
            <Button onClick={onRetry} variant="secondary">
              Retry Challenge
            </Button>
          )}
          {passed && onContinue && <Button onClick={onContinue}>Continue</Button>}
        </div>
      </div>
    </div>
  );
};

