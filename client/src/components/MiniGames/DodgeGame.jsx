import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function DodgeGame({ onComplete, stakes, duration = 10 }) {
  const canvasRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);
  const [survived, setSurvived] = useState(false);
  const gameRef = useRef({
    playerX: 200,
    obstacles: [],
    running: true,
    spawnTimer: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = Date.now();

    const game = gameRef.current;

    const gameLoop = () => {
      if (!game.running) return;

      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 400, 400);

      // Spawn obstacles
      game.spawnTimer += dt;
      if (game.spawnTimer > 0.3) {
        game.spawnTimer = 0;
        game.obstacles.push({
          x: Math.random() * 360 + 20,
          y: -30,
          size: Math.random() * 20 + 20,
          speed: Math.random() * 200 + 150,
          color: ['#ef4444', '#f97316', '#eab308'][Math.floor(Math.random() * 3)]
        });
      }

      // Update obstacles
      game.obstacles = game.obstacles.filter(obs => {
        obs.y += obs.speed * dt;
        return obs.y < 450;
      });

      // Draw obstacles
      game.obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Spiky effect
        ctx.strokeStyle = obs.color;
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(
            obs.x + Math.cos(angle) * (obs.size / 2 + 8),
            obs.y + Math.sin(angle) * (obs.size / 2 + 8)
          );
          ctx.stroke();
        }
      });

      // Draw player
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(game.playerX, 360, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Player glow
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw ground
      ctx.fillStyle = '#ffffff20';
      ctx.fillRect(0, 385, 400, 15);

      // Check collision
      for (const obs of game.obstacles) {
        const dx = obs.x - game.playerX;
        const dy = obs.y - 360;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < obs.size / 2 + 20) {
          game.running = false;
          setGameOver(true);
          setSurvived(false);
          return;
        }
      }

      // Draw timer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${timeLeft}s`, 200, 40);

      // Progress bar
      ctx.fillStyle = '#ffffff20';
      ctx.fillRect(50, 50, 300, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(50, 50, 300 * (timeLeft / duration), 10);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [timeLeft, duration]);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          gameRef.current.running = false;
          setGameOver(true);
          setSurvived(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Mouse control
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      gameRef.current.playerX = Math.max(20, Math.min(380, e.clientX - rect.left));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-6 rounded-2xl text-center"
      >
        <h2 className="text-2xl font-bold mb-2">🔥 DODGE!</h2>
        <p className="text-gray-400 mb-4">Survive {duration} seconds to win ${stakes}!</p>
        
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400}
          className="rounded-xl border-2 border-white/20 cursor-none"
        />

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4"
          >
            <div className={`text-3xl font-bold mb-4 ${survived ? 'text-green-400' : 'text-red-400'}`}>
              {survived ? '🎉 SURVIVED!' : '💥 HIT!'}
            </div>
            <button
              onClick={() => onComplete(survived)}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg"
            >
              {survived ? `Collect $${stakes}!` : 'Continue'}
            </button>
          </motion.div>
        )}

        <p className="text-sm text-gray-500 mt-4">Move mouse to dodge!</p>
      </motion.div>
    </div>
  );
}
