import { motion } from 'framer-motion';
import { useLuckyStreetsStore } from '../store/luckyStreetsStore';

export default function LuckyStreetsLobby() {
  const { gameState, playerId, startGame } = useLuckyStreetsStore();

  if (!gameState) return null;

  const isHost = gameState.players[0]?.id === playerId;
  const canStart = gameState.players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Room Code */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-gray-400 mb-2">Room Code</p>
          <div className="inline-block px-8 py-4 glass rounded-2xl">
            <p className="text-5xl font-mono font-black tracking-widest text-yellow-400">
              {gameState.roomCode}
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-2">Share this code with friends!</p>
        </motion.div>

        {/* Prize Pool */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-gray-400 mb-1">Prize Pool</p>
          <motion.p 
            className="text-5xl font-bold text-green-400"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ${gameState.totalPot?.toFixed(2)}
          </motion.p>
          <p className="text-gray-500 text-sm mt-2">Winner takes all!</p>
        </motion.div>

        {/* Players */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Players</h2>
            <span className="text-gray-400">{gameState.players.length}/4</span>
          </div>

          <div className="space-y-3">
            {gameState.players.map((player, idx) => (
              <motion.div
                key={player.id}
                className="flex items-center gap-4 bg-black/30 rounded-xl p-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/30"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold flex items-center gap-2">
                    {player.name}
                    {player.id === playerId && (
                      <span className="text-xs bg-blue-500/30 text-blue-400 px-2 py-0.5 rounded">YOU</span>
                    )}
                    {idx === 0 && (
                      <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded">HOST</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Ready to play!</p>
                </div>
                <div className="text-green-400 text-2xl">✓</div>
              </motion.div>
            ))}

            {/* Empty slots */}
            {Array(4 - gameState.players.length).fill(0).map((_, idx) => (
              <motion.div
                key={`empty-${idx}`}
                className="flex items-center gap-4 border-2 border-dashed border-white/20 rounded-xl p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-500">
                  ?
                </div>
                <p className="text-gray-500">Waiting for player...</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        {isHost && (
          <motion.button
            onClick={startGame}
            className={`w-full py-5 rounded-2xl font-bold text-2xl transition-all ${
              canStart
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            disabled={!canStart}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
          >
            {canStart ? '🚀 Start Game!' : 'Waiting for players...'}
          </motion.button>
        )}

        {!isHost && (
          <motion.div 
            className="text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="inline-flex items-center gap-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              Waiting for host to start...
            </motion.div>
          </motion.div>
        )}

        {/* Game Info */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass p-4 rounded-xl">
            <p className="text-2xl mb-1">⏱️</p>
            <p className="text-gray-400 text-sm">5 min</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-2xl mb-1">🎰</p>
            <p className="text-gray-400 text-sm">Spin every turn</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-gray-400 text-sm">Winner takes all</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
