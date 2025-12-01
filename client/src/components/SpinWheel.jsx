import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 30 WHEEL SEGMENTS - WITH MINI-GAMES!
const WHEEL_SEGMENTS = [
  // 🎮 MINI-GAMES (7) - GREEN/FUN COLORS
  { id: 'PONG', label: '🏓', color: '#22c55e' },
  { id: 'DODGE', label: '🔥', color: '#ef4444' },
  { id: 'REACTION', label: '⚡', color: '#f59e0b' },
  { id: 'MEMORY', label: '🧠', color: '#8b5cf6' },
  { id: 'CLICKER', label: '👆', color: '#ec4899' },
  { id: 'SNAKE', label: '🐍', color: '#10b981' },
  { id: 'HIGHLOW', label: '📊', color: '#6366f1' },
  
  // 💰 INSTANT MONEY (6)
  { id: 'JACKPOT', label: '🎰', color: '#FFD700' },
  { id: 'TRIPLE', label: '3X', color: '#00FF00' },
  { id: 'DOUBLE', label: '2X', color: '#32CD32' },
  { id: 'PAYDAY', label: '💵', color: '#00CED1' },
  { id: 'BONUS', label: '🎁', color: '#9370DB' },
  { id: 'CASHBACK', label: '💸', color: '#20B2AA' },
  
  // 💸 MONEY LOSERS (5)
  { id: 'TAX', label: '🏛️', color: '#8B0000' },
  { id: 'BROKE', label: '😭', color: '#B22222' },
  { id: 'FINE', label: '👮', color: '#DC143C' },
  { id: 'ROBBED', label: '🦹', color: '#800000' },
  { id: 'OOPS', label: '🙈', color: '#CD5C5C' },
  
  // 🎲 RISK/REWARD (6)
  { id: 'GAMBLE', label: '🎲', color: '#FF1493' },
  { id: 'STEAL', label: '🦝', color: '#8A2BE2' },
  { id: 'ALLIN', label: '🃏', color: '#9400D3' },
  { id: 'SABOTAGE', label: '💣', color: '#FF6600' },
  { id: 'INSURANCE', label: '🛡️', color: '#1E90FF' },
  { id: 'SWITCH', label: '🔄', color: '#00BFFF' },
  
  // 🌪️ CHAOS (6)
  { id: 'SHUFFLE', label: '🔀', color: '#FF69B4' },
  { id: 'REVERSE', label: '↩️', color: '#00FA9A' },
  { id: 'TELEPORT', label: '✨', color: '#BA55D3' },
  { id: 'LOTTERY', label: '🎟️', color: '#FFD700' },
  { id: 'FREEZE', label: '❄️', color: '#ADD8E6' },
  { id: 'MYSTERY', label: '❓', color: '#9932CC' }
];

// Get full outcome data by ID
const OUTCOME_DETAILS = {
  // MINI-GAMES
  'PONG': { label: '🏓 PONG DUEL!', description: 'Beat opponent in pong for $5!' },
  'DODGE': { label: '🔥 DODGE!', description: 'Survive 10 seconds for $5!' },
  'REACTION': { label: '⚡ REACTION!', description: 'Fastest click wins $4!' },
  'MEMORY': { label: '🧠 MEMORY!', description: 'Match pairs for $4!' },
  'CLICKER': { label: '👆 CLICKER!', description: 'Out-click opponent for $3!' },
  'SNAKE': { label: '🐍 SNAKE!', description: 'Eat 5 apples for $5!' },
  'HIGHLOW': { label: '📊 HIGHER/LOWER!', description: 'Guess 5 right for $4!' },
  // MONEY
  'JACKPOT': { label: '🎰 JACKPOT', description: 'WIN 50% OF THE POT!' },
  'TRIPLE': { label: '3️⃣ TRIPLE', description: 'Next rent is 3X!' },
  'DOUBLE': { label: '2️⃣ DOUBLE', description: 'Next rent is 2X!' },
  'PAYDAY': { label: '💵 PAYDAY', description: 'Get $5 from pot!' },
  'BONUS': { label: '🎁 BONUS', description: 'Free $3!' },
  'LUCKY7': { label: '7️⃣ LUCKY 7', description: 'Go to 7, get $7!' },
  'CASHBACK': { label: '💸 CASHBACK', description: 'Get back last rent!' },
  'INVESTOR': { label: '📈 INVESTOR', description: 'Properties pay 2X!' },
  'TAX': { label: '🏛️ TAX', description: 'Pay $3 to pot!' },
  'BROKE': { label: '😭 BROKE', description: 'Lose half your cash!' },
  'FINE': { label: '👮 FINE', description: 'Pay $2 fine!' },
  'ROBBED': { label: '🦹 ROBBED', description: 'Lose $4!' },
  'CRASH': { label: '📉 CRASH', description: 'Properties worthless!' },
  'OOPS': { label: '🙈 OOPS', description: 'Pay $1 to everyone!' },
  'GAMBLE': { label: '🎲 GAMBLE', description: 'Double or nothing!' },
  'DUEL': { label: '⚔️ DUEL', description: 'Challenge to dice duel!' },
  'STEAL': { label: '🦝 STEAL', description: '50/50 steal or pay $5!' },
  'SABOTAGE': { label: '💣 SABOTAGE', description: 'Pay $2 to remove property!' },
  'INSURANCE': { label: '🛡️ INSURANCE', description: 'Pay $3 for protection!' },
  'AUCTION': { label: '🔨 AUCTION', description: 'Sell a property!' },
  'ALLIN': { label: '🃏 ALL IN', description: '33% to triple cash!' },
  'SWITCH': { label: '🔄 SWITCH', description: 'Swap positions!' },
  'SHUFFLE': { label: '🔀 SHUFFLE', description: 'Everyone moves random!' },
  'REVERSE': { label: '↩️ REVERSE', description: 'Turn order reversed!' },
  'FREERENT': { label: '🏠 FREE RENT', description: 'No rent this turn!' },
  'TELEPORT': { label: '✨ TELEPORT', description: 'Go anywhere!' },
  'EARTHQUAKE': { label: '🌋 EARTHQUAKE', description: 'All lose a property!' },
  'LOTTERY': { label: '🎟️ LOTTERY', description: 'Random player wins $10!' },
  'FREEZE': { label: '❄️ FREEZE', description: 'Skip someone\'s turn!' },
  'MYSTERY': { label: '❓ MYSTERY', description: 'Random effect!' }
};

