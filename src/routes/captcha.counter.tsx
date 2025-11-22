import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

import BunnyVideo from "../assets/masterpiece.mov";
import BunnyHappy from "../assets/bigbuckbunnyhappy.png";
import BunnyAngry from "../assets/bigbuckbunnyah.png";

export const Route = createFileRoute("/captcha/counter")({
  component: CounterCaptcha,
});

const CORRECT_COUNT = 92;

function CounterCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [stage, setStage] = useState(
    /** @type {"instructions" | "countdown" | "playing" | "answering" | "reaction"} */
    ("instructions")
  );

  const [countdown, setCountdown] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // -----------------------------------------
  // COUNTDOWN
  // -----------------------------------------
  useEffect(() => {
    if (stage !== "countdown") return;

    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setStage("playing");

          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 1;
              videoRef.current.play().catch(() => videoRef.current?.play());
            }
          }, 150);

          return 1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  // -----------------------------------------
  // END OF VIDEO → ANSWERING
  // -----------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || stage !== "playing") return;

    const handleEnded = () => {
      setStage("answering");
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [stage]);

  const beginWithCountdown = () => {
    setStage("countdown");
  };

  const answers = [
    CORRECT_COUNT + 41,
    CORRECT_COUNT,
    CORRECT_COUNT - 23,
    CORRECT_COUNT + 78,
    CORRECT_COUNT + 120,
  ];

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === CORRECT_COUNT;
    setPassed(isCorrect);
    setStage("reaction");

    if (isCorrect) {
      setTimeout(() => {
        markCaptchaComplete("counter", true);
        setShowResult(true);
      }, 2000);
    } else {
      incrementAttempts("counter");
      setTimeout(() => {
        handleRetry();
      }, 2000);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStage("instructions");
    setSelectedAnswer(null);
  };

  const handleContinue = () => {
    navigate({ to: "/complete" });
  };

  return (
    <CaptchaContainer
      title="REPETITION COUNT VERIFICATION"
      description="Count the number of times Big Buck Bunny skips rope."
    >
      <div className="space-y-6">
        {/* -----------------------------
            INSTRUCTIONS (VIDEO + START BUTTON)
        ------------------------------ */}
        {stage === "instructions" && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-card">
            <video
              src={BunnyVideo}
              className="h-full w-full object-cover opacity-60"
              muted
              playsInline
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="secondary"
                onClick={beginWithCountdown}
              >
                Start
              </Button>
            </div>
          </div>
        )}

        {/* -----------------------------
            COUNTDOWN (over video)
        ------------------------------ */}
        {stage === "countdown" && (
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-card">
            <video
              ref={videoRef}
              src={BunnyVideo}
              className="h-full w-full object-cover"
              muted
              playsInline
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-7xl font-extrabold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* -----------------------------
            PLAYING VIDEO
        ------------------------------ */}
        {stage === "playing" && (
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-card">
            <video
              ref={videoRef}
              src={BunnyVideo}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          </div>
        )}

        {/* -----------------------------
            ANSWERING
        ------------------------------ */}
        {stage === "answering" && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold heading-glow mb-2">
                How many times did Big Buck Bunny skip rope?
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

        {/* -----------------------------
            REACTION IMAGE
        ------------------------------ */}
        {stage === "reaction" && (
          <div className="flex items-center justify-center py-10">
            <img
              src={passed ? BunnyHappy : BunnyAngry}
              alt="Reaction"
              className={`max-h-80 object-contain animate-fade rounded-3xl ${
                passed
                  ? "shadow-[0_0_40px_10px_rgba(0,255,120,0.8)]"
                  : "shadow-[0_0_40px_10px_rgba(255,0,80,0.8)]"
              }`}
            />
          </div>
        )}
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={`Correct! The answer was ${CORRECT_COUNT}.`}
        />
      )}
    </CaptchaContainer>
  );
}

export default CounterCaptcha;
