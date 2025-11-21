import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '../components/Button';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { resetProgress } = useApp();

  const handleBegin = () => {
    resetProgress();
    navigate({ to: '/captcha/rhythm' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight animate-slide-up">
            HUMAN VERIFICATION SYSTEM
          </h1>
          <div className="h-1 w-32 bg-accent mx-auto mb-8 animate-pulse" />
          <p className="text-xl text-muted leading-relaxed mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            In an era of advanced artificial intelligence, verification of human identity
            has become a critical necessity.
          </p>
          <p className="text-lg text-muted leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            You will now undergo a series of <span className="text-accent font-semibold">six verification challenges</span> designed
            to confirm your biological humanity through cognitive and emotional responses
            that AI systems cannot replicate.
          </p>
        </div>

        <div className="bg-border/30 border border-border rounded-lg p-6 mb-10 animate-slide-up transition-all hover:border-accent/50" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-muted uppercase tracking-wide mb-2">System Notice</p>
          <p className="text-foreground">
            Failure to complete verification may result in restricted access to services.
            All attempts are monitored and recorded for security purposes.
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button onClick={handleBegin} className="text-lg px-10 py-4">
            BEGIN VERIFICATION
          </Button>
        </div>

        <p className="text-xs text-muted mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Protocol Version 3.7.2 | Compliance Level: MANDATORY
        </p>
      </div>
    </div>
  );
}

