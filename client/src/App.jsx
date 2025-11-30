import { useEffect } from 'react';
import { useLuckyStreetsStore } from './store/luckyStreetsStore';
import LuckyStreetsMenu from './components/LuckyStreetsMenu';
import LuckyStreetsLobby from './components/LuckyStreetsLobby';
import LuckyStreetsGame from './components/LuckyStreetsGame';
import LuckyStreetsGameOver from './components/LuckyStreetsGameOver';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { connect, connected, phase, error } = useLuckyStreetsStore();

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Connection status */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-4 right-4 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm z-50 ${
          connected 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {connected ? '🟢 Connected' : '🔴 Connecting...'}
      </motion.div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl z-50 border border-red-400/50"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={phase}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {phase === 'menu' && <LuckyStreetsMenu />}
          {phase === 'lobby' && <LuckyStreetsLobby />}
          {phase === 'playing' && <LuckyStreetsGame />}
          {phase === 'ended' && <LuckyStreetsGameOver />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
