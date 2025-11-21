import React from 'react';
import { CAPTCHA_ORDER } from '../types';

interface ProgressBarProps {
  currentIndex: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentIndex }) => {
  const total = CAPTCHA_ORDER.length;
  const percentage = (currentIndex / total) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted font-medium tracking-wider">VERIFICATION PROGRESS</span>
        <span className="text-sm text-accent font-bold tabular-nums">
          {currentIndex} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

