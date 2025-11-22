import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";
export const Route = createFileRoute("/captcha/rhythm")({
  component: RhythmCaptcha,
});

type FlashState = "none" | "hit" | "miss";
type Note = { id: number; lane: number; y: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  hue: number;
};

const LANES = ["A", "S", "D", "F"];
const GAME_HEIGHT = 520;
const RECEPTOR_Y = 380;
const HIT_WINDOW = 38;
const NOTE_SPEED = 180; // px / s
const NOTE_INTERVAL = 900; // ms
const TOTAL_NOTES = 30;
const PASS_TARGET = 18;

function RhythmCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [flash, setFlash] = useState<FlashState[]>(() =>
    Array(LANES.length).fill("none")
  );

  const notesRef = useRef<Note[]>([]);
  const hitsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const spawnedRef = useRef(0);
  const spawnFinishedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const setNotesSafe = (updater: (prev: Note[]) => Note[]) => {
    setNotes((prev) => {
      const next = updater(prev);
      notesRef.current = next;
      return next;
    });
  };

  const cleanup = () => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastFrameRef.current = null;
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const resumeAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      audioCtxRef.current.resume();
      window.removeEventListener("pointerdown", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
    };
    window.addEventListener("pointerdown", resumeAudio);
    window.addEventListener("keydown", resumeAudio);
    return () => {
      window.removeEventListener("pointerdown", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
    };
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    spawnedRef.current = 0;
    spawnFinishedRef.current = false;
    spawnTimerRef.current = window.setInterval(() => {
      if (spawnedRef.current >= TOTAL_NOTES) {
        spawnFinishedRef.current = true;
        if (spawnTimerRef.current) {
          clearInterval(spawnTimerRef.current);
          spawnTimerRef.current = null;
        }
        return;
      }
      spawnedRef.current += 1;
      const lane = Math.floor(Math.random() * LANES.length);
      setNotesSafe((prev) => [
        ...prev,
        { id: Date.now() + lane + prev.length, lane, y: -40 },
      ]);
    }, NOTE_INTERVAL);

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    const loop = (timestamp: number) => {
      if (status !== "running") return;
      if (lastFrameRef.current == null) lastFrameRef.current = timestamp;
      const dt = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      setNotesSafe((prev) => {
        const updated: Note[] = [];
        const missedLanes: number[] = [];
        for (const note of prev) {
          const nextY = note.y + NOTE_SPEED * dt;
          if (nextY > RECEPTOR_Y + HIT_WINDOW) {
            missedLanes.push(note.lane);
            continue;
          }
          updated.push({ ...note, y: nextY });
        }
        if (missedLanes.length > 0) {
          setCombo(0);
          setMisses((m) => m + missedLanes.length);
          missedLanes.forEach((lane) => {
            flashLane(lane, "miss");
            spawnMissParticles(lane);
            playPluck("miss");
          });
        }
        return updated;
      });

      updateParticles(dt);

      const finished =
        spawnFinishedRef.current && notesRef.current.length === 0;
      if (finished) {
        conclude(hitsRef.current >= PASS_TARGET);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    const handler = (e: KeyboardEvent) => {
      const lane = LANES.indexOf(e.key.toUpperCase());
      if (lane === -1) return;
      handleHit(lane);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const startChallenge = () => {
    cleanup();
    setNotes([]);
    notesRef.current = [];
    setScore(0);
    setCombo(0);
    setHits(0);
    hitsRef.current = 0;
    setMisses(0);
    setShowResult(false);
    setPassed(false);
    particlesRef.current = [];
    spawnedRef.current = 0;
    spawnFinishedRef.current = false;
    setStatus("running");
  };

  const conclude = (didPass: boolean) => {
    cleanup();
    setStatus("complete");
    setPassed(didPass);
    setShowResult(true);
    if (didPass) {
      markCaptchaComplete("rhythm", true, score);
    } else {
      incrementAttempts("rhythm");
    }
  };

  const handleHit = (lane: number) => {
    const candidates = notesRef.current.filter((note) => note.lane === lane);
    let target: Note | null = null;
    let bestDistance = Infinity;
    for (const note of candidates) {
      const distance = Math.abs(note.y - RECEPTOR_Y);
      if (distance <= HIT_WINDOW && distance < bestDistance) {
        bestDistance = distance;
        target = note;
      }
    }
    if (target) {
      const targetId = target.id;
      setNotesSafe((prev) => prev.filter((note) => note.id !== targetId));
      setScore((s) => s + 120 + combo * 8);
      setCombo((c) => c + 1);
      setHits((h) => h + 1);
      flashLane(lane, "hit");
      spawnHitParticles(lane);
      playPluck("hit");
      if (hitsRef.current + 1 >= PASS_TARGET) {
        conclude(true);
      }
    } else {
      setCombo(0);
      setMisses((m) => m + 1);
      flashLane(lane, "miss");
      spawnMissParticles(lane);
      playPluck("miss");
    }
  };

  const flashLane = (lane: number, state: FlashState) => {
    setFlash((prev) => {
      const next = [...prev];
      next[lane] = state;
      return next;
    });
    window.setTimeout(() => {
      setFlash((prev) => {
        const next = [...prev];
        next[lane] = "none";
        return next;
      });
    }, 220);
  };

  const playPluck = (type: "hit" | "miss") => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = type === "hit" ? 240 : 140;
    osc.type = "sawtooth";
    osc.frequency.value = base * (1 + Math.random() * 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      type === "hit" ? 0.5 : 0.25,
      now + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.45);
  };

  const laneCenter = (lane: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: RECEPTOR_Y };
    const rect = canvas.getBoundingClientRect();
    const laneWidth = rect.width / LANES.length;
    return { x: lane * laneWidth + laneWidth / 2, y: RECEPTOR_Y };
  };

  const spawnHitParticles = (lane: number) => {
    const { x, y } = laneCenter(lane);
    const total = 18;
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 * i) / total + (Math.random() - 0.5) * 0.4;
      const speed = 100 + Math.random() * 200;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * -1,
        life: 0.8 + Math.random() * 0.5,
        age: 0,
        size: 4 + Math.random() * 4,
        hue: 190 + Math.random() * 40,
      });
    }
  };

  const spawnMissParticles = (lane: number) => {
    const { x, y } = laneCenter(lane);
    const total = 10;
    for (let i = 0; i < total; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 1.1;
      const speed = 60 + Math.random() * 120;
      particlesRef.current.push({
        x,
        y: y + 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * -1,
        life: 0.5 + Math.random() * 0.3,
        age: 0,
        size: 2 + Math.random() * 3,
        hue: 10 + Math.random() * 25,
      });
    }
  };

  const updateParticles = (dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gravity = 260;
    const survivors: Particle[] = [];
    for (const particle of particlesRef.current) {
      const age = particle.age + dt;
      if (age >= particle.life) continue;
      const t = age / particle.life;
      const alpha = Math.max(0, 1 - t);
      const size = particle.size * (1 - t * 0.4);
      const vy = particle.vy + gravity * dt;
      const vx = particle.vx;
      const x = particle.x + vx * dt;
      const y = particle.y + vy * dt;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsl(${particle.hue} 90% 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      survivors.push({
        ...particle,
        age,
        x,
        y,
        vx,
        vy,
      });
    }
    particlesRef.current = survivors;
    ctx.globalAlpha = 1;
  };

  const visibleNotes = useMemo(() => {
    return notes.filter((note) => note.y <= GAME_HEIGHT + 40);
  }, [notes]);

  const progressPercent = Math.min(100, Math.round((hits / PASS_TARGET) * 100));

  return (
    <CaptchaContainer
      title="RHYTHM VERIFICATION"
      description="Strike the illuminated lane the instant each pulse intersects the receptor strip. Sustain human-grade timing."
    >
      <div className="space-y-6">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent-neon/70">
              Score
            </p>
            <p className="text-3xl font-semibold text-accent-bright tabular-nums">
              {score}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent-neon/70">
              Combo
            </p>
            <p className="text-3xl font-semibold text-foreground tabular-nums">
              {combo}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent-neon/70">
              Confirmed Hits
            </p>
            <p className="text-3xl font-semibold text-accent-neon tabular-nums">
              {hits} / {PASS_TARGET}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent-neon/70">
              Misses Logged
            </p>
            <p className="text-3xl font-semibold text-rose-300 tabular-nums">
              {misses}
            </p>
          </div>
          <div className="col-span-full h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent-neon transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-muted">
          Keys A · S · D · F correspond to the vertical lanes. You may also
          click each pad. Register at least {PASS_TARGET} precise hits before
          the signal feed ends to advance.
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-5 shadow-card"
          style={{ height: GAME_HEIGHT + 40 }}
        >
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          <div className="grid h-full grid-cols-4 gap-3">
            {LANES.map((label, lane) => (
              <div
                key={label}
                className="relative rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm"
                onClick={() => handleHit(lane)}
              >
                {visibleNotes
                  .filter((note) => note.lane === lane)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="absolute left-1/2 w-12 -translate-x-1/2 rounded-full shadow-[0_20px_45px_rgba(70,240,255,0.35)]"
                      style={{
                        top: note.y,
                        height: 26,
                        background:
                          "linear-gradient(180deg,#9d7bff 0%,#46f0ff 100%)",
                      }}
                    />
                  ))}

                <div
                  className="pointer-events-none absolute left-3 right-3 -translate-y-1/2 rounded-full border border-white/20 transition-transform duration-150"
                  style={{
                    top: RECEPTOR_Y,
                    height: 20,
                    background:
                      flash[lane] === "hit"
                        ? "rgba(74,222,128,0.35)"
                        : flash[lane] === "miss"
                          ? "rgba(248,113,113,0.25)"
                          : "rgba(255,255,255,0.08)",
                    transform:
                      flash[lane] === "hit"
                        ? "translateY(-50%) scale(1.05)"
                        : flash[lane] === "miss"
                          ? "translateY(-50%) scale(0.95)"
                          : "translateY(-50%)",
                  }}
                />

                <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-semibold uppercase text-muted">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {status !== "running" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-background/80 text-center backdrop-blur-md">
              <p className="mb-4 text-sm text-muted">
                Prove your temporal awareness. Press any key or lane to begin.
              </p>
              <Button onClick={startChallenge}>Begin Signal Feed</Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {status === "running" ? (
            <Button variant="secondary" onClick={() => conclude(false)}>
              Abort Attempt
            </Button>
          ) : (
            <Button onClick={startChallenge}>Restart Sequence</Button>
          )}
        </div>
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={() => {
            setShowResult(false);
            startChallenge();
          }}
          onContinue={() => navigate({ to: "/captcha/counter" })}
          message={
            passed
              ? `Verification cleared with ${hits} confirmed hits.`
              : `Only ${hits} hits registered before the feed ended. Required: ${PASS_TARGET}.`
          }
        />
      )}
    </CaptchaContainer>
  );
}
