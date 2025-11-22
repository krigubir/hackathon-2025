import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { Button } from "../components/Button";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/rhythm")({
  component: RhythmCaptcha,
});

type NoteStatus = "pending" | "hit" | "missed";

interface Note {
  id: number;
  lane: number;
  spawnTime: number;
  hitTime: number;
  status: NoteStatus;
}

const KEYS = ["a", "s", "d", "f"];
const TOTAL_NOTES = 16;
const NOTE_INTERVAL = 0.85; // seconds between hits
const NOTE_TRAVEL_TIME = 1.8; // seconds from spawn to receptor
const TIMING_WINDOW = 0.18; // allowable error in seconds
const PASS_THRESHOLD = 0.7;
const KEY_ZONE_HEIGHT = 120;

const createPattern = (): Note[] => {
  const pattern: Note[] = [];
  for (let i = 0; i < TOTAL_NOTES; i++) {
    const lane = Math.floor(Math.random() * KEYS.length);
    const hitTime = NOTE_TRAVEL_TIME + i * NOTE_INTERVAL;
    const spawnTime = hitTime - NOTE_TRAVEL_TIME;
    pattern.push({
      id: i,
      lane,
      spawnTime,
      hitTime,
      status: "pending",
    });
  }
  return pattern;
};

function RhythmCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState({ hits: 0, misses: 0 });
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [padFlash, setPadFlash] = useState<boolean[]>(() =>
    Array(KEYS.length).fill(false)
  );

  const synthsRef = useRef<Tone.Synth[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const songDurationRef = useRef<number>(0);
  const elapsedRef = useRef(0);
  const notesRef = useRef<Note[]>([]);
  const padFlashTimers = useRef<Array<ReturnType<typeof setTimeout> | null>>(
    Array(KEYS.length).fill(null)
  );

  useEffect(() => {
    synthsRef.current = KEYS.map(() =>
      new Tone.Synth({
        envelope: { attack: 0.005, release: 0.2 },
      }).toDestination()
    );
    return () => {
      synthsRef.current.forEach((synth) => synth.dispose());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      padFlashTimers.current.forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

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
    }, 160);
  };

  const stopLoop = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const finalizeNotes = (list: Note[]) => {
    let mutated = false;
    const updated = list.map((note): Note => {
      if (note.status === "pending") {
        mutated = true;
        return { ...note, status: "missed" as NoteStatus };
      }
      return note;
    });
    return mutated ? updated : list;
  };

  const endGame = () => {
    stopLoop();
    setIsPlaying(false);
    setNotes((prev) => {
      const finalNotes = finalizeNotes(prev);
      const hits = finalNotes.filter((note) => note.status === "hit").length;
      const total = finalNotes.length || 1;
      const misses = total - hits;
      const accuracy = hits / total;
      setScore({ hits, misses });
      const didPass = accuracy >= PASS_THRESHOLD;
      setPassed(didPass);
      setShowResult(true);
      if (didPass) {
        markCaptchaComplete("rhythm", true, accuracy);
      } else {
        incrementAttempts("rhythm");
      }
      return finalNotes;
    });
  };

  const runLoop = () => {
    const now = performance.now() / 1000;
    const elapsedSeconds = now - startTimeRef.current;
    elapsedRef.current = elapsedSeconds;
    setElapsed(elapsedSeconds);

    if (elapsedSeconds >= songDurationRef.current) {
      endGame();
      return;
    }
    animationFrameRef.current = requestAnimationFrame(runLoop);
  };

  const startGame = async () => {
    await Tone.start();
    const pattern = createPattern();
    songDurationRef.current =
      (pattern[pattern.length - 1]?.hitTime ?? 0) + NOTE_INTERVAL;
    notesRef.current = pattern;
    setNotes(pattern);
    setScore({ hits: 0, misses: 0 });
    setShowResult(false);
    setPassed(false);
    setElapsed(0);
    elapsedRef.current = 0;
    startTimeRef.current = performance.now() / 1000;
    setIsPlaying(true);
    stopLoop();
    animationFrameRef.current = requestAnimationFrame(runLoop);
  };

  const attemptHit = (lane: number) => {
    if (!isPlaying) return;
    setNotes((prev) => {
      let hit = false;
      const next: Note[] = prev.map((note): Note => {
        if (
          !hit &&
          note.lane === lane &&
          note.status === "pending" &&
          Math.abs(elapsedRef.current - note.hitTime) <= TIMING_WINDOW
        ) {
          hit = true;
          return { ...note, status: "hit" as NoteStatus };
        }
        return note;
      });

      if (hit) {
        setScore((s) => ({ ...s, hits: s.hits + 1 }));
        flashPad(lane);
        synthsRef.current[lane]?.triggerAttackRelease("C4", "16n");
        return next;
      }
      setScore((s) => ({ ...s, misses: s.misses + 1 }));
      return prev;
    });
  };

  useEffect(() => {
    if (!isPlaying) return;
    setNotes((prev) => {
      let misses = 0;
      const next: Note[] = prev.map((note): Note => {
        if (
          note.status === "pending" &&
          elapsedRef.current > note.hitTime + TIMING_WINDOW
        ) {
          misses++;
          return { ...note, status: "missed" as NoteStatus };
        }
        return note;
      });
      if (misses > 0) {
        setScore((s) => ({ ...s, misses: s.misses + misses }));
        return next;
      }
      return prev;
    });
  }, [elapsed, isPlaying]);

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
      if (!KEYS.includes(key)) return;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, pressedKeys]);

  useEffect(() => {
    if (!isPlaying) return;
    if (notes.length > 0 && score.hits + score.misses >= notes.length) {
      endGame();
    }
  }, [score, notes.length, isPlaying]);

  const visibleNotes = useMemo(() => {
    return notes.filter((note) => {
      if (note.status === "hit" && elapsed > note.hitTime + 0.35) {
        return false;
      }
      return elapsed >= note.spawnTime - 0.2 && elapsed <= note.hitTime + 0.6;
    });
  }, [notes, elapsed]);

  const handlePadClick = (lane: number) => {
    attemptHit(lane);
  };

  const handleRetry = () => {
    setShowResult(false);
    setScore({ hits: 0, misses: 0 });
    setNotes([]);
    setElapsed(0);
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/counter" });
  };

  return (
    <CaptchaContainer
      title="RHYTHM VERIFICATION"
      description="Strike the corresponding key (A, S, D, F) when each pulse reaches the receptor strip. Achieve 70% accuracy to pass."
    >
      <div className="space-y-6">
        {!isPlaying ? (
          <div className="text-center py-12 space-y-6">
            <p className="text-muted">
              Human rhythm recognition requires anticipatory timing. Follow the
              falling signals and sync with the line.
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
                <div
                  className="absolute left-0 right-0 top-0"
                  style={{ bottom: KEY_ZONE_HEIGHT }}
                >
                  <div className="flex h-full">
                    {KEYS.map((key) => (
                      <div
                        key={key}
                        className="relative flex-1 border-r border-white/10 last:border-r-0 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-black/30 opacity-50" />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    {visibleNotes.map((note) => {
                      const travel =
                        (elapsed - note.spawnTime) / NOTE_TRAVEL_TIME;
                      const top = Math.min(100, Math.max(0, travel * 100));
                      const faded = note.status === "hit";
                      return (
                        <div
                          key={note.id}
                          className={`absolute w-1/4 transition-all duration-150 ${
                            faded ? "opacity-40 scale-95" : "opacity-100"
                          }`}
                          style={{
                            left: `${note.lane * 25}%`,
                            top: `${top}%`,
                          }}
                        >
                          <div
                            className={`mx-auto h-16 w-4/5 rounded-full ${
                              faded
                                ? "bg-linear-to-b from-emerald-400 to-accent-neon"
                                : "bg-linear-to-b from-accent-bright to-accent-neon"
                            } shadow-[0_0_36px_rgba(70,240,255,0.55)]`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="absolute left-0 right-0 z-30 flex items-end"
                  style={{ height: KEY_ZONE_HEIGHT }}
                >
                  <div className="absolute inset-x-4 bottom-16 h-4 rounded-full bg-linear-to-r from-accent/40 via-accent-neon/60 to-accent/40 blur-md opacity-70" />
                  {KEYS.map((key) => (
                    <div
                      key={key}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="relative mb-3 h-6 w-16 rounded-full border border-accent-neon/60 bg-black/70 shadow-[0_0_25px_rgba(70,240,255,0.6)]" />
                    </div>
                  ))}
                </div>

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
                            ? "bg-linear-to-r from-accent to-accent-bright text-background scale-110 shadow-glow"
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
              ? `Accuracy: ${Math.round(
                  (score.hits / (notes.length || 1)) * 100
                )}%`
              : `Insufficient accuracy: ${Math.round(
                  (score.hits / (notes.length || 1)) * 100
                )}%. Required: 70%`
          }
        />
      )}
    </CaptchaContainer>
  );
}
