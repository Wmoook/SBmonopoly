import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function GameOver() {
  const { gameState, playerId, resetGame } = useGameStore();

  if (!gameState) return null;

  const activePlayers = gameState.players.filter(p => !p.bankrupt);
  const winner = activePlayers.length === 1 
    ? activePlayers[0] 
    : gameState.players.reduce((a, b) => a.netWorth > b.netWorth ? a : b);

  const prizePool = gameState.totalPot || gameState.players.reduce((sum, p) => sum + (p.deposit || 0), 0);
  const isWinner = winner?.id === playerId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        {/* Confetti effect using emojis */}
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🎉🏆🎉
        </motion.div>

        <h1 className="font-game text-5xl text-yellow-400 mb-4">
          GAME OVER!
        </h1>

        {/* Winner card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <div className="text-gray-400 mb-2">🏆 WINNER</div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full border-4 border-yellow-400"
              style={{ backgroundColor: winner.color }}
            />
            <span className="text-4xl font-bold text-yellow-400">
              {winner.name}
            </span>
          </div>

          <div className="text-6xl font-bold text-green-400 mb-2">
            +${prizePool}
          </div>
          <div className="text-gray-400">Prize Pool Won</div>
        </motion.div>

        {/* Final standings */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 rounded-xl mb-8"
        >
          <h3 className="font-bold mb-4">Final Standings</h3>
          <div className="space-y-2">
            {[...gameState.players]
              .sort((a, b) => b.netWorth - a.netWorth)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                  }`}
                >
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="flex-1 font-medium">{player.name}</span>
                  <span className={player.bankrupt ? 'text-red-400' : 'text-green-400'}>
                    ${player.netWorth}
                    {player.bankrupt && ' 💀'}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Game stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass p-6 rounded-xl mb-8"
        >
          <h3 className="font-bold mb-4">📊 Game Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Turns:</span>
              <span className="ml-2 font-bold">{gameState.turnNumber}</span>
            </div>
            <div>
              <span className="text-gray-400">Properties Owned:</span>
              <span className="ml-2 font-bold">
                {gameState.board.filter(s => s.owner).length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Buildings Built:</span>
              <span className="ml-2 font-bold">
                {gameState.board.reduce((sum, s) => sum + (s.houses || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Players Bankrupted:</span>
              <span className="ml-2 font-bold">
                {gameState.players.filter(p => p.bankrupt).length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Play again button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
            text-black font-bold text-xl rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
        >
          🎲 Play Again
        </motion.button>
      </motion.div>
    </div>
  );
}
