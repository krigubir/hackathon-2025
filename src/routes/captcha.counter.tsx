import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/counter")({
  component: CounterCaptcha,
});

// Placeholder video - in production, replace with actual video URL
const VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const CORRECT_COUNT = 15; // The actual number of repetitions in the video
const ACCEPTABLE_RANGE = 2; // Allow ±2 margin of error

function CounterCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [stage, setStage] = useState<"instructions" | "playing" | "answering">(
    "instructions"
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || stage !== "playing") return;

    let speedIncrement = 0;
    const intervalId = setInterval(() => {
      speedIncrement += 0.3;
      const newSpeed = Math.min(1 + speedIncrement, 3.5);
      setPlaybackSpeed(newSpeed);
      video.playbackRate = newSpeed;
    }, 2000);

    const handleEnded = () => {
      setStage("answering");
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener("ended", handleEnded);
    };
  }, [stage]);

  const startVideo = () => {
    setStage("playing");
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

    const isCorrect =
      Math.abs(selectedAnswer - CORRECT_COUNT) <= ACCEPTABLE_RANGE;
    setPassed(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      markCaptchaComplete("counter", true);
    } else {
      incrementAttempts("counter");
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStage("instructions");
    setSelectedAnswer(null);
    setPlaybackSpeed(1);
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/identify" });
  };

  return (
    <CaptchaContainer
      title="REPETITION COUNT VERIFICATION"
      description="Count the number of times the action repeats in the video. The video will accelerate to test your attention span."
    >
      <div className="space-y-6">
        {stage === "instructions" && (
          <div className="text-center py-10 space-y-8">
            <p className="text-muted text-base max-w-3xl mx-auto">
              You will watch a short surveillance clip. Count every time the
              subject performs the assigned action. Expect exponential speed
              escalation.
            </p>
            <div className="gradient-border max-w-xl mx-auto">
              <div className="glass-panel p-6 text-left">
                <p className="text-xs uppercase tracking-[0.5em] text-accent-neon/70 mb-3">
                  Target Metric
                </p>
                <p className="text-2xl font-semibold text-accent-bright">
                  COUNT: Rabbit jumps
                </p>
              </div>
            </div>
            <Button onClick={startVideo}>Begin Video</Button>
          </div>
        )}

        {stage === "playing" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
              <span>Current Speed</span>
              <span className="text-accent-neon font-semibold text-lg">
                {playbackSpeed.toFixed(1)}x
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-card">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="h-full w-full object-cover"
                playsInline
                muted
              />
              <div className="absolute top-4 right-4 rounded-full bg-black/70 px-4 py-1 text-accent-bright text-sm font-semibold">
                {playbackSpeed.toFixed(1)}x
              </div>
            </div>
            <p className="text-center text-muted text-sm">
              Focus and count carefully. The video cannot be paused or replayed.
            </p>
          </div>
        )}

        {stage === "answering" && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold heading-glow mb-2">
                How many times did the rabbit jump?
              </h3>
              <p className="text-muted text-sm">Select your answer</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {answers.map((answer) => (
                <button
                  key={answer}
                  onClick={() => setSelectedAnswer(answer)}
                  className={`rounded-2xl border px-4 py-6 text-2xl font-semibold transition-all ${
                    selectedAnswer === answer
                      ? "border-accent-neon bg-accent-neon/10 text-accent-neon shadow-glow"
                      : "border-white/10 bg-white/5 text-foreground/80 hover:border-accent-bright/60"
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
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
