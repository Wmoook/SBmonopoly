import { motion, AnimatePresence } from 'framer-motion';
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

export default function TradeProposalModal({ proposal, onClose }) {
  const { gameState, acceptTrade, declineTrade } = useGameStore();

  const fromPlayer = gameState.players.find(p => p.id === proposal.fromPlayerId);
  const { offer } = proposal;

  const handleAccept = () => {
    acceptTrade(proposal.fromPlayerId, offer);
    onClose();
  };

  const handleDecline = () => {
    declineTrade(proposal.fromPlayerId);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl w-full max-w-lg border border-yellow-400/50"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-5xl mb-4"
          >
            🤝
          </motion.div>
          <h2 className="text-2xl font-bold">Trade Offer!</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: fromPlayer?.color }}
            />
            <span className="font-bold">{fromPlayer?.name}</span>
            <span className="text-gray-400">wants to trade</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* What they offer */}
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
            <div className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>📥</span> You Get
            </div>
            {offer.fromMoney > 0 && (
              <div className="text-green-400 font-bold mb-2">
                +${offer.fromMoney.toFixed(2)}
              </div>
            )}
            {offer.fromProperties.map(propIndex => {
              const prop = gameState.board[propIndex];
              return (
                <div key={propIndex} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: PROPERTY_COLORS[prop.color] }}
                  />
                  <span className="text-sm">{prop.name}</span>
                </div>
              );
            })}
            {offer.fromMoney === 0 && offer.fromProperties.length === 0 && (
              <div className="text-gray-500 text-sm">Nothing</div>
            )}
          </div>

          {/* What you give */}
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
            <div className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <span>📤</span> You Give
            </div>
            {offer.toMoney > 0 && (
              <div className="text-red-400 font-bold mb-2">
                -${offer.toMoney.toFixed(2)}
              </div>
            )}
            {offer.toProperties.map(propIndex => {
              const prop = gameState.board[propIndex];
              return (
                <div key={propIndex} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: PROPERTY_COLORS[prop.color] }}
                  />
                  <span className="text-sm">{prop.name}</span>
                </div>
              );
            })}
            {offer.toMoney === 0 && offer.toProperties.length === 0 && (
              <div className="text-gray-500 text-sm">Nothing</div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDecline}
            className="flex-1 py-4 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold transition-all"
          >
            ✕ Decline
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAccept}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold transition-all"
          >
            ✓ Accept
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
