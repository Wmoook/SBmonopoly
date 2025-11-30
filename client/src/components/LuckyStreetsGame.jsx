import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLuckyStreetsStore } from '../store/luckyStreetsStore';
import SpinWheel from './SpinWheel';

// Simple linear board for Lucky Streets
const BOARD_SPACES = [
  { name: 'GO', type: 'go', color: null, icon: '🚀' },
  { name: 'Vine', type: 'property', color: '#8B4513' },
  { name: 'Luck', type: 'luck', color: null, icon: '🍀' },
  { name: 'Oak', type: 'property', color: '#8B4513' },
  { name: 'Palm', type: 'property', color: '#87CEEB' },
  { name: 'Train', type: 'property', color: '#1f2937', icon: '🚂' },
  { name: 'Rose', type: 'property', color: '#87CEEB' },
  { name: 'Luck', type: 'luck', color: null, icon: '🍀' },
  { name: 'Cedar', type: 'property', color: '#EC4899' },
  { name: 'Jail', type: 'jail', color: null, icon: '⛓️' },
  { name: 'Maple', type: 'property', color: '#EC4899' },
  { name: 'Elec', type: 'property', color: '#fbbf24', icon: '⚡' },
  { name: 'Pine', type: 'property', color: '#F97316' },
  { name: 'Luck', type: 'luck', color: null, icon: '🍀' },
  { name: 'Beach', type: 'property', color: '#F97316' },
  { name: 'Train', type: 'property', color: '#1f2937', icon: '🚂' },
  { name: 'Sun', type: 'property', color: '#EF4444' },
  { name: 'Park', type: 'free', color: null, icon: '🅿️' },
  { name: 'Moon', type: 'property', color: '#EF4444' },
  { name: 'Water', type: 'property', color: '#fbbf24', icon: '💧' },
  { name: 'Star', type: 'property', color: '#22C55E' },
  { name: 'Luck', type: 'luck', color: null, icon: '🍀' },
  { name: 'Gold', type: 'property', color: '#22C55E' },
  { name: 'Diamond', type: 'property', color: '#3B82F6', icon: '💎' },
];

