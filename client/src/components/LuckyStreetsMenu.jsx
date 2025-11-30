import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLuckyStreetsStore } from '../store/luckyStreetsStore';

export default function LuckyStreetsMenu() {
  const { 
    accountBalance, 
    deposit, 
    createRoom, 
    joinRoom, 
    joinMatchmaking, 
    leaveMatchmaking,
    matchmakingStatus,
    matchmakingPlayers,
    matchmakingTier
  } = useLuckyStreetsStore();

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [buyIn, setBuyIn] = useState(5);
  const [mode, setMode] = useState(null); // 'create', 'join', 'quick'

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      deposit(amount);
      setDepositAmount('');
      setShowDeposit(false);
    }
  };

  const buyInOptions = [1, 5, 10, 25, 50, 100];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            LUCKY
          </h1>
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
            STREETS
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Roll • Spin • Win!</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Your Balance</p>
              <p className="text-4xl font-bold text-green-400">${accountBalance.toFixed(2)}</p>
            </div>
            <motion.button
              onClick={() => setShowDeposit(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Add Funds
            </motion.button>
          </div>
        </motion.div>

        {/* Matchmaking Status */}
        <AnimatePresence>
          {matchmakingStatus === 'searching' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-2xl p-6 mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  className="w-4 h-4 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-lg">Finding players...</span>
              </div>
              <p className="text-gray-400 mb-4">
                {matchmakingPlayers} player{matchmakingPlayers !== 1 ? 's' : ''} in queue • ${matchmakingTier} buy-in
              </p>
              <button
                onClick={leaveMatchmaking}
                className="text-red-400 hover:text-red-300 transition"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Mode Selection */}
        {!matchmakingStatus && !mode && (
          <motion.div 
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setMode('quick')}
              className="w-full py-5 glass rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-transparent hover:border-yellow-400/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">⚡</span>
              Quick Match
            </motion.button>

            <motion.button
              onClick={() => setMode('create')}
              className="w-full py-5 glass rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-transparent hover:border-purple-400/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">🎲</span>
              Create Room
            </motion.button>

            <motion.button
              onClick={() => setMode('join')}
              className="w-full py-5 glass rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-transparent hover:border-blue-400/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">🚪</span>
              Join Room
            </motion.button>
          </motion.div>
        )}

        {/* Quick Match Mode */}
        <AnimatePresence>
          {mode === 'quick' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-2xl p-6"
            >
              <button 
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
              >
                ← Back
              </button>
              
              <h2 className="text-2xl font-bold mb-4">Quick Match</h2>
              <p className="text-gray-400 mb-6">Select buy-in amount</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {buyInOptions.map(amount => (
                  <motion.button
                    key={amount}
                    onClick={() => setBuyIn(amount)}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      buyIn === amount 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20'
                    } ${accountBalance < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={accountBalance < amount}
                    whileHover={accountBalance >= amount ? { scale: 1.05 } : {}}
                    whileTap={accountBalance >= amount ? { scale: 0.95 } : {}}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => accountBalance >= buyIn && joinMatchmaking(buyIn)}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${
                  accountBalance >= buyIn 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={accountBalance < buyIn}
                whileHover={accountBalance >= buyIn ? { scale: 1.02 } : {}}
                whileTap={accountBalance >= buyIn ? { scale: 0.98 } : {}}
              >
                Find Match (${buyIn})
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Room Mode */}
        <AnimatePresence>
          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-2xl p-6"
            >
              <button 
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
              >
                ← Back
              </button>
              
              <h2 className="text-2xl font-bold mb-4">Create Room</h2>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none transition"
                  maxLength={12}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Buy-in Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  {buyInOptions.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBuyIn(amount)}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        buyIn === amount 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                          : 'bg-white/10 hover:bg-white/20'
                      } ${accountBalance < amount ? 'opacity-50' : ''}`}
                      disabled={accountBalance < amount}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => playerName && accountBalance >= buyIn && createRoom(playerName, buyIn)}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${
                  playerName && accountBalance >= buyIn 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!playerName || accountBalance < buyIn}
                whileHover={playerName && accountBalance >= buyIn ? { scale: 1.02 } : {}}
                whileTap={playerName && accountBalance >= buyIn ? { scale: 0.98 } : {}}
              >
                Create Room
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Room Mode */}
        <AnimatePresence>
          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-2xl p-6"
            >
              <button 
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
              >
                ← Back
              </button>
              
              <h2 className="text-2xl font-bold mb-4">Join Room</h2>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:outline-none transition"
                  maxLength={12}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:outline-none transition text-center text-2xl font-mono tracking-widest"
                  maxLength={4}
                />
              </div>

              <motion.button
                onClick={() => playerName && roomCode.length === 4 && joinRoom(roomCode, playerName, 0)}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${
                  playerName && roomCode.length === 4 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!playerName || roomCode.length !== 4}
                whileHover={playerName && roomCode.length === 4 ? { scale: 1.02 } : {}}
                whileTap={playerName && roomCode.length === 4 ? { scale: 0.98 } : {}}
              >
                Join Room
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to Play */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-3 text-gray-400">How It Works</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="glass p-3 rounded-xl">
              <div className="text-2xl mb-1">🎲</div>
              <p className="text-gray-400">Roll dice</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="text-2xl mb-1">🎰</div>
              <p className="text-gray-400">Spin wheel</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-gray-400">Win big!</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">5-minute games • Highest net worth wins!</p>
        </motion.div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Add Funds</h2>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:outline-none transition text-xl"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5, 10, 25, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-bold"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeposit(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleDeposit}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Deposit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
