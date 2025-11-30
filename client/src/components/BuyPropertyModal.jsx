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
  railroad: '#333',
  utility: '#666',
};

export default function BuyPropertyModal({ property, propertyIndex, onBuy, onAuction }) {
  const { gameState, playerId } = useGameStore();
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const canAfford = myPlayer && myPlayer.money >= property.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, rotateY: -15 }}
        animate={{ scale: 1, y: 0, rotateY: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl w-full max-w-md overflow-hidden border border-white/20"
      >
        {/* Property Card Header */}
        <div
          className="h-24 flex items-end p-4"
          style={{ 
            backgroundColor: PROPERTY_COLORS[property.color] || '#333',
            boxShadow: 'inset 0 -30px 60px rgba(0,0,0,0.3)'
          }}
        >
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {property.name}
          </h2>
        </div>

        <div className="p-6">
          {/* Property Details */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Purchase Price</span>
              <span className="text-2xl font-bold text-green-400">${property.price.toFixed(2)}</span>
            </div>
            
            {property.rent && !property.isRailroad && !property.isUtility && (
              <>
                <div className="border-t border-white/10 pt-3">
                  <div className="text-sm text-gray-400 mb-2">Rent Schedule</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Base</div>
                      <div className="font-bold">${property.rent[0]?.toFixed(2)}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">1 House</div>
                      <div className="font-bold">${property.rent[1]?.toFixed(2)}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Hotel</div>
                      <div className="font-bold">${property.rent[5]?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">House Cost</span>
                  <span className="font-bold">${property.housePrice?.toFixed(2)}</span>
                </div>
              </>
            )}

            {property.isRailroad && (
              <div className="text-sm text-gray-400">
                Rent: $25 per railroad owned (max $200 with 4)
              </div>
            )}

            {property.isUtility && (
              <div className="text-sm text-gray-400">
                Rent: 4x dice roll (10x with both utilities)
              </div>
            )}
          </div>

          {/* Your Balance */}
          <div className="flex justify-between items-center mb-6 p-3 bg-white/5 rounded-lg">
            <span className="text-gray-400">Your Balance</span>
            <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              ${myPlayer?.money.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAuction}
              className="py-4 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 font-bold transition-all border border-orange-500/30"
            >
              <span className="text-2xl block mb-1">🔨</span>
              Auction
            </motion.button>
            
            <motion.button
              whileHover={canAfford ? { scale: 1.02 } : {}}
              whileTap={canAfford ? { scale: 0.98 } : {}}
              onClick={onBuy}
              disabled={!canAfford}
              className={`py-4 rounded-xl font-bold transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl block mb-1">💰</span>
              Buy ${property.price.toFixed(2)}
            </motion.button>
          </div>

          {!canAfford && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-red-400 text-sm"
            >
              Insufficient funds to purchase
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