function GameSpace({ space, index, players, board, isActive }) {
  const playersHere = players.filter(p => p.position === index && !p.bankrupt);
  const boardSpace = board?.[index];
  const owner = boardSpace?.owner;
  const ownerPlayer = players.find(p => p.id === owner);
  const houses = players.reduce((h, p) => h + (p.houses?.[index] || 0), 0);

  return (
    <motion.div
      className={`relative w-12 h-14 md:w-14 md:h-16 rounded-lg flex flex-col items-center justify-center text-xs font-bold border-2 transition-all ${
        isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/10'
      }`}
      style={{ 
        backgroundColor: space.color ? `${space.color}20` : 'rgba(255,255,255,0.05)',
        borderTopColor: space.color || 'transparent',
        borderTopWidth: space.color ? '4px' : '2px'
      }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
    >
      {/* Space content */}
      {space.icon ? (
        <span className="text-lg">{space.icon}</span>
      ) : (
        <span className="text-[10px] text-gray-300 truncate w-full text-center px-0.5">
          {space.name}
        </span>
      )}
      
      {/* Price */}
      {boardSpace?.price && !boardSpace.owner && (
        <span className="text-[8px] text-green-400">${boardSpace.price}</span>
      )}
      
      {/* Owner indicator */}
      {ownerPlayer && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
          style={{ backgroundColor: ownerPlayer.color }}
        />
      )}
      
      {/* Houses */}
      {houses > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array(houses).fill(0).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-sm" />
          ))}
        </div>
      )}
      
      {/* Players on space */}
      {playersHere.length > 0 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex -space-x-1">
          {playersHere.map(p => (
            <motion.div
              key={p.id}
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: p.color }}
              layoutId={`player-${p.id}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function LuckyStreetsGame() {
  const { 
    gameState, 
    playerId,
    rollDice,
    buyProperty,
    skipBuy,
    endTurn,
    lastSpin,
    isSpinning,
    pendingBuy,
  } = useLuckyStreetsStore();

  const [showWheel, setShowWheel] = useState(false);
  const [currentSpin, setCurrentSpin] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  if (!gameState) return null;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const currentPlayer = gameState.currentPlayer;
  const isMyTurn = currentPlayer?.id === playerId;
  const board = gameState.board || [];
  
  // Timer display
  const minutes = Math.floor(gameState.timeRemaining / 60000);
  const seconds = Math.floor((gameState.timeRemaining % 60000) / 1000);

  // Handle spin result
  useEffect(() => {
    if (lastSpin) {
      setCurrentSpin(lastSpin);
      setShowWheel(true);
    }
  }, [lastSpin]);

  const handleRoll = () => {
    rollDice();
  };

  const handleSpinComplete = () => {
    setTimeout(() => {
      setShowWheel(false);
      // Show action options if available
    }, 1500);
  };

  // Determine board layout - make it circular/track style
  const topRow = BOARD_SPACES.slice(0, 6);
  const rightCol = BOARD_SPACES.slice(6, 12);
  const bottomRow = BOARD_SPACES.slice(12, 18).reverse();
  const leftCol = BOARD_SPACES.slice(18, 24).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Top Bar - Timer & Pot */}
      <div className="flex justify-between items-center mb-4">
        <motion.div 
          className="glass px-6 py-3 rounded-full flex items-center gap-3"
          animate={gameState.timeRemaining < 60000 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <span className="text-2xl">⏱️</span>
          <span className={`text-3xl font-mono font-bold ${
            gameState.timeRemaining < 60000 ? 'text-red-400' : 'text-white'
          }`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </motion.div>

        <motion.div 
          className="glass px-6 py-3 rounded-full flex items-center gap-3"
          animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3)', '0 0 40px rgba(34,197,94,0.6)', '0 0 20px rgba(34,197,94,0.3)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-2xl">💰</span>
          <span className="text-3xl font-bold text-green-400">
            ${gameState.totalPot?.toFixed(2)}
          </span>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left - Players */}
        <div className="lg:w-64 space-y-3">
          <h2 className="text-lg font-bold text-gray-400 px-2">Players</h2>
          {gameState.players.map((player, idx) => {
            const isCurrentPlayer = currentPlayer?.id === player.id;
            const isMe = player.id === playerId;
            
            return (
              <motion.div
                key={player.id}
                className={`glass p-4 rounded-xl transition-all ${
                  isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''
                } ${player.bankrupt ? 'opacity-50' : ''}`}
                animate={isCurrentPlayer ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/30"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2">
                      {player.name}
                      {isMe && <span className="text-xs bg-blue-500/30 text-blue-400 px-2 py-0.5 rounded">YOU</span>}
                      {isCurrentPlayer && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded">TURN</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      {player.properties.length} properties
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-black/30 rounded-lg py-2">
                    <div className="text-gray-500 text-xs">Cash</div>
                    <div className={`font-bold ${player.money < 1 ? 'text-red-400' : 'text-green-400'}`}>
                      ${player.money?.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg py-2">
                    <div className="text-gray-500 text-xs">Worth</div>
                    <div className="font-bold text-yellow-400">
                      ${player.netWorth?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Streak indicator */}
                {player.streak > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-orange-400">
                    <span>🔥</span>
                    <span className="text-sm font-bold">Streak: {player.streak}</span>
                  </div>
                )}

                {/* Shield indicator */}
                {player.shield && (
                  <div className="mt-2 flex items-center gap-1 text-blue-400">
                    <span>🛡️</span>
                    <span className="text-sm">Shield Active</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Center - Board & Wheel */}
        <div className="flex-1 flex flex-col items-center gap-6">
          {/* Board - Track Layout */}
          <div className="relative bg-black/30 p-4 rounded-2xl backdrop-blur">
            <div className="flex flex-col gap-1">
              {/* Top row */}
              <div className="flex gap-1 justify-center">
                {topRow.map((space, i) => (
                  <GameSpace 
                    key={i} 
                    space={space} 
                    index={i} 
                    players={gameState.players}
                    board={board}
                    isActive={myPlayer?.position === i}
                  />
                ))}
              </div>
              
              {/* Middle section with side columns */}
              <div className="flex justify-between">
                {/* Left column (reversed) */}
                <div className="flex flex-col gap-1">
                  {leftCol.map((space, i) => (
                    <GameSpace 
                      key={23-i} 
                      space={space} 
                      index={23-i} 
                      players={gameState.players}
                      board={board}
                      isActive={myPlayer?.position === 23-i}
                    />
                  ))}
                </div>
                
                {/* Center content */}
                <div className="flex-1 flex items-center justify-center p-4">
                  {showWheel ? (
                    <SpinWheel 
                      spinning={isSpinning}
                      result={currentSpin}
                      onSpinComplete={handleSpinComplete}
                    />
                  ) : (
                    <div className="text-center">
                      <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                        LUCKY STREETS
                      </h1>
                      <p className="text-gray-400">Roll • Spin • Win!</p>
                      
                      {isMyTurn && (
                        <motion.button
                          onClick={handleRoll}
                          className="mt-6 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl shadow-lg hover:shadow-green-500/50 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          🎲 ROLL & SPIN! 🎲
                        </motion.button>
                      )}
                      
                      {!isMyTurn && currentPlayer && (
                        <div className="mt-6 text-gray-400">
                          Waiting for <span className="font-bold" style={{ color: currentPlayer.color }}>{currentPlayer.name}</span>...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Right column */}
                <div className="flex flex-col gap-1">
                  {rightCol.map((space, i) => (
                    <GameSpace 
                      key={6+i} 
                      space={space} 
                      index={6+i} 
                      players={gameState.players}
                      board={board}
                      isActive={myPlayer?.position === 6+i}
                    />
                  ))}
                </div>
              </div>
              
              {/* Bottom row (reversed) */}
              <div className="flex gap-1 justify-center">
                {bottomRow.map((space, i) => (
                  <GameSpace 
                    key={17-i} 
                    space={space} 
                    index={17-i} 
                    players={gameState.players}
                    board={board}
                    isActive={myPlayer?.position === 17-i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right - My Properties & Actions */}
        <div className="lg:w-64 space-y-4">
          {myPlayer && (
            <>
              {/* Quick Stats */}
              <div className="glass p-4 rounded-xl">
                <h3 className="font-bold mb-3 text-gray-400">Your Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cash</span>
                    <span className="font-bold text-green-400">${myPlayer.money?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Properties</span>
                    <span className="font-bold">{myPlayer.properties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Net Worth</span>
                    <span className="font-bold text-yellow-400">${myPlayer.netWorth?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Streak</span>
                    <span className="font-bold text-orange-400">{myPlayer.streak || 0} 🔥</span>
                  </div>
                </div>
              </div>

              {/* My Properties */}
              <div className="glass p-4 rounded-xl max-h-64 overflow-y-auto">
                <h3 className="font-bold mb-3 text-gray-400">Your Properties</h3>
                {myPlayer.properties.length === 0 ? (
                  <p className="text-gray-500 text-sm">No properties yet!</p>
                ) : (
                  <div className="space-y-2">
                    {myPlayer.properties.map(propIndex => {
                      const prop = board[propIndex];
                      const houses = myPlayer.houses?.[propIndex] || 0;
                      return (
                        <div 
                          key={propIndex}
                          className="flex items-center justify-between bg-black/30 rounded-lg p-2"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: prop?.color || '#666' }}
                            />
                            <span className="text-sm">{prop?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array(houses).fill(0).map((_, i) => (
                              <div key={i} className="w-2 h-2 bg-green-500 rounded-sm" />
                            ))}
                            <span className="text-xs text-gray-400">${prop?.rent}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buy Property Modal */}
      <AnimatePresence>
        {pendingBuy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-2xl max-w-md w-full text-center"
            >
              <h2 className="text-2xl font-bold mb-4">🏠 Buy Property?</h2>
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-4"
                style={{ backgroundColor: pendingBuy.property?.color || '#666' }}
              />
              <p className="text-xl mb-2">{pendingBuy.property?.name}</p>
              <p className="text-3xl font-bold text-green-400 mb-6">${pendingBuy.price}</p>
              
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={buyProperty}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={myPlayer?.money < pendingBuy.price}
                >
                  ✓ BUY
                </motion.button>
                <motion.button
                  onClick={skipBuy}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✗ SKIP
                </motion.button>
              </div>
              
              {myPlayer?.money < pendingBuy.price && (
                <p className="text-red-400 mt-4">Not enough money!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
