import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function PlayerPanel() {
  const { gameState, playerId } = useGameStore();

  if (!gameState) return null;

  // Sort players by net worth for leaderboard
  const sortedPlayers = [...gameState.players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-4 rounded-xl space-y-3"
    >
      <h3 className="font-bold text-lg flex items-center gap-2">
        <span>👥</span> Players
        <span className="text-xs text-gray-400 ml-auto">{gameState.players.filter(p => !p.bankrupt).length} active</span>
      </h3>
      
      {sortedPlayers.map((player, rank) => {
        const isMe = player.id === playerId;
        const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === player.id;
        
        return (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1 }}
            className={`p-3 rounded-xl transition-all relative overflow-hidden ${
              player.bankrupt 
                ? 'bg-red-900/20 opacity-50' 
                : isCurrentTurn 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 ring-2 ring-yellow-400/50' 
                  : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {/* Rank badge */}
            {!player.bankrupt && (
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                rank === 0 ? 'bg-yellow-500 text-black' :
                rank === 1 ? 'bg-gray-400 text-black' :
                rank === 2 ? 'bg-orange-700 text-white' :
                'bg-white/10'
              }`}>
                {rank + 1}
              </div>
            )}

            {/* Current turn indicator */}
            {isCurrentTurn && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"
                layoutId="currentTurn"
              />
            )}

            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-lg"
                style={{ 
                  backgroundColor: player.color,
                  borderColor: isCurrentTurn ? '#fbbf24' : 'rgba(255,255,255,0.3)'
                }}
                animate={isCurrentTurn ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {player.name.charAt(0).toUpperCase()}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate flex items-center gap-1">
                  {player.name}
                  {isMe && <span className="text-xs text-blue-400 bg-blue-400/20 px-1 rounded">YOU</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {player.properties.length} properties
                </div>
              </div>
              {player.bankrupt && (
                <span className="text-2xl">💀</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-gray-400 text-xs">Cash</div>
                <div className={`font-bold ${player.money < 1 ? 'text-red-400' : 'text-green-400'}`}>
                  ${player.money.toFixed(2)}
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-gray-400 text-xs">Net Worth</div>
                <div className="font-bold text-yellow-400">
                  ${player.netWorth?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {player.inJail && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-1 text-center text-red-400"
              >
                🔒 In Jail ({3 - player.jailTurns} turns left)
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
