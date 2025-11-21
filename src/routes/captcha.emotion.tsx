import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CaptchaContainer } from '../components/CaptchaContainer';
import { Button } from '../components/Button';
import { ResultScreen } from '../components/ResultScreen';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/captcha/emotion')({
  component: EmotionCaptcha,
});

type Emotion = 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'neutral';

interface EmotionChallenge {
  imageUrl: string;
  correctEmotion: Emotion;
  description: string;
}

const EMOTIONS: Emotion[] = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'neutral'];

const EMOTION_LABELS: Record<Emotion, string> = {
  happy: '😊 Happy',
  sad: '😢 Sad',
  angry: '😠 Angry',
  fearful: '😨 Fearful',
  surprised: '😲 Surprised',
  neutral: '😐 Neutral',
};

function EmotionCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();
  
  // In production, use actual human face images
  const [challenge] = useState<EmotionChallenge>({
    imageUrl: 'https://picsum.photos/400/400?random=emotion',
    correctEmotion: 'happy',
    description: 'A person showing genuine happiness',
  });

  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  const handleSubmit = () => {
    if (selectedEmotion === null) return;

    const isCorrect = selectedEmotion === challenge.correctEmotion;
    setPassed(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      markCaptchaComplete('emotion', true);
    } else {
      incrementAttempts('emotion');
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setSelectedEmotion(null);
  };

  const handleContinue = () => {
    navigate({ to: '/complete' });
  };

  return (
    <CaptchaContainer
      title="EMOTIONAL RECOGNITION VERIFICATION"
      description="Identify the emotion displayed in the human face. This verifies your capacity for emotional intelligence."
    >
      <div className="space-y-6">
        <div className="bg-accent/10 border border-accent/30 rounded p-4 text-center">
          <p className="text-accent font-semibold">
            What emotion is this person expressing?
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <img
              src={challenge.imageUrl}
              alt="Face showing emotion"
              className="w-full rounded-lg border-2 border-border"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">😊</div>
                <p className="text-muted text-sm">
                  In production: Use actual human face image
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`py-4 px-6 rounded-lg border-2 transition-all text-left ${
                selectedEmotion === emotion
                  ? 'border-accent bg-accent/20 text-accent scale-95'
                  : 'border-border hover:border-accent/50 text-foreground'
              }`}
            >
              <div className="text-2xl mb-1">
                {EMOTION_LABELS[emotion].split(' ')[0]}
              </div>
              <div className="text-sm font-medium">
                {EMOTION_LABELS[emotion].split(' ')[1]}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={selectedEmotion === null}
          >
            Submit Answer
          </Button>
        </div>

        <div className="bg-border/30 rounded p-4">
          <p className="text-muted text-xs text-center">
            💡 This test validates your ability to recognize and interpret human emotions,
            a distinctly human capability that AI systems cannot authentically replicate.
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
              ? 'Correct! Emotional intelligence verified.'
              : `Incorrect. The correct answer was ${EMOTION_LABELS[challenge.correctEmotion]}.`
          }
        />
      )}
    </CaptchaContainer>
  );
}

