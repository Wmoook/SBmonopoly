import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const DiceFace = ({ value, isRolling }) => {
  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };

  return (
    <motion.div
      className="w-16 h-16 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg relative"
      animate={isRolling ? { 
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1, 1.1, 1]
      } : { rotate: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        repeat: isRolling ? Infinity : 0,
        ease: "easeInOut"
      }}
      style={{
        boxShadow: isRolling 
          ? '0 0 20px rgba(255, 215, 0, 0.5)' 
          : '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {dots[value]?.map(([x, y], i) => (
          <motion.circle 
            key={i} 
            cx={x} 
            cy={y} 
            r="12" 
            fill="#1a1a2e"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

export default function DiceRoller() {
  const { rollDice, endTurn, lastDice, isRolling, gameState, playerId } = useGameStore();
  const [hasRolled, setHasRolled] = useState(false);
  const [displayDice, setDisplayDice] = useState([1, 1]);

  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  // Reset hasRolled when turn changes
  useEffect(() => {
    setHasRolled(false);
  }, [gameState?.currentPlayerIndex, gameState?.turnNumber]);

  // Animate dice during rolling
  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayDice([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]);
      }, 100);
      return () => clearInterval(interval);
    } else if (lastDice) {
      setDisplayDice(lastDice);
    }
  }, [isRolling, lastDice]);

  const handleRoll = () => {
    if (!hasRolled && isMyTurn) {
      rollDice();
      setHasRolled(true);
    }
  };

  return (
    <div className="text-center">
      <motion.h3 
        className="font-bold mb-4 text-lg"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎲 Your Turn!
      </motion.h3>
      
      {/* Dice display */}
      <div className="flex justify-center gap-4 mb-4">
        <DiceFace value={displayDice[0]} isRolling={isRolling} />
        <DiceFace value={displayDice[1]} isRolling={isRolling} />
      </div>

      {/* Total */}
      <AnimatePresence>
        {lastDice && !isRolling && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            className="text-3xl font-bold mb-4"
          >
            <span className="text-gray-400">Rolled </span>
            <span className="text-yellow-400 glow">{lastDice[0] + lastDice[1]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll button */}
      {!hasRolled ? (
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 215, 0, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 
            text-black font-bold text-lg transition-all disabled:opacity-50
            shadow-lg shadow-orange-500/30"
        >
          {isRolling ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎲
              </motion.span>
              Rolling...
            </span>
          ) : (
            '🎲 Roll Dice!'
          )}
        </motion.button>
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endTurn}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
            font-bold text-lg transition-all shadow-lg shadow-blue-500/30"
        >
          End Turn →
        </motion.button>
      )}
    </div>
  );
}
