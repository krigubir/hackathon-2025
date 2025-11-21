import React from "react";
import { CAPTCHA_ORDER } from "../types";

interface ProgressBarProps {
  currentIndex: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentIndex }) => {
  const total = CAPTCHA_ORDER.length;
  const percentage = (currentIndex / total) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-6 animate-fade-in">
      <div className="glass-panel border border-border-glow/30 rounded-2xl px-6 py-5 shadow-card backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.7rem] tracking-[0.5em] text-accent-neon/70 uppercase">
            Protocol Status
          </div>
          <div className="text-sm font-semibold text-accent-neon tabular-nums">
            {currentIndex} / {total}
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent via-accent-bright to-accent-neon shadow-glow transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

