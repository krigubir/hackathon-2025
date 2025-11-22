import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { Button } from "../components/Button";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/rhythm")({
  component: RhythmCaptcha,
});

interface Note {
  time: number;
  key: string;
  lane: number;
}

const KEYS = ["a", "s", "d", "f"];
const NOTE_SPEED = 2; // seconds to fall
const PASS_THRESHOLD = 0.7;
const TIMING_WINDOW = 0.15; // seconds
const KEY_ZONE_HEIGHT = 120;

function RhythmCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState({ hits: 0, misses: 0 });
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [padFlash, setPadFlash] = useState<boolean[]>(() =>
    Array(KEYS.length).fill(false)
  );

  const synthsRef = useRef<Tone.Synth[]>([]);
  const transportStartRef = useRef<number>(0);
  const notesProcessedRef = useRef<Set<number>>(new Set());
  const padFlashTimers = useRef<Array<ReturnType<typeof setTimeout> | null>>(
    Array(KEYS.length).fill(null)
  );

  useEffect(() => {
    // Initialize synths
    synthsRef.current = KEYS.map(() => new Tone.Synth().toDestination());

    // Create note pattern
    const pattern: Note[] = [];
    const measures = 4;
    const beatsPerMeasure = 4;
    const totalBeats = measures * beatsPerMeasure;

    for (let beat = 0; beat < totalBeats; beat++) {
      const lane = Math.floor(Math.random() * 4);
      pattern.push({
        time: beat * 0.5, // Half note intervals
        key: KEYS[lane],
        lane,
      });
    }

    setNotes(pattern);

    return () => {
      synthsRef.current.forEach((synth) => synth.dispose());
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      setCurrentTime(Tone.Transport.seconds - transportStartRef.current);
    }, 50);

    return () => clearInterval(intervalId);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const key = e.key.toLowerCase();
      if (!KEYS.includes(key) || pressedKeys.has(key)) return;

      setPressedKeys((prev) => new Set(prev).add(key));

      const lane = KEYS.indexOf(key);
      attemptHit(lane);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYS.includes(key)) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, notes]);

  const flashPad = (lane: number) => {
    setPadFlash((prev) => {
      const next = [...prev];
      next[lane] = true;
      return next;
    });

    if (padFlashTimers.current[lane]) {
      clearTimeout(padFlashTimers.current[lane]!);
    }

    padFlashTimers.current[lane] = setTimeout(() => {
      setPadFlash((prev) => {
        const next = [...prev];
        next[lane] = false;
        return next;
      });
      padFlashTimers.current[lane] = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      padFlashTimers.current.forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  const attemptHit = (lane: number) => {
    if (!isPlaying) return false;

    const currentGameTime = Tone.Transport.seconds - transportStartRef.current;
    let hitDetected = false;

    notes.forEach((note, index) => {
      if (note.lane === lane && !notesProcessedRef.current.has(index)) {
        const notePosition = note.time;
        const timeDiff = Math.abs(currentGameTime - notePosition);

        if (timeDiff < TIMING_WINDOW) {
          notesProcessedRef.current.add(index);
          setScore((prev) => ({ ...prev, hits: prev.hits + 1 }));
          hitDetected = true;
          synthsRef.current[lane].triggerAttackRelease("C4", "8n");
        }
      }
    });

    if (hitDetected) {
      flashPad(lane);
    } else {
      setScore((prev) => ({ ...prev, misses: prev.misses + 1 }));
    }

    return hitDetected;
  };

  const handlePadClick = (lane: number) => {
    attemptHit(lane);
  };

  const startGame = async () => {
    await Tone.start();
    setIsPlaying(true);
    setScore({ hits: 0, misses: 0 });
    notesProcessedRef.current.clear();

    transportStartRef.current = Tone.Transport.seconds;

    // Schedule notes to play as audio cues
    notes.forEach((note) => {
      Tone.Transport.schedule(() => {
        synthsRef.current[note.lane].triggerAttackRelease("C4", "16n");
      }, `+${note.time}`);
    });

    Tone.Transport.start();

    // End game after all notes have passed
    const gameDuration = (notes[notes.length - 1].time + NOTE_SPEED) * 1000;
    setTimeout(() => {
      endGame();
    }, gameDuration);
  };

  const endGame = () => {
    setIsPlaying(false);
    Tone.Transport.stop();
    Tone.Transport.cancel();

    const totalNotes = notes.length;
    const accuracy = score.hits / totalNotes;
    const didPass = accuracy >= PASS_THRESHOLD;

    setPassed(didPass);
    setShowResult(true);

    if (didPass) {
      markCaptchaComplete("rhythm", true, accuracy);
    } else {
      incrementAttempts("rhythm");
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setScore({ hits: 0, misses: 0 });
    setCurrentTime(0);
    notesProcessedRef.current.clear();
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/counter" });
  };

  const getVisibleNotes = () => {
    return notes.filter((note) => {
      const notePosition = (currentTime - note.time) / NOTE_SPEED;
      return notePosition >= -0.1 && notePosition <= 1;
    });
  };

  return (
    <CaptchaContainer
      title="RHYTHM VERIFICATION"
      description="Press the corresponding keys (A, S, D, F) when the notes reach the target line. Achieve 70% accuracy to pass."
    >
      <div className="space-y-6">
        {!isPlaying ? (
          <div className="text-center py-12">
            <div className="mb-8 space-y-6">
              <p className="text-muted">
                This test verifies human rhythm perception and motor
                coordination.
              </p>
              <div className="flex justify-center gap-4">
                {KEYS.map((key) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border-glow/40 bg-white/5 px-6 py-3 text-xl font-bold uppercase text-accent-bright shadow-glow"
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={startGame}>Start Test</Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
              <span>
                Hits: <span className="text-accent">{score.hits}</span>
              </span>
              <span>
                Misses: <span className="text-rose-400">{score.misses}</span>
              </span>
            </div>

            <div className="relative h-96 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-card">
              <div className="absolute inset-0">
                {/* Falling area */}
                <div
                  className="absolute left-0 right-0 top-0"
                  style={{ bottom: KEY_ZONE_HEIGHT }}
                >
                  <div className="flex h-full">
                    {KEYS.map((key) => (
                      <div
                        key={key}
                        className={`relative flex-1 border-r border-white/10 last:border-r-0 overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-black/25 opacity-50" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    {getVisibleNotes().map((note) => {
                      const progress = (currentTime - note.time) / NOTE_SPEED;
                      const top = progress * 100;
                      const noteIndex = notes.indexOf(note);
                      const processed =
                        notesProcessedRef.current.has(noteIndex);

                      return (
                        <div
                          key={noteIndex}
                          className={`absolute w-1/4 transition-all duration-150 ${
                            processed
                              ? "opacity-0 translate-y-4"
                              : "opacity-100"
                          }`}
                          style={{
                            left: `${note.lane * 25}%`,
                            top: `${top}%`,
                          }}
                        >
                          <div className="mx-auto h-16 w-4/5 rounded-full bg-gradient-to-b from-accent-bright to-accent-neon shadow-[0_0_36px_rgba(70,240,255,0.6)]" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Receptor strip */}
                <div
                  className="absolute left-0 right-0 z-30 flex items-end"
                  style={{ height: KEY_ZONE_HEIGHT }}
                >
                  <div className="absolute inset-x-4 bottom-16 h-4 rounded-full bg-gradient-to-r from-accent/40 via-accent-neon/60 to-accent/40 blur-md opacity-70" />
                  {KEYS.map((key) => (
                    <div
                      key={key}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="relative mb-3 h-6 w-16 rounded-full border border-accent-neon/60 bg-black/70 shadow-[0_0_25px_rgba(70,240,255,0.6)]" />
                    </div>
                  ))}
                </div>

                {/* Key zone */}
                <div
                  className="absolute left-0 right-0 bottom-0 flex items-end"
                  style={{ height: KEY_ZONE_HEIGHT }}
                >
                  {KEYS.map((key, index) => (
                    <div key={key} className="flex-1 pb-4 text-center">
                      <button
                        type="button"
                        onMouseDown={() => handlePadClick(index)}
                        onTouchStart={() => handlePadClick(index)}
                        className={`w-16 rounded-2xl px-5 py-3 font-bold text-lg uppercase transition-transform ${
                          pressedKeys.has(key) || padFlash[index]
                            ? "bg-gradient-to-r from-accent to-accent-bright text-background scale-110 shadow-glow"
                            : "bg-white/5 text-foreground/90"
                        }`}
                        aria-label={`Activate ${key.toUpperCase()} lane`}
                      >
                        {key}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
              ? `Accuracy: ${Math.round((score.hits / notes.length) * 100)}%`
              : `Insufficient accuracy: ${Math.round((score.hits / notes.length) * 100)}%. Required: 70%`
          }
        />
      )}
    </CaptchaContainer>
  );
}
