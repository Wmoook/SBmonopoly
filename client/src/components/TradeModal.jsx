import { useState } from 'react';
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

export default function TradeModal({ onClose }) {
  const { gameState, playerId, proposeTrade } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [myMoney, setMyMoney] = useState(0);
  const [theirMoney, setTheirMoney] = useState(0);
  const [myProperties, setMyProperties] = useState([]);
  const [theirProperties, setTheirProperties] = useState([]);

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const otherPlayers = gameState.players.filter(p => p.id !== playerId && !p.bankrupt);

  const toggleMyProperty = (propIndex) => {
    if (myProperties.includes(propIndex)) {
      setMyProperties(myProperties.filter(p => p !== propIndex));
    } else {
      setMyProperties([...myProperties, propIndex]);
    }
  };

  const toggleTheirProperty = (propIndex) => {
    if (theirProperties.includes(propIndex)) {
      setTheirProperties(theirProperties.filter(p => p !== propIndex));
    } else {
      setTheirProperties([...theirProperties, propIndex]);
    }
  };

  const handleProposeTrade = () => {
    if (!selectedPlayer) return;
    
    proposeTrade(selectedPlayer.id, {
      fromMoney: myMoney,
      toMoney: theirMoney,
      fromProperties: myProperties,
      toProperties: theirProperties,
    });
    
    onClose();
  };

  const isValidTrade = () => {
    if (!selectedPlayer) return false;
    if (myMoney > myPlayer.money) return false;
    if (theirMoney > selectedPlayer.money) return false;
    if (myMoney === 0 && theirMoney === 0 && myProperties.length === 0 && theirProperties.length === 0) return false;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🤝 Propose Trade
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition-all"
          >
            ✕
          </button>
        </div>

        {/* Player Selection */}
        {!selectedPlayer ? (
          <div>
            <h3 className="text-lg font-bold mb-4">Select a player to trade with:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {otherPlayers.map(player => (
                <motion.button
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlayer(player)}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div className="font-bold">{player.name}</div>
                  <div className="text-green-400 text-sm">${player.money.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs">{player.properties.length} properties</div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              ← Change Player
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Offer */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: myPlayer.color }}
                  >
                    {myPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">You Offer</div>
                    <div className="text-sm text-gray-400">Balance: ${myPlayer.money.toFixed(2)}</div>
                  </div>
                </div>

                {/* Money */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Money</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={myMoney}
                      onChange={(e) => setMyMoney(Math.min(parseFloat(e.target.value) || 0, myPlayer.money))}
                      min="0"
                      max={myPlayer.money}
                      step="0.01"
                      className="w-full bg-black/30 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Properties</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {myPlayer.properties.map(propIndex => {
                      const prop = gameState.board[propIndex];
                      const isSelected = myProperties.includes(propIndex);
                      return (
                        <button
                          key={propIndex}
                          onClick={() => toggleMyProperty(propIndex)}
                          className={`p-2 rounded-lg text-left text-xs transition-all ${
                            isSelected 
                              ? 'bg-yellow-400/20 border-2 border-yellow-400' 
                              : 'bg-black/30 border border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div
                            className="w-full h-1 rounded mb-1"
                            style={{ backgroundColor: PROPERTY_COLORS[prop.color] }}
                          />
                          <div className="font-bold truncate">{prop.name}</div>
                          <div className="text-green-400">${prop.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Their Offer */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: selectedPlayer.color }}
                  >
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{selectedPlayer.name} Gives</div>
                    <div className="text-sm text-gray-400">Balance: ${selectedPlayer.money.toFixed(2)}</div>
                  </div>
                </div>

                {/* Money */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Money</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={theirMoney}
                      onChange={(e) => setTheirMoney(Math.min(parseFloat(e.target.value) || 0, selectedPlayer.money))}
                      min="0"
                      max={selectedPlayer.money}
                      step="0.01"
                      className="w-full bg-black/30 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Properties</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {selectedPlayer.properties.map(propIndex => {
                      const prop = gameState.board[propIndex];
                      const isSelected = theirProperties.includes(propIndex);
                      return (
                        <button
                          key={propIndex}
                          onClick={() => toggleTheirProperty(propIndex)}
                          className={`p-2 rounded-lg text-left text-xs transition-all ${
                            isSelected 
                              ? 'bg-yellow-400/20 border-2 border-yellow-400' 
                              : 'bg-black/30 border border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div
                            className="w-full h-1 rounded mb-1"
                            style={{ backgroundColor: PROPERTY_COLORS[prop.color] }}
                          />
                          <div className="font-bold truncate">{prop.name}</div>
                          <div className="text-green-400">${prop.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="font-bold mb-3">Trade Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">You give:</div>
                  {myMoney > 0 && <div className="text-red-400">-${myMoney.toFixed(2)}</div>}
                  {myProperties.map(p => (
                    <div key={p} className="text-red-400">-{gameState.board[p].name}</div>
                  ))}
                  {myMoney === 0 && myProperties.length === 0 && <div className="text-gray-500">Nothing</div>}
                </div>
                <div>
                  <div className="text-gray-400">You get:</div>
                  {theirMoney > 0 && <div className="text-green-400">+${theirMoney.toFixed(2)}</div>}
                  {theirProperties.map(p => (
                    <div key={p} className="text-green-400">+{gameState.board[p].name}</div>
                  ))}
                  {theirMoney === 0 && theirProperties.length === 0 && <div className="text-gray-500">Nothing</div>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleProposeTrade}
                disabled={!isValidTrade()}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  isValidTrade()
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                📤 Send Offer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
