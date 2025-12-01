import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReactionGame({ onComplete, stakes }) {
  const [phase, setPhase] = useState('waiting'); // waiting, ready, go, clicked, tooEarly
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [opponentTime, setOpponentTime] = useState(null);

  useEffect(() => {
    if (phase === 'waiting') {
      // Random delay between 2-5 seconds
      const delay = Math.random() * 3000 + 2000;
      const timer = setTimeout(() => {
        setPhase('go');
        setStartTime(Date.now());
      }, delay);
      
      // Brief "ready" phase
      const readyTimer = setTimeout(() => setPhase('ready'), 1000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(readyTimer);
      };
    }
  }, [phase]);

  const handleClick = useCallback(() => {
    if (phase === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      // Opponent reaction between 150-400ms
      const oppTime = Math.floor(Math.random() * 250 + 150);
      setOpponentTime(oppTime);
      setPhase('clicked');
    } else if (phase === 'ready' || phase === 'waiting') {
      setPhase('tooEarly');
    }
  }, [phase, startTime]);

  const won = reactionTime && opponentTime && reactionTime < opponentTime;

  const getColor = () => {
    switch(phase) {
      case 'waiting': return 'from-gray-700 to-gray-800';
      case 'ready': return 'from-red-600 to-red-700';
      case 'go': return 'from-green-500 to-green-600';
      case 'tooEarly': return 'from-red-600 to-red-700';
      case 'clicked': return won ? 'from-green-500 to-green-600' : 'from-red-600 to-red-700';
      default: return 'from-gray-700 to-gray-800';
    }
  };

  const getMessage = () => {
    switch(phase) {
      case 'waiting': return 'Wait for green...';
      case 'ready': return 'Get ready...';
      case 'go': return 'CLICK NOW!';
      case 'tooEarly': return 'TOO EARLY!';
      case 'clicked': return won ? 'YOU WIN!' : 'TOO SLOW!';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-8 rounded-2xl text-center max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-2">⚡ REACTION DUEL!</h2>
        <p className="text-gray-400 mb-6">Fastest click wins ${stakes}!</p>

        <motion.button
          onClick={handleClick}
          className={`w-full h-48 rounded-2xl bg-gradient-to-br ${getColor()} text-white font-bold text-3xl transition-all`}
          whileTap={{ scale: 0.98 }}
          animate={phase === 'go' ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.2, repeat: phase === 'go' ? Infinity : 0 }}
        >
          {getMessage()}
        </motion.button>

        {phase === 'clicked' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="flex justify-between items-center glass p-4 rounded-xl">
              <span className="text-green-400 font-bold">You</span>
              <span className="text-2xl font-mono">{reactionTime}ms</span>
            </div>
            <div className="flex justify-between items-center glass p-4 rounded-xl">
              <span className="text-red-400 font-bold">Opponent</span>
              <span className="text-2xl font-mono">{opponentTime}ms</span>
            </div>

            <div className={`text-3xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? `🎉 +$${stakes}!` : `😢 -$${stakes}!`}
            </div>

            <button
              onClick={() => onComplete(won)}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg w-full"
            >
              Continue
            </button>
          </motion.div>
        )}

        {phase === 'tooEarly' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <p className="text-red-400 text-xl mb-4">You clicked too early! 😬</p>
            <button
              onClick={() => onComplete(false)}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-bold text-lg"
            >
              You Lose -${stakes}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
