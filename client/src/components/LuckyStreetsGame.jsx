import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLuckyStreetsStore } from '../store/luckyStreetsStore';
import SpinWheel from './SpinWheel';

// 30 SPACE BOARD - BIGGER AND COOLER!
const BOARD_SPACES = [
  { id: 0, name: 'GO!', type: 'go', emoji: '🚀', color: null },
  { id: 1, name: 'Crypto', type: 'property', emoji: '₿', color: '#9C27B0' },
  { id: 2, name: 'SPIN', type: 'spin', emoji: '🎡', color: '#FFD700' },
  { id: 3, name: 'Meme', type: 'property', emoji: '🐸', color: '#E91E63' },
  { id: 4, name: 'Diamond', type: 'property', emoji: '💎', color: '#3F51B5' },
  { id: 5, name: 'Lucky', type: 'lucky', emoji: '🍀', color: '#4CAF50' },
  { id: 6, name: 'Rocket', type: 'property', emoji: '🚀', color: '#2196F3' },
  { id: 7, name: 'JACKPOT', type: 'jackpot', emoji: '🎰', color: '#FFD700' },
  { id: 8, name: 'Moon', type: 'property', emoji: '🌙', color: '#00BCD4' },
  { id: 9, name: 'SPIN', type: 'spin', emoji: '🎡', color: '#FFD700' },
  { id: 10, name: 'NFT', type: 'property', emoji: '🖼️', color: '#009688' },
  { id: 11, name: 'YOLO', type: 'property', emoji: '🎲', color: '#4CAF50' },
  { id: 12, name: 'FREE', type: 'free', emoji: '🅿️', color: null },
  { id: 13, name: 'Degen', type: 'property', emoji: '🎰', color: '#8BC34A' },
  { id: 14, name: 'Whale', type: 'property', emoji: '🐋', color: '#CDDC39' },
  { id: 15, name: 'SPIN', type: 'spin', emoji: '🎡', color: '#FFD700' },
  { id: 16, name: 'Lambo', type: 'property', emoji: '🏎️', color: '#FFC107' },
  { id: 17, name: 'CHAOS', type: 'chaos', emoji: '💥', color: '#FF5722' },
  { id: 18, name: 'Pent', type: 'property', emoji: '🏰', color: '#FF9800' },
  { id: 19, name: 'Ape', type: 'property', emoji: '🦍', color: '#FF5722' },
  { id: 20, name: 'SPIN', type: 'spin', emoji: '🎡', color: '#FFD700' },
  { id: 21, name: 'Billion', type: 'property', emoji: '💰', color: '#795548' },
  { id: 22, name: 'TAX', type: 'tax', emoji: '🏛️', color: '#8B0000' },
  { id: 23, name: 'Gold', type: 'property', emoji: '🏆', color: '#FFD700' },
  { id: 24, name: 'SPIN', type: 'spin', emoji: '🎡', color: '#FFD700' },
  { id: 25, name: 'Castle', type: 'property', emoji: '🏯', color: '#607D8B' },
  { id: 26, name: 'Lucky', type: 'lucky', emoji: '🍀', color: '#4CAF50' },
  { id: 27, name: 'Mall', type: 'property', emoji: '🏬', color: '#E91E63' },
  { id: 28, name: 'Dragon', type: 'property', emoji: '🐉', color: '#F44336' },
  { id: 29, name: 'THRONE', type: 'property', emoji: '👑', color: '#9C27B0' },
];

