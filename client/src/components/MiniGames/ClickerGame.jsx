import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ClickerGame({ onComplete, stakes, duration = 10 }) {
  const [clicks, setClicks] = useState(0);
  const [opponentClicks, setOpponentClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);
  const opponentRef = useRef(null);

  // Opponent AI clicking
  useEffect(() => {
    if (gameOver) return;

    // Opponent clicks between 5-9 times per second
    const clicksPerSecond = Math.random() * 4 + 5;
    
    opponentRef.current = setInterval(() => {
      setOpponentClicks(c => c + 1);
    }, 1000 / clicksPerSecond);

    return () => clearInterval(opponentRef.current);
  }, [gameOver]);

  // Timer
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(opponentRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  const handleClick = () => {
    if (!gameOver) {
      setClicks(c => c + 1);
    }
  };

  const won = clicks > opponentClicks;
  const cps = timeLeft < duration ? (clicks / (duration - timeLeft)).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-8 rounded-2xl text-center max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-2">👆 CLICK BATTLE!</h2>
        <p className="text-gray-400 mb-4">Out-click your opponent to win ${stakes}!</p>

        {/* Timer */}
        <div className={`text-5xl font-mono font-bold mb-6 ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : ''}`}>
          {timeLeft}s
        </div>

        {/* Score comparison */}
        <div className="flex justify-between mb-6">
          <div className="glass p-4 rounded-xl flex-1 mr-2">
            <div className="text-green-400 text-sm">YOU</div>
            <div className="text-4xl font-bold">{clicks}</div>
            <div className="text-xs text-gray-400">{cps}/s</div>
          </div>
          <div className="glass p-4 rounded-xl flex-1 ml-2">
            <div className="text-red-400 text-sm">OPPONENT</div>
            <div className="text-4xl font-bold">{opponentClicks}</div>
          </div>
        </div>

        {/* Click button */}
        {!gameOver && (
          <motion.button
            onClick={handleClick}
            className="w-full h-32 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold text-2xl"
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            TAP! TAP! TAP! 👆
          </motion.button>
        )}

        {/* Progress bar */}
        <div className="mt-4 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
            style={{ width: `${(clicks / (clicks + opponentClicks || 1)) * 100}%` }}
          />
        </div>

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6"
          >
            <div className={`text-3xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? '🎉 YOU WIN!' : '😢 YOU LOSE!'}
            </div>
            <div className="text-gray-400 mb-4">
              {clicks} vs {opponentClicks} clicks
            </div>
            <button
              onClick={() => onComplete(won)}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg w-full"
            >
              {won ? `Collect $${stakes}!` : 'Continue'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
