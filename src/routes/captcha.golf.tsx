import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { CaptchaContainer } from '../components/CaptchaContainer';
import { Button } from '../components/Button';
import { ResultScreen } from '../components/ResultScreen';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/captcha/golf')({
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
const FRICTION = 0.98;
const MAX_POWER = 15;

function GolfCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState<Ball>({ x: 50, y: 350, vx: 0, vy: 0 });
  const [hole] = useState({ x: 550, y: 200 });
  const [obstacle] = useState({ x: 300, y: 250, width: 20, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grass background
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw hole
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw hole flag
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y);
    ctx.lineTo(hole.x, hole.y - 40);
    ctx.stroke();
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y - 40);
    ctx.lineTo(hole.x + 15, hole.y - 30);
    ctx.lineTo(hole.x, hole.y - 20);
    ctx.fill();

    // Draw obstacle
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw power indicator when dragging
    if (isDragging) {
      const dx = dragEnd.x - dragStart.x;
      const dy = dragEnd.y - dragStart.y;
      const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, MAX_POWER);
      
      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.x - dx / 10, ball.y - dy / 10);
      ctx.stroke();

      // Power meter
      ctx.fillStyle = 'rgba(212, 160, 23, 0.3)';
      ctx.fillRect(10, 10, 200, 30);
      ctx.fillStyle = '#d4a017';
      ctx.fillRect(10, 10, (power / MAX_POWER) * 200, 30);
      ctx.strokeStyle = '#d4a017';
      ctx.strokeRect(10, 10, 200, 30);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Power: ${Math.round((power / MAX_POWER) * 100)}%`, 15, 30);
    }
  }, [ball, hole, obstacle, isDragging, dragStart, dragEnd]);

  useEffect(() => {
    if (!isMoving) return;

    const interval = setInterval(() => {
      setBall((prev) => {
        let newBall = { ...prev };
        
        // Apply friction
        newBall.vx *= FRICTION;
        newBall.vy *= FRICTION;
        
        // Update position
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;
        
        // Bounce off walls
        if (newBall.x - BALL_RADIUS < 0 || newBall.x + BALL_RADIUS > CANVAS_WIDTH) {
          newBall.vx *= -0.8;
          newBall.x = Math.max(BALL_RADIUS, Math.min(CANVAS_WIDTH - BALL_RADIUS, newBall.x));
        }
        if (newBall.y - BALL_RADIUS < 0 || newBall.y + BALL_RADIUS > CANVAS_HEIGHT) {
          newBall.vy *= -0.8;
          newBall.y = Math.max(BALL_RADIUS, Math.min(CANVAS_HEIGHT - BALL_RADIUS, newBall.y));
        }
        
        // Collision with obstacle
        if (
          newBall.x + BALL_RADIUS > obstacle.x &&
          newBall.x - BALL_RADIUS < obstacle.x + obstacle.width &&
          newBall.y + BALL_RADIUS > obstacle.y &&
          newBall.y - BALL_RADIUS < obstacle.y + obstacle.height
        ) {
          // Simple collision response
          const overlapLeft = (newBall.x + BALL_RADIUS) - obstacle.x;
          const overlapRight = (obstacle.x + obstacle.width) - (newBall.x - BALL_RADIUS);
          const overlapTop = (newBall.y + BALL_RADIUS) - obstacle.y;
          const overlapBottom = (obstacle.y + obstacle.height) - (newBall.y - BALL_RADIUS);
          
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
          
          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            newBall.vx *= -0.8;
          } else {
            newBall.vy *= -0.8;
          }
        }
        
        // Check if ball reached hole
        const distToHole = Math.sqrt(
          Math.pow(newBall.x - hole.x, 2) + Math.pow(newBall.y - hole.y, 2)
        );
        
        if (distToHole < HOLE_RADIUS && Math.abs(newBall.vx) < 1 && Math.abs(newBall.vy) < 1) {
          setIsMoving(false);
          setPassed(true);
          setShowResult(true);
          markCaptchaComplete('golf', true);
          return { ...newBall, vx: 0, vy: 0, x: hole.x, y: hole.y };
        }
        
        // Stop if velocity is too low
        if (Math.abs(newBall.vx) < 0.1 && Math.abs(newBall.vy) < 0.1) {
          setIsMoving(false);
          newBall.vx = 0;
          newBall.vy = 0;
        }
        
        return newBall;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isMoving, hole, obstacle, markCaptchaComplete]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMoving) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dist = Math.sqrt(Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2));
    if (dist < BALL_RADIUS + 20) {
      setIsDragging(true);
      setDragStart({ x, y });
      setDragEnd({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const dx = dragEnd.x - dragStart.x;
    const dy = dragEnd.y - dragStart.y;
    
    setBall((prev) => ({
      ...prev,
      vx: -dx / 10,
      vy: -dy / 10,
    }));
    
    setIsDragging(false);
    setIsMoving(true);
    setAttempts((prev) => prev + 1);
    incrementAttempts('golf');
  };

  const handleReset = () => {
    setBall({ x: 50, y: 350, vx: 0, vy: 0 });
    setIsMoving(false);
  };

  const handleRetry = () => {
    setShowResult(false);
    handleReset();
  };

  const handleContinue = () => {
    navigate({ to: '/captcha/stop' });
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
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted">
            Attempts: <span className="text-accent">{attempts}</span>
          </div>
          <Button variant="secondary" onClick={handleReset} disabled={isMoving}>
            Reset Ball
          </Button>
        </div>

        <div className="bg-border/30 rounded p-3 text-xs text-muted">
          <p>💡 Tip: Drag in the opposite direction you want the ball to go. Longer drag = more power.</p>
        </div>
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={passed ? 'Hole in one! Motor control verified.' : undefined}
        />
      )}
    </CaptchaContainer>
  );
}

