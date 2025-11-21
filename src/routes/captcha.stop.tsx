import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { CaptchaContainer } from '../components/CaptchaContainer';
import { Button } from '../components/Button';
import { ResultScreen } from '../components/ResultScreen';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/captcha/stop')({
  component: StopCaptcha,
});

const BAR_WIDTH = 600;
const TARGET_SIZE = 60;
const TARGET_POSITION = (BAR_WIDTH - TARGET_SIZE) / 2;
const SPEED = 4; // pixels per frame
const TOLERANCE = 30; // pixels

function StopCaptcha() {
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
      if (e.code === 'Space' && isActive) {
        e.preventDefault();
        handleStop();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
      markCaptchaComplete('stop', true, 100 - distance);
    } else {
      incrementAttempts('stop');
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStoppedPosition(null);
  };

  const handleContinue = () => {
    navigate({ to: '/captcha/emotion' });
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
          <div className="text-center py-8">
            <div className="mb-8">
              <p className="text-muted mb-4">
                A bar will move rapidly across the screen. You must stop it precisely within the target zone.
              </p>
              <p className="text-accent font-semibold mb-2">Press SPACEBAR to stop</p>
              <p className="text-muted text-sm">
                This tests human reaction time and precision that AI systems struggle to replicate naturally.
              </p>
            </div>
            <Button onClick={startTest}>
              {attempts > 0 ? 'Try Again' : 'Start Test'}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-border/20 rounded-lg p-4 text-center">
              <p className="text-muted text-sm mb-2">Attempts: <span className="text-accent">{attempts}</span></p>
              {isActive && (
                <p className="text-accent font-bold text-lg animate-pulse">
                  Press SPACEBAR to stop!
                </p>
              )}
            </div>

            <div className="max-w-3xl mx-auto">
              <div
                className="relative bg-border/20 rounded-lg"
                style={{ height: '120px' }}
              >
                {/* Target zone */}
                <div
                  className="absolute top-0 bottom-0 bg-accent/20 border-2 border-accent"
                  style={{
                    left: `${TARGET_POSITION}px`,
                    width: `${TARGET_SIZE}px`,
                  }}
                >
                  <div className="h-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">TARGET</span>
                  </div>
                </div>

                {/* Moving bar */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-24 w-5 rounded transition-colors ${
                    isActive ? 'bg-accent' : stoppedPosition !== null ? 'bg-foreground' : 'bg-accent'
                  }`}
                  style={{
                    left: `${stoppedPosition !== null ? stoppedPosition : position}px`,
                  }}
                />

                {/* Center line indicator */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-accent-light opacity-50"
                  style={{ left: `${TARGET_POSITION + TARGET_SIZE / 2}px` }}
                />
              </div>

              {stoppedPosition !== null && !showResult && (
                <div className="mt-4 text-center animate-fade-in">
                  <p className="text-foreground text-lg mb-2">
                    Accuracy: <span className="text-accent font-bold">{getAccuracy().toFixed(1)}%</span>
                  </p>
                  <Button onClick={startTest} variant="secondary">
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-border/30 rounded p-3 text-center">
              <p className="text-muted text-xs">
                💡 Focus on the target zone. React quickly when the bar approaches.
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

