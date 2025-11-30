import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function PowerTokens({ player }) {
  const { usePowerToken, gameState, playerId } = useGameStore();
  const [selectedToken, setSelectedToken] = useState(null);
  const [showTargetSelect, setShowTargetSelect] = useState(false);

  const isMyTurn = gameState?.players[gameState?.currentPlayerIndex]?.id === playerId;

  const tokens = [
    {
      id: 'reroll',
      name: 'Re-Roll',
      icon: '🎲',
      description: 'Re-roll one die',
      requiresTarget: false,
    },
    {
      id: 'move-adjust',
      name: 'Move Adjust',
      icon: '👟',
      description: 'Move +2 or -2 spaces',
      requiresTarget: true,
      targetType: 'adjustment',
    },
    {
      id: 'block-property',
      name: 'Block Property',
      icon: '🚫',
      description: 'Block a property for 1 turn',
      requiresTarget: true,
      targetType: 'property',
    },
    {
      id: 'force-auction',
      name: 'Force Auction',
      icon: '⚔️',
      description: "Force player's property to auction",
      requiresTarget: true,
      targetType: 'playerProperty',
    },
  ];

  const handleTokenClick = (token) => {
    if (player.powerTokens <= 0 || !isMyTurn) return;
    
    if (token.requiresTarget) {
      setSelectedToken(token);
      setShowTargetSelect(true);
    } else {
      usePowerToken(token.id);
    }
  };

  const handleTargetSelect = (targetData) => {
    usePowerToken(selectedToken.id, targetData);
    setSelectedToken(null);
    setShowTargetSelect(false);
  };

  const getOtherPlayersProperties = () => {
    return gameState.players
      .filter(p => p.id !== playerId && !p.bankrupt)
      .flatMap(p => p.properties.map(propIndex => ({
        playerId: p.id,
        playerName: p.name,
        propertyIndex: propIndex,
        propertyName: gameState.board[propIndex].name,
      })));
  };

  return (
    <div className="glass p-4 rounded-xl">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <span>⚡ Power Tokens</span>
        <span className="text-purple-400">({player.powerTokens} left)</span>
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {tokens.map((token) => (
          <motion.button
            key={token.id}
            whileHover={player.powerTokens > 0 && isMyTurn ? { scale: 1.05 } : {}}
            whileTap={player.powerTokens > 0 && isMyTurn ? { scale: 0.95 } : {}}
            onClick={() => handleTokenClick(token)}
            disabled={player.powerTokens <= 0 || !isMyTurn}
            className={`p-2 rounded-lg text-center transition-all ${
              player.powerTokens > 0 && isMyTurn
                ? 'bg-purple-500/20 hover:bg-purple-500/40 cursor-pointer'
                : 'bg-gray-700/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-1">{token.icon}</div>
            <div className="text-xs font-medium">{token.name}</div>
          </motion.button>
        ))}
      </div>

      {/* Target selection modal */}
      {showTargetSelect && selectedToken && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTargetSelect(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="glass p-6 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <span>{selectedToken.icon}</span>
              <span>{selectedToken.name}</span>
            </h3>
            <p className="text-gray-400 mb-4">{selectedToken.description}</p>

            {selectedToken.targetType === 'adjustment' && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleTargetSelect({ adjustment: -2 })}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold"
                >
                  ← Move Back 2
                </button>
                <button
                  onClick={() => handleTargetSelect({ adjustment: 2 })}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold"
                >
                  Move Forward 2 →
                </button>
              </div>
            )}

            {selectedToken.targetType === 'property' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameState.board
                  .map((space, index) => ({ ...space, index }))
                  .filter(s => s.type === 'property' && !s.owner)
                  .map((space) => (
                    <button
                      key={space.index}
                      onClick={() => handleTargetSelect({ propertyIndex: space.index })}
                      className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left"
                    >
                      {space.name}
                    </button>
                  ))}
              </div>
            )}

            {selectedToken.targetType === 'playerProperty' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {getOtherPlayersProperties().map((item) => (
                  <button
                    key={`${item.playerId}-${item.propertyIndex}`}
                    onClick={() => handleTargetSelect({
                      targetPlayerId: item.playerId,
                      propertyIndex: item.propertyIndex,
                    })}
                    className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left"
                  >
                    <div className="font-medium">{item.propertyName}</div>
                    <div className="text-sm text-gray-400">Owned by {item.playerName}</div>
                  </button>
                ))}
                {getOtherPlayersProperties().length === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No properties to target
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowTargetSelect(false)}
              className="w-full mt-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
