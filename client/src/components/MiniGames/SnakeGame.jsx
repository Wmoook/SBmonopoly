import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function SnakeGame({ onComplete, stakes, targetScore = 5 }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    running: true
  });

  const GRID_SIZE = 20;
  const CELL_SIZE = 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastUpdate = 0;
    let animationId;

    const game = gameRef.current;

    const spawnFood = () => {
      game.food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    };

    const gameLoop = (timestamp) => {
      if (!game.running) return;

      // Update at ~8fps for snake movement
      if (timestamp - lastUpdate > 125) {
        lastUpdate = timestamp;

        // Move snake
        const head = { ...game.snake[0] };
        head.x += game.direction.x;
        head.y += game.direction.y;

        // Wrap around walls
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;

        // Check self collision
        for (const segment of game.snake) {
          if (segment.x === head.x && segment.y === head.y) {
            game.running = false;
            setGameOver(true);
            setWon(false);
            return;
          }
        }

        game.snake.unshift(head);

        // Check food
        if (head.x === game.food.x && head.y === game.food.y) {
          setScore(s => {
            const newScore = s + 1;
            if (newScore >= targetScore) {
              game.running = false;
              setGameOver(true);
              setWon(true);
            }
            return newScore;
          });
          spawnFood();
        } else {
          game.snake.pop();
        }
      }

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 300, 300);

      // Draw grid
      ctx.strokeStyle = '#ffffff10';
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(300, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        game.food.x * CELL_SIZE + CELL_SIZE / 2,
        game.food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0, Math.PI * 2
      );
      ctx.fill();

      // Draw snake
      game.snake.forEach((segment, i) => {
        const brightness = 1 - (i / game.snake.length) * 0.5;
        ctx.fillStyle = `hsl(142, 76%, ${50 * brightness}%)`;
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [targetScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      const game = gameRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (game.direction.y !== 1) game.direction = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (game.direction.y !== -1) game.direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (game.direction.x !== 1) game.direction = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (game.direction.x !== -1) game.direction = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-6 rounded-2xl text-center"
      >
        <h2 className="text-2xl font-bold mb-2">🐍 SNAKE!</h2>
        <p className="text-gray-400 mb-2">Eat {targetScore} apples to win ${stakes}!</p>
        
        {/* Score progress */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(targetScore)].map((_, i) => (
            <div 
              key={i} 
              className={`w-6 h-6 rounded-full border-2 ${
                i < score ? 'bg-green-500 border-green-400' : 'border-gray-600'
              }`}
            >
              {i < score && '🍎'}
            </div>
          ))}
        </div>

        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300}
          className="rounded-xl border-2 border-white/20"
        />

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4"
          >
            <div className={`text-3xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? `🎉 FED! +$${stakes}!` : `💀 CRASHED! -$${stakes}`}
            </div>
            <button
              onClick={() => onComplete(won)}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg"
            >
              Continue
            </button>
          </motion.div>
        )}

        <p className="text-sm text-gray-500 mt-4">Use WASD or Arrow keys</p>
      </motion.div>
    </div>
  );
}
