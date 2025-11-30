import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WHEEL_SEGMENTS = [
  { id: '2x', label: '2X', color: '#22c55e', textColor: '#fff' },
  { id: 'pay', label: 'PAY', color: '#ef4444', textColor: '#fff' },
  { id: '1x', label: '1X', color: '#3b82f6', textColor: '#fff' },
  { id: 'steal', label: 'STEAL', color: '#1f2937', textColor: '#fff' },
  { id: 'free', label: 'FREE', color: '#eab308', textColor: '#000' },
  { id: 'swap', label: 'SWAP', color: '#f97316', textColor: '#fff' },
  { id: '1x', label: '1X', color: '#3b82f6', textColor: '#fff' },
  { id: '2x', label: '2X', color: '#22c55e', textColor: '#fff' },
];

export default function SpinWheel({ spinning, result, onSpinComplete }) {
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (spinning && result) {
      // Find target segment
      const targetIndex = WHEEL_SEGMENTS.findIndex(s => s.id === result.id);
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      
      // Spin 5 full rotations + land on target
      const spins = 5;
      const targetRotation = (spins * 360) + (360 - (targetIndex * segmentAngle) - (segmentAngle / 2));
      
      setRotation(prev => prev + targetRotation);
      setShowResult(false);
      
      // Show result after spin
      setTimeout(() => {
        setShowResult(true);
        onSpinComplete?.();
      }, 3000);
    }
  }, [spinning, result]);

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-xl opacity-50 animate-pulse" />
        
        {/* Wheel */}
        <motion.div
          className="absolute inset-2 rounded-full overflow-hidden shadow-2xl border-4 border-white/20"
          style={{ transformOrigin: 'center center' }}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.2, 0.8, 0.2, 1] }}
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
              const textX = 50 + 32 * Math.cos(midRad);
              const textY = 50 + 32 * Math.sin(midRad);
              
              return (
                <g key={i}>
                  <path d={pathD} fill={segment.color} stroke="#fff" strokeWidth="0.5" />
                  <text
                    x={textX}
                    y={textY}
                    fill={segment.textColor}
                    fontSize="7"
                    fontWeight="bold"
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
            <circle cx="50" cy="50" r="8" fill="#1a1a2e" stroke="#fff" strokeWidth="1" />
            <text x="50" y="51" fill="#fff" fontSize="4" textAnchor="middle" dominantBaseline="middle">
              🎰
            </text>
          </svg>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
        </div>
        
        {/* Center Glow when spinning */}
        {spinning && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.3)',
                '0 0 60px rgba(255,255,255,0.6)',
                '0 0 20px rgba(255,255,255,0.3)',
              ]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="px-8 py-4 rounded-2xl text-3xl font-black shadow-2xl"
              style={{ backgroundColor: result.color }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: 2 }}
            >
              {result.label}!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Labels */}
      <div className="mt-4 flex gap-2 flex-wrap justify-center max-w-xs">
        {[
          { label: '2X', color: '#22c55e', desc: 'Double!' },
          { label: '1X', color: '#3b82f6', desc: 'Normal' },
          { label: 'FREE', color: '#eab308', desc: 'No cost!' },
          { label: 'SWAP', color: '#f97316', desc: 'Trade!' },
          { label: 'PAY', color: '#ef4444', desc: '-10%' },
          { label: 'STEAL', color: '#1f2937', desc: '+$2 each' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
