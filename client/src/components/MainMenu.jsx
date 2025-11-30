import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// Buy-in tiers for matchmaking
const BUY_IN_TIERS = [1, 2, 5, 10, 20, 50, 100];

// Anonymous player icons
const ANON_ICONS = ['🎭', '👤', '🕶️', '🎪', '🃏', '👻', '🦊', '🐺', '🦅', '🐲'];

export default function MainMenu() {
  const { 
    createRoom, 
    joinRoom, 
    joinMatchmaking,
    leaveMatchmaking,
    connected, 
    accountBalance, 
    depositToAccount,
    matchmakingStatus,
    matchmakingTier,
    matchmakingPlayers
  } = useGameStore();
  
  const [mode, setMode] = useState(null); // 'deposit' | 'private-create' | 'private-join'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [buyIn, setBuyIn] = useState(10);
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      depositToAccount(amount);
      setDepositAmount('');
      setMode(null);
    }
  };

  const handleJoinMatchmaking = (tier) => {
    if (tier > accountBalance) {
      return;
    }
    joinMatchmaking(tier);
  };

  const handleCreatePrivate = () => {
    if (playerName.trim() && buyIn > 0) {
      if (buyIn > accountBalance) {
        alert('Insufficient balance! Please deposit more funds.');
        return;
      }
      createRoom(playerName.trim(), buyIn, true); // true = private game
    }
  };

  const handleJoinPrivate = () => {
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(roomCode.trim(), playerName.trim());
    }
  };

  const handleCancelMatchmaking = () => {
    leaveMatchmaking();
  };

  // Show matchmaking status overlay
  if (matchmakingStatus === 'searching') {
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
          className="glass p-8 rounded-2xl w-full max-w-md text-center"
        >
          <div className="text-6xl mb-6 animate-pulse">🎲</div>
          <h2 className="text-2xl font-bold mb-4">Finding Match...</h2>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-green-400 mb-2">${matchmakingTier} Buy-In</div>
            <div className="text-gray-400">Anonymous Matchmaking</div>
          </div>

          {/* Animated searching dots */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>

          {/* Players in queue */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Players in queue</div>
            <div className="flex justify-center gap-2">
              {Array.from({ length: matchmakingPlayers || 1 }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                  {ANON_ICONS[i % ANON_ICONS.length]}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 2 - (matchmakingPlayers || 1)) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <span className="text-gray-600">?</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">Need 2-4 players to start</div>
          </div>

          <button
            onClick={handleCancelMatchmaking}
            className="w-full py-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold transition-all"
          >
            ✕ Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* Account Balance - Always visible */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-4 glass p-4 rounded-xl"
      >
        <div className="text-sm text-gray-400">Account Balance</div>
        <div className="text-2xl font-bold text-green-400">${accountBalance.toFixed(2)}</div>
        <button
          onClick={() => setMode('deposit')}
          className="mt-2 w-full py-1 text-sm bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 transition-all"
        >
          + Deposit
        </button>
      </motion.div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="font-game text-7xl text-yellow-400 drop-shadow-lg mb-4">
          🎲 SKILL MONOPOLY
        </h1>
        <p className="text-xl text-gray-300">
          Dice + Strategy + Auctions = Winner Takes All
        </p>
      </motion.div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {mode === 'deposit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setMode(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="glass p-8 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">💰 Deposit Funds</h2>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full bg-white/10 rounded-lg pl-10 pr-4 py-4 text-white text-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Quick deposit buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5, 10, 25, 50, 100, 250, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setMode(null)}
                  className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-bold transition-all disabled:opacity-50"
                >
                  Deposit ${depositAmount || '0'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu */}
      {!mode && (
        <>
          {/* Matchmaking Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl w-full max-w-2xl mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold">Quick Play</h2>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded ml-auto">
                ANONYMOUS
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Join a random match. Players are fully anonymous - no teaming up!
            </p>
            
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {BUY_IN_TIERS.map((tier) => {
                const canAfford = tier <= accountBalance;
                return (
                  <motion.button
                    key={tier}
                    onClick={() => canAfford && handleJoinMatchmaking(tier)}
                    disabled={!connected || !canAfford}
                    whileHover={canAfford ? { scale: 1.05 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    className={`py-4 rounded-xl font-bold text-lg transition-all relative ${
                      canAfford
                        ? 'bg-gradient-to-b from-green-500/30 to-green-600/30 hover:from-green-500/50 hover:to-green-600/50 border border-green-500/30'
                        : 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/30'
                    }`}
                  >
                    <div className={canAfford ? 'text-green-400' : 'text-gray-500'}>${tier}</div>
                    {!canAfford && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <span className="text-xs">🔒</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Private Games Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl w-full max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔐</span>
              <h2 className="text-xl font-bold">Private Games</h2>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-auto">
                WITH FRIENDS
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Create or join a private room with a code. Names are visible.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setMode('private-create')}
                disabled={!connected}
                className="flex-1 py-4 rounded-xl font-bold bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-all disabled:opacity-50"
              >
                🎮 Create Room
              </button>
              <button
                onClick={() => setMode('private-join')}
                disabled={!connected}
                className="flex-1 py-4 rounded-xl font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all disabled:opacity-50"
              >
                🚀 Join Room
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Create Private Game Modal */}
      <AnimatePresence>
        {mode === 'private-create' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="glass p-8 rounded-2xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">🔐 Create Private Game</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Buy-In Amount</label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBuyIn(amount)}
                    className={`py-2 rounded font-bold transition-all ${
                      buyIn === amount 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              {buyIn > accountBalance && (
                <p className="text-red-400 text-sm mt-2">
                  ⚠️ Insufficient balance (${accountBalance.toFixed(2)} available)
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setMode(null)}
                className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleCreatePrivate}
                disabled={!playerName.trim() || buyIn <= 0 || buyIn > accountBalance}
                className="flex-1 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Private Game Modal */}
      <AnimatePresence>
        {mode === 'private-join' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="glass p-8 rounded-2xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">🚀 Join Private Game</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="XXXX"
                maxLength={4}
                className="w-full bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-sm text-gray-400 mt-2 text-center">
                Buy-in will be deducted when you join
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setMode(null)}
                className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleJoinPrivate}
                disabled={!playerName.trim() || roomCode.length !== 4}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game rules preview */}
      {!mode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-400 max-w-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">⚡ Skill-Based Rules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="glass p-4 rounded-lg">
              <div className="text-2xl mb-2">🏛️</div>
              <div>All properties go to <span className="text-yellow-400">auction</span></div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-2xl mb-2">📜</div>
              <div>Draft <span className="text-yellow-400">2 starter</span> properties</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-2xl mb-2">🎭</div>
              <div>Matchmaking is <span className="text-purple-400">anonymous</span></div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <div><span className="text-green-400">Winner</span> takes the pot</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
