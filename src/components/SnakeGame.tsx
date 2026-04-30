import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isPaused: boolean;
}

const GRID_SIZE = 25;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

export default function SnakeGame({ onScoreChange, isPaused }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    const cols = Math.floor(dimensions.width / GRID_SIZE);
    const rows = Math.floor(dimensions.height / GRID_SIZE);
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (cols - 2)) + 1,
        y: Math.floor(Math.random() * (rows - 2)) + 1,
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, [dimensions]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    onScoreChange(0);
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || gameOver) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPaused, gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        const cols = Math.floor(dimensions.width / GRID_SIZE);
        const rows = Math.floor(dimensions.height / GRID_SIZE);

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= cols ||
          newHead.y < 0 ||
          newHead.y >= rows
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          
          // Juice
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 200);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, score, onScoreChange, isPaused, generateFood, dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High fidelity clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle technical grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * GRID_SIZE;
      const y = segment.y * GRID_SIZE;
      
      ctx.save();
      
      // Glow effect
      ctx.shadowBlur = isHead ? 20 : 10;
      ctx.shadowColor = isHead ? '#06b6d2' : '#0891b2';
      
      const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
      if (isHead) {
        gradient.addColorStop(0, '#22d3ee');
        gradient.addColorStop(1, '#0891b2');
      } else {
        gradient.addColorStop(0, '#0e7490');
        gradient.addColorStop(1, '#155e75');
      }

      ctx.fillStyle = gradient;
      
      // Snake body connects logic (rounded path)
      ctx.beginPath();
      const padding = 2;
      ctx.roundRect(x + padding, y + padding, GRID_SIZE - padding * 2, GRID_SIZE - padding * 2, isHead ? 8 : 4);
      ctx.fill();
      
      ctx.restore();
    });

    // Draw food
    const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const fy = food.y * GRID_SIZE + GRID_SIZE / 2;
    
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#d946ef';
    
    const foodGradient = ctx.createRadialGradient(fx, fy, 2, fx, fy, GRID_SIZE / 2);
    foodGradient.addColorStop(0, '#f0abfc');
    foodGradient.addColorStop(1, '#d946ef');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(fx, fy, GRID_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Core of food
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fx, fy, GRID_SIZE / 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

  }, [snake, food]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-100 ${isShaking ? 'animate-bounce' : ''}`}
      id="snake-terminal-view"
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-500/20 rounded-br-3xl pointer-events-none" />

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
        id="snake-canvas"
      />
      
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-8 text-center"
            id="game-over-modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs w-full"
            >
              <h2 className="text-5xl font-black text-magenta-500 mb-2 font-display italic" style={{ color: '#d946ef' }}>CRITICAL_FAIL</h2>
              <div className="h-px bg-white/10 w-full mb-6" />
              <p className="text-zinc-500 mb-2 font-mono text-[10px] uppercase tracking-widest">Final Extraction Data</p>
              <p className="text-4xl font-mono text-cyan-400 font-bold mb-8 tabular-nums">{score.toString().padStart(4, '0')}</p>
              <button
                onClick={resetGame}
                className="w-full py-4 bg-cyan-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(6,182,212,0.3)] font-display"
              >
                Reboot System
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && !gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin-slow flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20" />
              </div>
              <p className="text-sm font-mono font-bold text-cyan-500 uppercase tracking-[0.4em] animate-pulse">Awaiting Signal</p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Press Play on Music Component</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}
