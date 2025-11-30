import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function DiceRoller() {
  const { rollDice, endTurn, lastDice, isRolling, gameState, playerId } = useGameStore();
  const [hasRolled, setHasRolled] = useState(false);

  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  // Reset hasRolled when turn changes
  useEffect(() => {
    setHasRolled(false);
  }, [gameState?.currentPlayerIndex, gameState?.turnNumber]);

  const handleRoll = () => {
    if (!hasRolled && isMyTurn) {
      rollDice();
      setHasRolled(true);
    }
  };

  const renderDie = (value, index) => {
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
        key={index}
        className={`w-16 h-16 bg-white rounded-xl shadow-lg relative ${isRolling ? 'dice-rolling' : ''}`}
        animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {dots[value]?.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="10" fill="#1a1a2e" />
          ))}
        </svg>
      </motion.div>
    );
  };

  return (
    <div className="text-center">
      <h3 className="font-bold mb-4">🎲 Your Turn!</h3>
      
      {/* Dice display */}
      <div className="flex justify-center gap-4 mb-4">
        {lastDice ? (
          <>
            {renderDie(lastDice[0], 0)}
            {renderDie(lastDice[1], 1)}
          </>
        ) : (
          <>
            {renderDie(1, 0)}
            {renderDie(1, 1)}
          </>
        )}
      </div>

      {/* Total */}
      {lastDice && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-yellow-400 mb-4"
        >
          Total: {lastDice[0] + lastDice[1]}
        </motion.div>
      )}

      {/* Roll button */}
      {!hasRolled ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 
            text-black font-bold text-lg hover:from-yellow-600 hover:to-orange-600 
            transition-all disabled:opacity-50"
        >
          {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}
        </motion.button>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endTurn}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 
            font-bold transition-all"
        >
          End Turn →
        </motion.button>
      )}
    </div>
  );
}
