import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";
import moodVideo from "../assets/mood-video.mov";

export const Route = createFileRoute("/captcha/emotion")({
  component: EmotionCaptcha,
});

type Emotion = "happy" | "sad" | "angry" | "fearful" | "surprised" | "neutral";

interface EmotionChallenge {
  correctEmotion: Emotion;
  description: string;
}

const VIDEO_OPTIONS: Array<{ value: Emotion; label: string }> = [
  {
    value: "angry",
    label:
      "Simmering resentment—voices raised, brows furrowed, both partners rigid as they contest the bill.",
  },
  {
    value: "fearful",
    label:
      "Restrained panic—one partner glances around the bar, worried the dispute will spiral or draw attention.",
  },
  {
    value: "sad",
    label:
      "Wounded disappointment—hurt eyes and sighs imply the argument is really about unmet expectations.",
  },
  {
    value: "surprised",
    label:
      "Incredulous shock—brows shoot up as if blindsided that who-pays-now became a public confrontation.",
  },
  {
    value: "neutral",
    label:
      "Calculated detachment—voices kept flat, as though each partner is coldly negotiating the bill split.",
  },
];

function EmotionCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  // In production, use actual human face images
  const [challenge] = useState<EmotionChallenge>({
    correctEmotion: "neutral",
    description:
      "Calculated detachment—voices kept flat, as though each partner is coldly negotiating the bill split.",
  });

  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);

  const handleSubmit = () => {
    if (selectedEmotion === null) return;

    const isCorrect = selectedEmotion === challenge.correctEmotion;
    setPassed(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      markCaptchaComplete("emotion", true);
    } else {
      incrementAttempts("emotion");
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setSelectedEmotion(null);
  };

  const handleContinue = () => {
    navigate({ to: "/complete" });
  };

  return (
    <CaptchaContainer
      title="EMOTIONAL RECOGNITION VERIFICATION"
      description="Identify the emotion displayed in the human face. This verifies your capacity for emotional intelligence."
    >
      <div className="space-y-8">
        <div className="gradient-border max-w-2xl mx-auto">
          <div className="glass-panel p-6 text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-accent-neon/70">
              Human Expression Feed
            </p>
            <p className="text-accent-bright font-semibold">
              Observe the subject carefully
            </p>
            <p className="text-muted text-sm max-w-xl mx-auto">
              The verification clip must be watched in its entirety before a
              response can be submitted. Pay close attention to
              micro-expressions and mood shifts.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15  p-4">
            <video
              className="w-full rounded-2xl border border-white/10"
              src={moodVideo}
              controls
              onEnded={() => {
                setVideoComplete(true);
              }}
            />
          </div>
        </div>

        {videoComplete ? (
          <form
            className="space-y-6 max-w-xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <legend className="text-sm uppercase tracking-[0.4em] text-accent-neon/70 px-2">
                Select the dominant emotion
              </legend>
              {VIDEO_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 hover:border-accent-neon/40 transition"
                >
                  <input
                    type="radio"
                    name="emotion"
                    value={option.value}
                    checked={selectedEmotion === option.value}
                    onChange={() => setSelectedEmotion(option.value)}
                    className="h-4 w-4 accent-accent-neon"
                  />
                  <span className="text-foreground/90">{option.label}</span>
                </label>
              ))}
            </fieldset>

            <div className="text-center">
              <Button
                onClick={handleSubmit}
                disabled={selectedEmotion === null}
              >
                Submit Answer
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-muted">
            Complete the clip before responding. Replay is permitted if clarity
            is required.
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-muted text-xs text-center">
            💡 This test validates your ability to recognize and interpret human
            emotions, a distinctly human capability that AI systems cannot
            authentically replicate.
          </p>
        </div>
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={
            passed
              ? "Correct! Emotional intelligence verified."
              : `Incorrect. Your empathy signature is non-compliant. A human's emotional assessment should be immediate. Your response deviates 14% from the 'Optimal Human Baseline.' Please try again.`
          }
        />
      )}
    </CaptchaContainer>
  );
}
