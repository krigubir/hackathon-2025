import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { CaptchaContainer } from '../components/CaptchaContainer';
import { Button } from '../components/Button';
import { ResultScreen } from '../components/ResultScreen';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/captcha/counter')({
  component: CounterCaptcha,
});

// Placeholder video - in production, replace with actual video URL
const VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const CORRECT_COUNT = 15; // The actual number of repetitions in the video
const ACCEPTABLE_RANGE = 2; // Allow ±2 margin of error

function CounterCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();
  
  const [stage, setStage] = useState<'instructions' | 'playing' | 'answering'>('instructions');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || stage !== 'playing') return;

    let speedIncrement = 0;
    const intervalId = setInterval(() => {
      speedIncrement += 0.3;
      const newSpeed = Math.min(1 + speedIncrement, 3.5);
      setPlaybackSpeed(newSpeed);
      video.playbackRate = newSpeed;
    }, 2000);

    const handleEnded = () => {
      setStage('answering');
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener('ended', handleEnded);
    };
  }, [stage]);

  const startVideo = () => {
    setStage('playing');
    setPlaybackSpeed(1);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      videoRef.current.play();
    }
  };

  const answers = [
    CORRECT_COUNT - 5,
    CORRECT_COUNT - 2,
    CORRECT_COUNT,
    CORRECT_COUNT + 3,
    CORRECT_COUNT + 7,
  ].sort(() => Math.random() - 0.5);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = Math.abs(selectedAnswer - CORRECT_COUNT) <= ACCEPTABLE_RANGE;
    setPassed(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      markCaptchaComplete('counter', true);
    } else {
      incrementAttempts('counter');
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStage('instructions');
    setSelectedAnswer(null);
    setPlaybackSpeed(1);
  };

  const handleContinue = () => {
    navigate({ to: '/captcha/identify' });
  };

  return (
    <CaptchaContainer
      title="REPETITION COUNT VERIFICATION"
      description="Count the number of times the action repeats in the video. The video will accelerate to test your attention span."
    >
      <div className="space-y-6">
        {stage === 'instructions' && (
          <div className="text-center py-8">
            <div className="mb-8">
              <p className="text-muted mb-4">
                You will watch a short video clip. Count how many times the specified action occurs.
              </p>
              <p className="text-muted mb-4">
                Warning: Video playback will accelerate progressively to extreme speeds.
              </p>
              <div className="bg-accent/10 border border-accent/30 rounded p-4 mt-6">
                <p className="text-accent font-semibold">COUNT: Rabbit jumps</p>
              </div>
            </div>
            <Button onClick={startVideo}>Begin Video</Button>
          </div>
        )}

        {stage === 'playing' && (
          <div className="space-y-4">
            <div className="bg-border/20 rounded-lg p-3 flex justify-between items-center">
              <span className="text-muted text-sm">Current Speed:</span>
              <span className="text-accent font-bold">{playbackSpeed.toFixed(1)}x</span>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full"
                playsInline
                muted
              />
              <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 rounded text-accent text-sm font-bold">
                {playbackSpeed.toFixed(1)}x
              </div>
            </div>
            <p className="text-center text-muted text-sm">
              Focus and count carefully. The video cannot be paused or replayed.
            </p>
          </div>
        )}

        {stage === 'answering' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                How many times did the rabbit jump?
              </h3>
              <p className="text-muted text-sm">Select your answer below</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {answers.map((answer) => (
                <button
                  key={answer}
                  onClick={() => setSelectedAnswer(answer)}
                  className={`py-6 rounded-lg border-2 transition-all ${
                    selectedAnswer === answer
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-border hover:border-accent/50 text-foreground'
                  }`}
                >
                  <div className="text-3xl font-bold">{answer}</div>
                </button>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            </div>
          </div>
        )}
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={
            passed
              ? `Correct! The answer was ${CORRECT_COUNT}.`
              : `Incorrect. The correct answer was ${CORRECT_COUNT}.`
          }
        />
      )}
    </CaptchaContainer>
  );
}