export default function SpinWheel({ spinning, result, onSpinComplete }) {
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (spinning && result) {
      // Find target segment
      const targetIndex = WHEEL_SEGMENTS.findIndex(s => s.id === result.id);
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      
      // Spin 6 full rotations + land on target (more dramatic!)
      const spins = 6;
      const targetRotation = (spins * 360) + (360 - (targetIndex * segmentAngle) - (segmentAngle / 2));
      
      setRotation(prev => prev + targetRotation);
      setShowResult(false);
      
      // Show result after spin animation
      setTimeout(() => {
        setResultData(result);
        setShowResult(true);
        onSpinComplete?.();
      }, 3500);
    }
  }, [spinning, result]);

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const details = resultData ? OUTCOME_DETAILS[resultData.id] : null;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Epic Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          animate={spinning ? {
            boxShadow: [
              '0 0 30px rgba(255,215,0,0.5)',
              '0 0 80px rgba(255,105,180,0.8)',
              '0 0 30px rgba(147,112,219,0.5)',
            ]
          } : {
            boxShadow: '0 0 40px rgba(255,215,0,0.3)'
          }}
          transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
        />
        
        {/* The Wheel */}
        <motion.div
          className="absolute inset-2 rounded-full overflow-hidden shadow-2xl border-4 border-white/30"
          style={{ transformOrigin: 'center center' }}
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: [0.2, 0.8, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {WHEEL_SEGMENTS.map((segment, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              
              // Calculate path
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArc = segmentAngle > 180 ? 1 : 0;
              const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              // Text position
              const midAngle = (startAngle + endAngle) / 2;
              const midRad = (midAngle - 90) * (Math.PI / 180);
              const textX = 50 + 35 * Math.cos(midRad);
              const textY = 50 + 35 * Math.sin(midRad);
              
              return (
                <g key={i}>
                  <path 
                    d={pathD} 
                    fill={segment.color} 
                    stroke="#fff" 
                    strokeWidth="0.3"
                    opacity={0.9}
                  />
                  <text
                    x={textX}
                    y={textY}
                    fontSize="5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="12" fill="#1a1a2e" stroke="#FFD700" strokeWidth="2" />
            <text x="50" y="51" fill="#fff" fontSize="8" textAnchor="middle" dominantBaseline="middle">
              🎰
            </text>
          </svg>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
        </div>
        
        {/* Tick marks around edge for drama */}
        {spinning && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ 
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && resultData && details && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="px-10 py-6 rounded-3xl text-center backdrop-blur-xl shadow-2xl border-2 border-white/30"
              style={{ 
                backgroundColor: `${WHEEL_SEGMENTS.find(s => s.id === resultData.id)?.color}ee`
              }}
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, -3, 3, 0]
              }}
              transition={{ duration: 0.4, repeat: 2 }}
            >
              <div className="text-5xl mb-2">{WHEEL_SEGMENTS.find(s => s.id === resultData.id)?.label}</div>
              <div className="text-2xl font-black text-white drop-shadow-lg">{details.label}</div>
              <div className="text-sm text-white/80 mt-1">{details.description}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
