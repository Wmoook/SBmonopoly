import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const PROPERTY_COLORS = {
  brown: '#92400e',
  lightblue: '#0ea5e9',
  pink: '#ec4899',
  orange: '#f97316',
  red: '#dc2626',
  yellow: '#eab308',
  green: '#16a34a',
  darkblue: '#1e40af',
  railroad: '#374151',
  utility: '#6b7280',
};

const COLOR_NAMES = {
  brown: 'Brown',
  lightblue: 'Light Blue',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  darkblue: 'Dark Blue',
  railroad: 'Railroads',
  utility: 'Utilities',
};

export default function MyProperties() {
  const { gameState, playerId, buildHouse } = useGameStore();
  const [expanded, setExpanded] = useState(true);

  if (!gameState) return null;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  if (!myPlayer) return null;

  // Group properties by color
  const groupedProperties = {};
  myPlayer.properties.forEach(propIndex => {
    const prop = gameState.board[propIndex];
    const color = prop.color || 'other';
    if (!groupedProperties[color]) {
      groupedProperties[color] = [];
    }
    groupedProperties[color].push({ ...prop, index: propIndex });
  });

  // Check for monopolies
  const hasMonopoly = (color) => {
    const colorGroups = {
      brown: 2, lightblue: 3, pink: 3, orange: 3,
      red: 3, yellow: 3, green: 3, darkblue: 2,
      railroad: 4, utility: 2
    };
    return groupedProperties[color]?.length === colorGroups[color];
  };

  const colorOrder = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue', 'railroad', 'utility'];

  if (myPlayer.properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
      >
        <h3 className="font-bold text-gray-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5" />
          </svg>
          My Properties
        </h3>
        <p className="text-sm text-gray-500 mt-2">No properties owned yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h3 className="font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5" />
          </svg>
          My Properties
          <span className="text-sm text-gray-400">({myPlayer.properties.length})</span>
        </h3>
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Properties list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3 max-h-64 overflow-y-auto">
              {colorOrder.map(color => {
                const props = groupedProperties[color];
                if (!props) return null;
                
                const isMonopoly = hasMonopoly(color);
                
                return (
                  <div key={color}>
                    {/* Color group header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: PROPERTY_COLORS[color] }}
                      />
                      <span className="text-sm font-medium text-gray-300">
                        {COLOR_NAMES[color]}
                      </span>
                      {isMonopoly && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">
                          MONOPOLY
                        </span>
                      )}
                    </div>
                    
                    {/* Properties in group */}
                    <div className="space-y-1.5 ml-6">
                      {props.map(prop => (
                        <div 
                          key={prop.index}
                          className="flex items-center justify-between bg-gray-900/50 rounded-lg p-2 text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{prop.name}</div>
                            <div className="text-xs text-gray-400">
                              Rent: ${prop.rent?.[prop.houses || 0]?.toFixed(2) || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Houses/Hotel indicator */}
                          {!prop.isRailroad && !prop.isUtility && (
                            <div className="flex items-center gap-1 ml-2">
                              {(prop.houses || 0) === 5 ? (
                                <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                  H
                                </div>
                              ) : (
                                <>
                                  {Array.from({ length: prop.houses || 0 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-green-500 rounded-sm" />
                                  ))}
                                  {Array.from({ length: 4 - (prop.houses || 0) }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-gray-600 rounded-sm" />
                                  ))}
                                </>
                              )}
                              
                              {/* Build button */}
                              {isMonopoly && (prop.houses || 0) < 5 && (
                                <button
                                  onClick={() => buildHouse(prop.index)}
                                  className="ml-2 w-6 h-6 bg-green-500/20 hover:bg-green-500/40 
                                    text-green-400 rounded flex items-center justify-center text-lg transition-colors"
                                  title={`Build house ($${prop.housePrice?.toFixed(2)})`}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Railroad/Utility indicator */}
                          {prop.isRailroad && (
                            <div className="text-xs text-gray-400">
                              {groupedProperties.railroad?.length}/4
                            </div>
                          )}
                          {prop.isUtility && (
                            <div className="text-xs text-gray-400">
                              {groupedProperties.utility?.length}/2
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
