import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '../components/Button';
import { useApp } from '../contexts/AppContext';
import { useEffect } from 'react';

export const Route = createFileRoute('/complete')({
  component: CompletePage,
});

function CompletePage() {
  const navigate = useNavigate();
  const { state, resetProgress } = useApp();

  useEffect(() => {
    if (state.completedCaptchas.length < 6) {
      navigate({ to: '/' });
    }
  }, [state.completedCaptchas.length, navigate]);

  const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const handleRestart = () => {
    resetProgress();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-8 animate-fade-in">
          <div className="text-8xl mb-6 text-accent animate-pulse">✓</div>
          <h1 className="text-5xl font-bold text-accent mb-4 animate-slide-up">
            VERIFICATION COMPLETE
          </h1>
          <div className="h-1 w-32 bg-accent mx-auto mb-8 pulse-glow" />
          <p className="text-xl text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Congratulations. Your humanity has been successfully verified.
          </p>
        </div>

        <div className="bg-background border border-accent rounded-lg p-8 mb-8 pulse-glow animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="transition-transform hover:scale-105">
              <p className="text-sm text-muted uppercase mb-2">Verification Time</p>
              <p className="text-2xl font-bold text-accent tabular-nums">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="transition-transform hover:scale-105">
              <p className="text-sm text-muted uppercase mb-2">Challenges Passed</p>
              <p className="text-2xl font-bold text-accent">6 / 6</p>
            </div>
          </div>
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted uppercase mb-2">Status</p>
            <p className="text-lg font-semibold text-accent">VERIFIED HUMAN</p>
          </div>
        </div>

        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-muted text-sm">
            Your verification token has been generated and stored securely.
            Access to protected services is now granted.
          </p>
          <Button onClick={handleRestart} variant="secondary">
            Start New Verification
          </Button>
        </div>

        <p className="text-xs text-muted mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Session ID: {state.startTime.toString(36).toUpperCase()} | Valid for 24 hours
        </p>
      </div>
    </div>
  );
}

