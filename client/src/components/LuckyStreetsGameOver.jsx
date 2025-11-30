import { motion } from 'framer-motion';
import { useLuckyStreetsStore } from '../store/luckyStreetsStore';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function LuckyStreetsGameOver() {
  const { gameState, playerId, resetGame, setAccountBalance, accountBalance } = useLuckyStreetsStore();

  if (!gameState) return null;

  const winner = gameState.players.reduce((best, p) => 
    (!best || (p.netWorth > best.netWorth && !p.bankrupt)) ? p : best
  , null);
  
  const isWinner = winner?.id === playerId;
  const prizeAmount = gameState.totalPot;

  useEffect(() => {
    if (isWinner) {
      // Add winnings to balance
      setAccountBalance(accountBalance + prizeAmount);
      
      // Confetti!
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 }
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 }
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isWinner]);

  const sortedPlayers = [...gameState.players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-96 bg-gradient-to-b from-yellow-500/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Winner Announcement */}
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <motion.div 
            className="text-8xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🏆
          </motion.div>
          
          <h1 className="text-4xl font-black mb-2">
            {isWinner ? (
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                YOU WON!
              </span>
            ) : (
              <span className="text-gray-300">
                {winner?.name} Wins!
              </span>
            )}
          </h1>
          
          <motion.div 
            className="text-5xl font-bold text-green-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            ${prizeAmount.toFixed(2)}
          </motion.div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4 text-center">Final Standings</h2>
          
          <div className="space-y-3">
            {sortedPlayers.map((player, idx) => (
              <motion.div
                key={player.id}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  idx === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-black/30'
                } ${player.bankrupt ? 'opacity-50' : ''}`}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-black' :
                  idx === 1 ? 'bg-gray-400 text-black' :
                  idx === 2 ? 'bg-orange-700 text-white' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {idx + 1}
                </div>
                
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-white/30"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <p className="font-bold flex items-center gap-2">
                    {player.name}
                    {player.id === playerId && (
                      <span className="text-xs bg-blue-500/30 text-blue-400 px-2 py-0.5 rounded">YOU</span>
                    )}
                    {player.bankrupt && (
                      <span className="text-xs bg-red-500/30 text-red-400 px-2 py-0.5 rounded">BUST</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">{player.properties.length} properties</p>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold text-lg ${idx === 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ${player.netWorth?.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs">net worth</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Balance Update */}
        {isWinner && (
          <motion.div 
            className="glass rounded-2xl p-6 mb-6 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <p className="text-gray-400 mb-2">Added to your balance</p>
            <p className="text-3xl font-bold text-green-400">+${prizeAmount.toFixed(2)}</p>
          </motion.div>
        )}

        {/* Play Again */}
        <motion.button
          onClick={resetGame}
          className="w-full py-5 rounded-2xl font-bold text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🎲 Play Again
        </motion.button>
      </div>
    </div>
  );
}
