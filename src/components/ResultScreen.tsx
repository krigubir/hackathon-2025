import React from 'react';
import { Button } from './Button';

interface ResultScreenProps {
  passed: boolean;
  onRetry?: () => void;
  onContinue?: () => void;
  message?: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  passed,
  onRetry,
  onContinue,
  message,
}) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className={`bg-background border rounded-lg p-12 max-w-md w-full mx-6 text-center animate-slide-up ${
        passed ? 'border-accent pulse-glow' : 'border-red-500'
      }`}>
        <div className="mb-6">
          {passed ? (
            <div className="text-6xl mb-4 text-accent animate-pulse">✓</div>
          ) : (
            <div className="text-6xl mb-4 text-red-500 shake">✗</div>
          )}
          <h2 className={`text-3xl font-bold mb-3 ${passed ? 'text-accent' : 'text-red-500'}`}>
            {passed ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
          </h2>
          <p className="text-muted">
            {message || (passed 
              ? 'Proceeding to next verification stage...'
              : 'Human detection inconclusive. Please retry.'
            )}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          {!passed && onRetry && (
            <Button onClick={onRetry} variant="secondary">
              Retry Challenge
            </Button>
          )}
          {passed && onContinue && (
            <Button onClick={onContinue}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

