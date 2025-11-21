import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { CaptchaContainer } from "../components/CaptchaContainer";
import { ResultScreen } from "../components/ResultScreen";
import { useApp } from "../contexts/AppContext";

export const Route = createFileRoute("/captcha/golf")({
  component: GolfCaptcha,
});

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const BALL_RADIUS = 8;
const HOLE_RADIUS = 20;
const FRICTION = 0.992;
const MAX_POWER = 20;
const POWER_SCALE = 0.18;

// Random start for both walls
const randomWallY = () => Math.floor(Math.random() * 200) + 60;

function GolfCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<Ball>({ x: 80, y: 300, vx: 0, vy: 0 });
  const [hole] = useState({ x: 550, y: 200 });

  // Moving walls
  const [wall1Y, setWall1Y] = useState(randomWallY());
  const [wall1Dir, setWall1Dir] = useState(1);

  const [wall2Y, setWall2Y] = useState(randomWallY());
  const [wall2Dir, setWall2Dir] = useState(1);

  const walls = useMemo(
    () => [
      { x: 300, y: wall1Y, width: 20, height: 100 },
      { x: 450, y: wall2Y, width: 20, height: 100 },
    ],
    [wall1Y, wall2Y]
  );

  const smiley = {
    x: 100,
    y: 100,
    r: 40,
    eyes: [
      { x: 110, y: 90, r: 6 },
      { x: 120, y: 100, r: 6 },
    ],
    mouth: { x1: 80, y1: 90, x2: 120, y2: 120 },
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  // ------------------------------
  // Animate walls
  // ------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      // Wall 1 (slower)
      setWall1Y((prev) => {
        let next = prev + wall1Dir * 1.2;
        if (next > 260) {
          next = 260;
          setWall1Dir(-1);
        }
        if (next < 60) {
          next = 60;
          setWall1Dir(1);
        }
        return next;
      });

      // Wall 2 (faster)
      setWall2Y((prev) => {
        let next = prev + wall2Dir * 2.0;
        if (next > 260) {
          next = 260;
          setWall2Dir(-1);
        }
        if (next < 60) {
          next = 60;
          setWall2Dir(1);
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [wall1Dir, wall2Dir]);

  // ------------------------------
  // Rendering
  // ------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;

    const render = () => {
      const currentBall = ballRef.current;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#7ed957";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, HOLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hole.x, hole.y);
      ctx.lineTo(hole.x, hole.y - 40);
      ctx.stroke();

      ctx.fillStyle = "#ff4d4d";
      ctx.beginPath();
      ctx.moveTo(hole.x, hole.y - 40);
      ctx.lineTo(hole.x + 15, hole.y - 30);
      ctx.lineTo(hole.x, hole.y - 20);
      ctx.fill();

      walls.forEach((o) => {
        ctx.fillStyle = "#ffbe55";
        ctx.fillRect(o.x, o.y, o.width, o.height);
        ctx.strokeStyle = "#e89c3f";
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x, o.y, o.width, o.height);
      });

      ctx.strokeStyle = "#ffbe55";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(smiley.x, smiley.y, smiley.r, 0, Math.PI * 2);
      ctx.stroke();

      smiley.eyes.forEach((e) => {
        ctx.fillStyle = "#ffbe55";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(smiley.mouth.x1, smiley.mouth.y1);
      ctx.lineTo(smiley.mouth.x2, smiley.mouth.y2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(currentBall.x, currentBall.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3a3a";
      ctx.stroke();

      if (isDragging) {
        const dx = dragEnd.x - dragStart.x;
        const dy = dragEnd.y - dragStart.y;
        const rawPower = Math.sqrt(dx * dx + dy * dy) / 5;
        const power = Math.min(rawPower, MAX_POWER);

        const normX = dx / (rawPower || 1);
        const normY = dy / (rawPower || 1);
        const arrowLen = 20 + (power / MAX_POWER) * 10;

        ctx.strokeStyle = "#ff4d4d";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(currentBall.x, currentBall.y);
        ctx.lineTo(
          currentBall.x - normX * arrowLen,
          currentBall.y - normY * arrowLen
        );
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(10, 10, 200, 30);

        ctx.fillStyle = "#ff4d4d";
        ctx.fillRect(10, 10, (power / MAX_POWER) * 200, 30);

        ctx.strokeStyle = "#ff4d4d";
        ctx.strokeRect(10, 10, 200, 30);

        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.fillText(
          `Power: ${Math.round((power / MAX_POWER) * 100)}%`,
          15,
          30
        );
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [hole, walls, smiley, isDragging, dragStart, dragEnd]);

  // ------------------------------
  // Physics loop
  // ------------------------------
  useEffect(() => {
    if (!isMoving) return;

    let frame: number;
    let last = performance.now();

    const step = (timestamp: number) => {
      const dt = (timestamp - last) / 16.6667;
      last = timestamp;

      const ball = ballRef.current;
      ball.vx *= Math.pow(FRICTION, dt);
      ball.vy *= Math.pow(FRICTION, dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x - BALL_RADIUS < 0 || ball.x + BALL_RADIUS > CANVAS_WIDTH) {
        ball.vx *= -0.8;
        ball.x = Math.max(
          BALL_RADIUS,
          Math.min(CANVAS_WIDTH - BALL_RADIUS, ball.x)
        );
      }
      if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        ball.vy *= -0.8;
        ball.y = Math.max(
          BALL_RADIUS,
          Math.min(CANVAS_HEIGHT - BALL_RADIUS, ball.y)
        );
      }

      walls.forEach((o) => {
        if (
          ball.x + BALL_RADIUS > o.x &&
          ball.x - BALL_RADIUS < o.x + o.width &&
          ball.y + BALL_RADIUS > o.y &&
          ball.y - BALL_RADIUS < o.y + o.height
        ) {
          ball.vx *= -0.8;
          ball.vy *= -0.8;
        }
      });

      const distToFace = Math.sqrt(
        (ball.x - smiley.x) ** 2 + (ball.y - smiley.y) ** 2
      );
      if (distToFace < smiley.r + BALL_RADIUS && distToFace > smiley.r - 10) {
        ball.vx *= -0.8;
        ball.vy *= -0.8;
      }

      const distToHole = Math.sqrt(
        (ball.x - hole.x) ** 2 + (ball.y - hole.y) ** 2
      );

      if (distToHole < HOLE_RADIUS - 4) {
        ballRef.current = { x: hole.x, y: hole.y, vx: 0, vy: 0 };
        setIsMoving(false);
        setPassed(true);
        setShowResult(true);
        markCaptchaComplete("golf", true);
        return;
      }

      if (
        (Math.abs(ball.vx) < 0.15 && Math.abs(ball.vy) < 0.15) ||
        distToHole > 600
      ) {
        autoReset();
        return;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isMoving, walls, smiley, hole, markCaptchaComplete]);

  // Auto-reset logic for failure
  const autoReset = () => {
    setIsMoving(false);
    ballRef.current = { x: 80, y: 300, vx: 0, vy: 0 };
    setWall1Y(randomWallY());
    setWall2Y(randomWallY());
    setWall1Dir(1);
    setWall2Dir(1);
  };

  // ----------------------------
  // Mouse input
  // ----------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMoving) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { x: bx, y: by } = ballRef.current;
    const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
    if (dist < BALL_RADIUS + 20) {
      setIsDragging(true);
      setDragStart({ x, y });
      setDragEnd({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const dx = dragEnd.x - dragStart.x;
    const dy = dragEnd.y - dragStart.y;

    ballRef.current = {
      ...ballRef.current,
      vx: -dx * POWER_SCALE,
      vy: -dy * POWER_SCALE,
    };

    setIsDragging(false);
    setIsMoving(true);
    incrementAttempts("golf");
  };

  const handleContinue = () => {
    navigate({ to: "/captcha/stop" });
  };

  return (
    <CaptchaContainer
      title="MOTOR CONTROL VERIFICATION"
      description="Get the ball into the hole. Click and drag from the ball to set power and angle."
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
              className="border border-border rounded cursor-crosshair"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>

        <div className="bg-border/30 rounded p-3 text-xs text-muted">
          <p>
            💡 Tip: Drag the ball in the opposite direction you want the ball to
            go. Longer drag = more power.
          </p>
        </div>
      </div>

      {showResult && passed && (
        <ResultScreen
          passed={true}
          onContinue={handleContinue}
          message="Hole in one! Motor control verified."
        />
      )}
    </CaptchaContainer>
  );
}

export default GolfCaptcha;
