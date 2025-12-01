import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function HigherLowerGame({ onComplete, stakes }) {
  const [currentNumber, setCurrentNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastGuess, setLastGuess] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const TARGET_SCORE = 5;

  const makeGuess = useCallback((guessHigher) => {
    const next = Math.floor(Math.random() * 100) + 1;
    setNextNumber(next);
    setLastGuess(guessHigher ? 'higher' : 'lower');
    setShowResult(true);

    const isCorrect = guessHigher ? next > currentNumber : next < currentNumber;
    
    setTimeout(() => {
      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore >= TARGET_SCORE) {
          setGameOver(true);
        }
      } else {
        setGameOver(true);
      }
      setCurrentNumber(next);
      setShowResult(false);
    }, 1500);
  }, [currentNumber, score]);

  const won = score >= TARGET_SCORE;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-8 rounded-2xl text-center max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-2">📊 HIGHER or LOWER?</h2>
        <p className="text-gray-400 mb-4">Get {TARGET_SCORE} right to win ${stakes}!</p>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(TARGET_SCORE)].map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                i < score ? 'bg-green-500 border-green-400' : 'border-gray-600'
              }`}
            >
              {i < score && '✓'}
            </div>
          ))}
        </div>

        {/* Current number */}
        <motion.div
          key={currentNumber}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
        >
          {showResult ? nextNumber : currentNumber}
        </motion.div>

        {/* Guess result */}
        {showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold mb-4 ${
              (lastGuess === 'higher' && nextNumber > currentNumber) ||
              (lastGuess === 'lower' && nextNumber < currentNumber)
                ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {(lastGuess === 'higher' && nextNumber > currentNumber) ||
             (lastGuess === 'lower' && nextNumber < currentNumber)
              ? '✓ CORRECT!' : '✗ WRONG!'}
          </motion.div>
        )}

        {/* Buttons */}
        {!gameOver && !showResult && (
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => makeGuess(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⬆️ HIGHER
            </motion.button>
            <motion.button
              onClick={() => makeGuess(false)}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-bold text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⬇️ LOWER
            </motion.button>
          </div>
        )}

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4"
          >
            <div className={`text-3xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? `🎉 PERFECT! +$${stakes}!` : `😢 WRONG! -$${stakes}`}
            </div>
            <p className="text-gray-400 mb-4">You got {score} correct!</p>
            <button
              onClick={() => onComplete(won)}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg"
            >
              Continue
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