function GameSpace({ space, index, players, isActive, isHot }) {
  const playersHere = players?.filter(p => p.position === index) || [];
  
  return (
    <motion.div
      className={`relative w-10 h-12 md:w-12 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer ${
        isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-110 z-20' : 
        isHot ? 'border-orange-400 shadow-md shadow-orange-400/30' :
        'border-white/10 hover:border-white/30'
      }`}
      style={{ 
        backgroundColor: space.color ? `${space.color}40` : 'rgba(255,255,255,0.05)',
        borderTopColor: space.color || undefined,
        borderTopWidth: space.color ? '4px' : '2px'
      }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      animate={isActive ? { scale: [1.1, 1.15, 1.1] } : {}}
      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
    >
      <span className="text-lg">{space.emoji}</span>
      <span className="text-[8px] text-gray-300 truncate w-full text-center">
        {space.name}
      </span>
      
      {/* Players on space */}
      {playersHere.length > 0 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex -space-x-2">
          {playersHere.map(p => (
            <motion.div
              key={p.id}
              className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold"
              style={{ backgroundColor: p.color || '#3B82F6' }}
              layoutId={`player-${p.id}`}
              initial={false}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {p.name?.charAt(0)}
            </motion.div>
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
    makeChoice,
    chooseTeleport,
    chooseFreeze,
  } = useLuckyStreetsStore();

  const [showWheel, setShowWheel] = useState(false);
  const [currentSpin, setCurrentSpin] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [lastMessage, setLastMessage] = useState(null);
  const [pendingChoice, setPendingChoice] = useState(null);
  const [showTeleportPicker, setShowTeleportPicker] = useState(false);
  const [showFreezePicker, setShowFreezePicker] = useState(false);

  // Listen for wheel trigger
  useEffect(() => {
    const socket = useLuckyStreetsStore.getState().socket;
    if (!socket) return;

    socket.on('triggerSpin', ({ wheelOutcome }) => {
      setCurrentSpin(wheelOutcome);
      setShowWheel(true);
    });

    socket.on('turnTimerUpdate', ({ timeLeft }) => {
      setTurnTimeLeft(timeLeft);
    });

    socket.on('wheelResult', ({ message }) => {
      setLastMessage(message);
      setTimeout(() => setLastMessage(null), 3000);
    });

    socket.on('choiceResult', ({ message }) => {
      setLastMessage(message);
      setPendingChoice(null);
      setTimeout(() => setLastMessage(null), 3000);
    });

    socket.on('makeChoice', ({ outcome, choices }) => {
      setPendingChoice({ outcome, choices });
    });

    socket.on('chooseTeleportSpace', () => {
      setShowTeleportPicker(true);
    });

    socket.on('chooseFreezeTarget', ({ players }) => {
      setShowFreezePicker(players);
    });

    socket.on('landingResult', ({ message }) => {
      if (message) {
        setLastMessage(message);
        setTimeout(() => setLastMessage(null), 3000);
      }
    });

    socket.on('turnTimeout', ({ message }) => {
      setLastMessage(message);
      setTimeout(() => setLastMessage(null), 3000);
    });

    return () => {
      socket.off('triggerSpin');
      socket.off('turnTimerUpdate');
      socket.off('wheelResult');
      socket.off('choiceResult');
      socket.off('makeChoice');
      socket.off('chooseTeleportSpace');
      socket.off('chooseFreezeTarget');
      socket.off('landingResult');
      socket.off('turnTimeout');
    };
  }, []);

  if (!gameState) return null;

  const myPlayer = gameState.players?.find(p => p.id === playerId);
  const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  const handleRoll = () => {
    setShowWheel(false);
    rollDice();
  };

  const handleSpinComplete = () => {
    setTimeout(() => {
      setShowWheel(false);
    }, 2000);
  };

  const handleChoice = (index) => {
    makeChoice(index);
    setPendingChoice(null);
  };

  const handleTeleport = (spaceId) => {
    chooseTeleport(spaceId);
    setShowTeleportPicker(false);
  };

  const handleFreeze = (targetId) => {
    chooseFreeze(targetId);
    setShowFreezePicker(false);
  };

  // Board layout - track style (8 top, 7 right, 8 bottom, 7 left)
  const topRow = BOARD_SPACES.slice(0, 8);
  const rightCol = BOARD_SPACES.slice(8, 15);
  const bottomRow = [...BOARD_SPACES.slice(15, 23)].reverse();
  const leftCol = [...BOARD_SPACES.slice(23, 30)].reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 md:p-4">
      {/* TOP BAR - Turn Timer & Pot */}
      <div className="flex justify-between items-center mb-4">
        {/* TURN TIMER - 10 SECONDS! */}
        <motion.div 
          className={`glass px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 ${
            turnTimeLeft <= 3 ? 'bg-red-500/30' : ''
          }`}
          animate={turnTimeLeft <= 3 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3, repeat: turnTimeLeft <= 3 ? Infinity : 0 }}
        >
          <span className="text-xl">⏱️</span>
          <span className={`text-2xl md:text-3xl font-mono font-bold ${
            turnTimeLeft <= 3 ? 'text-red-400 animate-pulse' : 
            turnTimeLeft <= 5 ? 'text-yellow-400' : 'text-white'
          }`}>
            {turnTimeLeft}s
          </span>
          {isMyTurn && turnTimeLeft <= 3 && (
            <span className="text-red-400 text-sm animate-bounce">HURRY!</span>
          )}
        </motion.div>

        {/* Current Turn Indicator */}
        <motion.div 
          className="glass px-4 py-2 rounded-full flex items-center gap-2"
          style={{ borderColor: currentPlayer?.color, borderWidth: 2 }}
        >
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: currentPlayer?.color || '#3B82F6' }}
          />
          <span className="font-bold">
            {isMyTurn ? '🎯 YOUR TURN!' : `${currentPlayer?.name}'s turn`}
          </span>
        </motion.div>

        {/* POT */}
        <motion.div 
          className="glass px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2"
          animate={{ 
            boxShadow: ['0 0 20px rgba(34,197,94,0.3)', '0 0 40px rgba(34,197,94,0.6)', '0 0 20px rgba(34,197,94,0.3)'] 
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xl">💰</span>
          <span className="text-2xl md:text-3xl font-bold text-green-400">
            ${gameState.pot || 0}
          </span>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT SIDE - Players */}
        <div className="lg:w-56 space-y-2">
          <h2 className="text-sm font-bold text-gray-400 px-2">PLAYERS</h2>
          {gameState.players?.map((player) => {
            const isCurrentTurn = currentPlayer?.id === player.id;
            const isMe = player.id === playerId;
            
            return (
              <motion.div
                key={player.id}
                className={`glass p-3 rounded-xl transition-all ${
                  isCurrentTurn ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : ''
                }`}
                animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white/30"
                    style={{ backgroundColor: player.color || '#3B82F6' }}
                  >
                    {player.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm flex items-center gap-1 truncate">
                      {player.name}
                      {isMe && <span className="text-[10px] bg-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded">YOU</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.properties?.length || 0} properties
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-center text-xs">
                  <div className="bg-black/30 rounded px-2 py-1">
                    <div className="text-gray-500">Cash</div>
                    <div className={`font-bold ${player.cash < 2 ? 'text-red-400' : 'text-green-400'}`}>
                      ${player.cash || 0}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded px-2 py-1">
                    <div className="text-gray-500">Space</div>
                    <div className="font-bold">{player.position || 0}</div>
                  </div>
                </div>

                {player.hasInsurance && (
                  <div className="mt-1 text-xs text-blue-400 flex items-center gap-1">
                    🛡️ Insured
                  </div>
                )}
                {player.isFrozen && (
                  <div className="mt-1 text-xs text-cyan-400 flex items-center gap-1">
                    ❄️ Frozen
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CENTER - Game Board */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Board - Track Layout */}
          <div className="relative bg-black/40 p-3 rounded-2xl backdrop-blur border border-white/10">
            <div className="flex flex-col gap-1">
              {/* Top row */}
              <div className="flex gap-1 justify-center">
                {topRow.map((space) => (
                  <GameSpace 
                    key={space.id} 
                    space={space} 
                    index={space.id} 
                    players={gameState.players}
                    isActive={myPlayer?.position === space.id}
                    isHot={space.type === 'spin'}
                  />
                ))}
              </div>
              
              {/* Middle section */}
              <div className="flex justify-between">
                {/* Left column */}
                <div className="flex flex-col gap-1">
                  {leftCol.map((space) => (
                    <GameSpace 
                      key={space.id} 
                      space={space} 
                      index={space.id} 
                      players={gameState.players}
                      isActive={myPlayer?.position === space.id}
                      isHot={space.type === 'spin'}
                    />
                  ))}
                </div>
                
                {/* Center - Wheel or Roll Button */}
                <div className="flex-1 flex items-center justify-center p-4 min-h-[300px] md:min-h-[350px]">
                  <AnimatePresence mode="wait">
                    {showWheel ? (
                      <motion.div
                        key="wheel"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <SpinWheel 
                          spinning={true}
                          result={currentSpin}
                          onSpinComplete={handleSpinComplete}
                        />
                      </motion.div>
                    ) : pendingChoice ? (
                      <motion.div
                        key="choice"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center glass p-6 rounded-2xl"
                      >
                        <div className="text-3xl mb-2">{pendingChoice.outcome?.label}</div>
                        <div className="text-lg text-gray-300 mb-4">{pendingChoice.outcome?.description}</div>
                        <div className="flex gap-4">
                          <motion.button
                            onClick={() => handleChoice(0)}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🎲 {pendingChoice.choices[0]}
                          </motion.button>
                          <motion.button
                            onClick={() => handleChoice(1)}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl font-bold text-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🛡️ {pendingChoice.choices[1]}
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                      >
                        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                          LUCKY STREETS
                        </h1>
                        <p className="text-gray-400 text-sm mb-4">30 Spaces • 30 Wheel Outcomes</p>
                        
                        {isMyTurn && (
                          <motion.button
                            onClick={handleRoll}
                            className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
                              turnTimeLeft <= 3 
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse shadow-red-500/50' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/50'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            🎲 ROLL NOW! 🎲
                          </motion.button>
                        )}
                        
                        {!isMyTurn && currentPlayer && (
                          <div className="text-gray-400">
                            Waiting for <span className="font-bold" style={{ color: currentPlayer.color }}>{currentPlayer.name}</span>...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Right column */}
                <div className="flex flex-col gap-1">
                  {rightCol.map((space) => (
                    <GameSpace 
                      key={space.id} 
                      space={space} 
                      index={space.id} 
                      players={gameState.players}
                      isActive={myPlayer?.position === space.id}
                      isHot={space.type === 'spin'}
                    />
                  ))}
                </div>
              </div>
              
              {/* Bottom row */}
              <div className="flex gap-1 justify-center">
                {bottomRow.map((space) => (
                  <GameSpace 
                    key={space.id} 
                    space={space} 
                    index={space.id} 
                    players={gameState.players}
                    isActive={myPlayer?.position === space.id}
                    isHot={space.type === 'spin'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Round Info */}
          <div className="text-center text-gray-400 text-sm">
            Round {gameState.roundNumber || 1} / {gameState.maxRounds || 20}
          </div>
        </div>

        {/* RIGHT SIDE - My Stats */}
        <div className="lg:w-56 space-y-3">
          {myPlayer && (
            <div className="glass p-4 rounded-xl">
              <h3 className="font-bold mb-3 text-gray-400 text-sm">YOUR STATS</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">💵 Cash</span>
                  <span className={`font-bold text-lg ${myPlayer.cash < 2 ? 'text-red-400' : 'text-green-400'}`}>
                    ${myPlayer.cash || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">🏠 Properties</span>
                  <span className="font-bold">{myPlayer.properties?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">📍 Position</span>
                  <span className="font-bold">{myPlayer.position || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wheel Legend */}
          <div className="glass p-4 rounded-xl">
            <h3 className="font-bold mb-2 text-gray-400 text-sm">WHEEL OUTCOMES</h3>
            <div className="grid grid-cols-3 gap-1 text-lg">
              <div title="Jackpot">🎰</div>
              <div title="Triple">3️⃣</div>
              <div title="Double">2️⃣</div>
              <div title="Gamble">🎲</div>
              <div title="Duel">⚔️</div>
              <div title="Steal">🦝</div>
              <div title="Freeze">❄️</div>
              <div title="Teleport">✨</div>
              <div title="Mystery">❓</div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Land on 🎡 to spin!</p>
          </div>
        </div>
      </div>

      {/* MESSAGE POPUP */}
      <AnimatePresence>
        {lastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass px-8 py-4 rounded-2xl text-xl font-bold text-center shadow-2xl border border-white/20">
              {lastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TELEPORT PICKER */}
      <AnimatePresence>
        {showTeleportPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass p-6 rounded-2xl max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">✨ Choose where to teleport!</h2>
              <div className="grid grid-cols-6 gap-2 max-h-80 overflow-y-auto">
                {BOARD_SPACES.map(space => (
                  <motion.button
                    key={space.id}
                    onClick={() => handleTeleport(space.id)}
                    className="p-3 rounded-lg bg-black/30 hover:bg-white/20 transition-all flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-2xl">{space.emoji}</span>
                    <span className="text-xs">{space.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FREEZE PICKER */}
      <AnimatePresence>
        {showFreezePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass p-6 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">❄️ Choose who to freeze!</h2>
              <div className="flex gap-4 justify-center">
                {showFreezePicker.map(player => (
                  <motion.button
                    key={player.id}
                    onClick={() => handleFreeze(player.id)}
                    className="p-4 rounded-xl bg-black/30 hover:bg-cyan-500/30 transition-all flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2"
                      style={{ backgroundColor: player.color || '#3B82F6' }}
                    >
                      {player.name?.charAt(0)}
                    </div>
                    <span>{player.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
