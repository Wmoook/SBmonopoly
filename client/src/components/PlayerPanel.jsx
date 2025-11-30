import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function PlayerPanel() {
  const { gameState, playerId } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="glass p-4 rounded-xl space-y-3">
      <h3 className="font-bold text-lg mb-4">👥 Players</h3>
      
      {gameState.players.map((player, index) => {
        const isMe = player.id === playerId;
        const isCurrentTurn = index === gameState.currentPlayerIndex;
        
        return (
          <motion.div
            key={player.id}
            className={`p-3 rounded-lg transition-all ${
              player.bankrupt 
                ? 'bg-red-900/30 opacity-50' 
                : isCurrentTurn 
                  ? 'bg-yellow-500/20 ring-2 ring-yellow-400' 
                  : 'bg-white/5'
            }`}
            animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: isCurrentTurn ? Infinity : 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-medium flex-1 truncate">
                {player.name}
                {isMe && <span className="text-blue-400 ml-1">(You)</span>}
              </span>
              {player.bankrupt && (
                <span className="text-xs text-red-400">💀</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Cash:</span>
                <span className={`ml-1 font-bold ${player.money < 100 ? 'text-red-400' : 'text-green-400'}`}>
                  ${player.money}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Worth:</span>
                <span className="ml-1 font-bold text-yellow-400">${player.netWorth}</span>
              </div>
              <div>
                <span className="text-gray-400">Properties:</span>
                <span className="ml-1 font-bold">{player.properties.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Tokens:</span>
                <span className="ml-1 font-bold text-purple-400">{player.powerTokens}⚡</span>
              </div>
            </div>

            {player.inJail && (
              <div className="mt-2 text-xs bg-gray-700 rounded px-2 py-1 text-center">
                🔒 In Jail ({3 - player.jailTurns} turns left)
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
