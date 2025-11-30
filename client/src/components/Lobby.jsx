import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// Anonymous player icons
const ANON_ICONS = ['🎭', '👤', '🕶️', '🎪'];

export default function Lobby() {
  const { gameState, roomCode, playerId, startGame, accountBalance, isAnonymousGame } = useGameStore();
  const [countdown, setCountdown] = useState(null);

  // For anonymous games, show countdown before auto-start
  useEffect(() => {
    if (gameState?.isAnonymous && gameState.players.length >= 2) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return null;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState?.isAnonymous, gameState?.players?.length]);

  if (!gameState) return null;

  const isHost = gameState.players[0]?.id === playerId;
  const canStart = gameState.players.length >= 2;
  const buyInAmount = gameState.buyIn || 0;
  const totalPot = buyInAmount * gameState.players.length;
  const isAnonymous = gameState.isAnonymous || isAnonymousGame;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* Account Balance */}
      <div className="fixed top-4 left-4 glass p-4 rounded-xl">
        <div className="text-sm text-gray-400">Account Balance</div>
        <div className="text-2xl font-bold text-green-400">${accountBalance.toFixed(2)}</div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-8 rounded-2xl w-full max-w-lg"
      >
        {/* Game type indicator */}
        <div className="flex justify-center mb-4">
          {isAnonymous ? (
            <span className="px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
              🎭 ANONYMOUS MATCH
            </span>
          ) : (
            <span className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold">
              🔐 PRIVATE GAME
            </span>
          )}
        </div>

        {/* Room Code - only show for private games */}
        {!isAnonymous && (
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">Room Code</p>
            <div className="text-5xl font-mono font-bold tracking-widest text-yellow-400">
              {roomCode}
            </div>
            <p className="text-sm text-gray-500 mt-2">Share this code with your friends!</p>
          </div>
        )}

        {/* Buy-in and Pot info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass p-4 rounded-lg text-center bg-blue-500/10">
            <p className="text-gray-400 text-sm">Buy-In</p>
            <p className="text-2xl font-bold text-blue-400">${buyInAmount}</p>
          </div>
          <div className="glass p-4 rounded-lg text-center bg-green-500/10">
            <p className="text-gray-400 text-sm">Prize Pool</p>
            <p className="text-2xl font-bold text-green-400">${totalPot}</p>
          </div>
        </div>

        {/* Players list */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>👥 Players</span>
            <span className="text-gray-400 text-sm">({gameState.players.length}/4)</span>
          </h3>
          <div className="space-y-2">
            {gameState.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 glass p-3 rounded-lg"
              >
                {isAnonymous ? (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                    {ANON_ICONS[index]}
                  </div>
                ) : (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                )}
                <span className="flex-1 font-medium">
                  {isAnonymous ? `Player ${index + 1}` : player.name}
                </span>
                <span className="text-sm text-green-400">${buyInAmount}</span>
                {!isAnonymous && index === 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    HOST
                  </span>
                )}
                {player.id === playerId && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    YOU
                  </span>
                )}
              </motion.div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - gameState.players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 border border-dashed border-gray-600 p-3 rounded-lg opacity-50"
              >
                {isAnonymous ? (
                  <div className="w-8 h-8 rounded-full bg-gray-600/50 flex items-center justify-center">
                    <span className="text-gray-500">?</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-600" />
                )}
                <span className="text-gray-500">Waiting for player...</span>
                <span className="text-sm text-gray-500 ml-auto">+${buyInAmount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start button or waiting message */}
        {isAnonymous ? (
          <div className="text-center">
            {countdown !== null ? (
              <div className="py-4">
                <div className="text-4xl font-bold text-yellow-400 mb-2">{countdown}</div>
                <div className="text-gray-400">Game starting...</div>
              </div>
            ) : (
              <div className="py-4 text-gray-400">
                Waiting for players... Game starts automatically
              </div>
            )}
          </div>
        ) : isHost ? (
          <button
            onClick={startGame}
            disabled={!canStart}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              canStart
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canStart ? `🎲 Start Game (${gameState.players.length} players)` : 'Waiting for more players...'}
          </button>
        ) : (
          <div className="text-center text-gray-400 py-4">
            Waiting for host to start the game...
          </div>
        )}
      </motion.div>

      {/* Game rules reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 glass p-6 rounded-xl max-w-lg"
      >
        <h3 className="font-bold mb-3">📋 Game Flow</h3>
        <ol className="text-sm text-gray-300 space-y-2">
          <li>1️⃣ <strong>Roll Dice:</strong> Move around the board</li>
          <li>2️⃣ <strong>Buy or Auction:</strong> Land on properties to buy or auction</li>
          <li>3️⃣ <strong>Collect Rent:</strong> Own properties to collect from others</li>
          <li>4️⃣ <strong>Win:</strong> Last player standing takes ${totalPot}!</li>
        </ol>
        {isAnonymous && (
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg text-purple-400 text-sm">
            🎭 <strong>Anonymous Mode:</strong> All players are anonymous. No teaming up!
          </div>
        )}
      </motion.div>
    </div>
  );
}
