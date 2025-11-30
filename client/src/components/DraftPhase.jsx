import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const PROPERTY_COLORS = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFFF00',
  green: '#008000',
  darkblue: '#00008B',
  railroad: '#000000',
  utility: '#808080',
};

export default function DraftPhase() {
  const { gameState, draftProperties, currentDrafter, playerId, draftProperty } = useGameStore();

  if (!gameState) return null;

  const isMyTurn = currentDrafter?.id === playerId;
  const myPlayer = gameState.players.find(p => p.id === playerId);

  return (
    <div className="flex flex-col items-center min-h-[80vh]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="font-game text-4xl text-yellow-400 mb-2">📜 PROPERTY DRAFT</h1>
        <p className="text-gray-300">Pick your starting properties strategically!</p>
      </motion.div>

      {/* Current drafter indicator */}
      <motion.div
        key={currentDrafter?.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`glass p-4 rounded-xl mb-8 ${isMyTurn ? 'ring-2 ring-yellow-400' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: currentDrafter?.color }}
          />
          <span className="text-xl font-bold">
            {isMyTurn ? "Your turn to pick!" : `${currentDrafter?.name}'s turn...`}
          </span>
        </div>
      </motion.div>

      {/* Draft properties */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mb-8">
        {draftProperties.map((property, i) => (
          <motion.div
            key={property.index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={isMyTurn ? { scale: 1.05 } : {}}
            onClick={() => isMyTurn && draftProperty(property.index)}
            className={`glass rounded-xl overflow-hidden cursor-pointer transition-all ${
              isMyTurn ? 'hover:ring-2 hover:ring-yellow-400' : 'opacity-70'
            }`}
          >
            {/* Color bar */}
            <div
              className="h-3"
              style={{ backgroundColor: PROPERTY_COLORS[property.color] || '#666' }}
            />
            
            <div className="p-4">
              <h3 className="font-bold text-sm mb-2 truncate">{property.name}</h3>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="text-green-400">${property.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Rent:</span>
                  <span className="text-yellow-400">
                    ${property.isRailroad ? property.rent[0] : (property.rent?.[0] || 'N/A')}
                  </span>
                </div>
                {property.housePrice && (
                  <div className="flex justify-between">
                    <span>House Cost:</span>
                    <span className="text-blue-400">${property.housePrice}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Players and their drafted properties */}
      <div className="glass p-6 rounded-xl w-full max-w-3xl">
        <h3 className="font-bold mb-4">Players' Properties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.players.map((player) => (
            <div key={player.id} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-medium text-sm">
                  {player.name}
                  {player.id === playerId && ' (You)'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {player.properties.length} / 2 properties
              </div>
              <div className="mt-2 space-y-1">
                {player.properties.map((propIndex) => (
                  <div
                    key={propIndex}
                    className="text-xs bg-white/10 rounded px-2 py-1 truncate"
                  >
                    {gameState.board[propIndex]?.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
