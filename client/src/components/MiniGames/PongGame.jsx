import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function PongGame({ onComplete, opponent, stakes }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const gameRef = useRef({
    ball: { x: 200, y: 150, vx: 4, vy: 3 },
    playerY: 120,
    opponentY: 120,
    running: true
  });

  const WINNING_SCORE = 3;
  const PADDLE_HEIGHT = 60;
  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const game = gameRef.current;

    const gameLoop = () => {
      if (!game.running) return;

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 400, 300);

      // Draw center line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ffffff30';
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, 300);
      ctx.stroke();
      ctx.setLineDash([]);

      // Move ball
      game.ball.x += game.ball.vx;
      game.ball.y += game.ball.vy;

      // Ball bounce off top/bottom
      if (game.ball.y <= 0 || game.ball.y >= 290) {
        game.ball.vy *= -1;
      }

      // Ball hits player paddle
      if (game.ball.x <= 20 && 
          game.ball.y >= game.playerY && 
          game.ball.y <= game.playerY + PADDLE_HEIGHT) {
        game.ball.vx = Math.abs(game.ball.vx) * 1.1;
        game.ball.vy += (game.ball.y - (game.playerY + PADDLE_HEIGHT/2)) * 0.1;
      }

      // Ball hits opponent paddle
      if (game.ball.x >= 370 && 
          game.ball.y >= game.opponentY && 
          game.ball.y <= game.opponentY + PADDLE_HEIGHT) {
        game.ball.vx = -Math.abs(game.ball.vx) * 1.1;
        game.ball.vy += (game.ball.y - (game.opponentY + PADDLE_HEIGHT/2)) * 0.1;
      }

      // AI opponent movement
      const targetY = game.ball.y - PADDLE_HEIGHT / 2;
      game.opponentY += (targetY - game.opponentY) * 0.08;
      game.opponentY = Math.max(0, Math.min(240, game.opponentY));

      // Score
      if (game.ball.x < 0) {
        setScore(s => {
          const newScore = { ...s, opponent: s.opponent + 1 };
          if (newScore.opponent >= WINNING_SCORE) {
            game.running = false;
            setGameOver(true);
            setWinner('opponent');
          }
          return newScore;
        });
        game.ball = { x: 200, y: 150, vx: -4, vy: 3 };
      }
      if (game.ball.x > 400) {
        setScore(s => {
          const newScore = { ...s, player: s.player + 1 };
          if (newScore.player >= WINNING_SCORE) {
            game.running = false;
            setGameOver(true);
            setWinner('player');
          }
          return newScore;
        });
        game.ball = { x: 200, y: 150, vx: 4, vy: -3 };
      }

      // Draw paddles
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(10, game.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(380, game.opponentY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Draw scores
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(score.player.toString(), 100, 60);
      ctx.fillText(score.opponent.toString(), 300, 60);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [score]);

  // Mouse control
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      gameRef.current.playerY = Math.max(0, Math.min(240, y - PADDLE_HEIGHT / 2));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFinish = () => {
    onComplete(winner === 'player');
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-6 rounded-2xl text-center"
      >
        <h2 className="text-2xl font-bold mb-2">🏓 PONG DUEL!</h2>
        <p className="text-gray-400 mb-4">First to {WINNING_SCORE} wins ${stakes}!</p>
        
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300}
          className="rounded-xl border-2 border-white/20 cursor-none"
        />

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4"
          >
            <div className={`text-3xl font-bold mb-4 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
              {winner === 'player' ? '🎉 YOU WIN!' : '😢 YOU LOSE!'}
            </div>
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg"
            >
              {winner === 'player' ? `Collect $${stakes}!` : 'Continue'}
            </button>
          </motion.div>
        )}

        <p className="text-sm text-gray-500 mt-4">Move mouse to control paddle</p>
      </motion.div>
    </div>
  );
}
