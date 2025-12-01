import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['🎰', '💎', '🚀', '🔥', '⭐', '🎲', '💰', '🃏'];

export default function MemoryGame({ onComplete, stakes }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Initialize game
  useEffect(() => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false }));
    setCards(shuffled);
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver || matched.length === 16) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, matched.length]);

  // Check for win
  useEffect(() => {
    if (matched.length === 16 && !gameOver) {
      setGameOver(true);
    }
  }, [matched.length, gameOver]);

  const handleCardClick = useCallback((index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, matched, cards]);

  const won = matched.length === 16;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass p-6 rounded-2xl text-center"
      >
        <h2 className="text-2xl font-bold mb-2">🧠 MEMORY MATCH!</h2>
        <p className="text-gray-400 mb-4">Match all pairs to win ${stakes}!</p>

        <div className="flex justify-between mb-4">
          <div className="glass px-4 py-2 rounded-lg">
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
          <div className="glass px-4 py-2 rounded-lg">
            <span className="font-bold">Moves: {moves}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map((card, i) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(i)}
              className={`w-16 h-16 rounded-xl text-3xl flex items-center justify-center transition-all ${
                flipped.includes(i) || matched.includes(i)
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-gradient-to-br from-gray-700 to-gray-800'
              } ${matched.includes(i) ? 'opacity-50' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={flipped.includes(i) || matched.includes(i) ? { rotateY: 180 } : { rotateY: 0 }}
            >
              {(flipped.includes(i) || matched.includes(i)) ? card.emoji : '❓'}
            </motion.button>
          ))}
        </div>

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4"
          >
            <div className={`text-3xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? `🎉 MATCHED! +$${stakes}!` : `⏰ TIME UP! -$${stakes}`}
            </div>
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
