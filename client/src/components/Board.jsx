import { motion } from 'framer-motion';
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

const SPACE_TYPES = {
  go: { icon: '→', bg: 'bg-green-600' },
  property: { icon: '🏠' },
  chance: { icon: '❓', bg: 'bg-orange-500' },
  chest: { icon: '💰', bg: 'bg-blue-500' },
  tax: { icon: '💸', bg: 'bg-gray-600' },
  jail: { icon: '🔒', bg: 'bg-gray-700' },
  'free-parking': { icon: '🅿️', bg: 'bg-white/20' },
  'goto-jail': { icon: '👮', bg: 'bg-red-600' },
};

export default function Board() {
  const { gameState, playerId, buildHouse } = useGameStore();

  if (!gameState) return null;

  const getPlayersOnSpace = (position) => {
    return gameState.players.filter(p => p.position === position && !p.bankrupt);
  };

  const renderSpace = (index, position) => {
    const space = gameState.board[index];
    const playersHere = getPlayersOnSpace(index);
    const isProperty = space.type === 'property';
    const isOwned = space.owner;
    const owner = gameState.players.find(p => p.id === space.owner);
    const spaceType = SPACE_TYPES[space.type] || {};
    const myPlayer = gameState.players.find(p => p.id === playerId);
    const canBuild = isOwned && space.owner === playerId && !space.isRailroad && !space.isUtility;

    // Calculate position on the board
    let style = {};
    const boardSize = 11; // 11x11 grid
    
    if (index <= 10) {
      // Bottom row (right to left)
      style = { gridColumn: 11 - index, gridRow: 11 };
    } else if (index <= 20) {
      // Left column (bottom to top)
      style = { gridColumn: 1, gridRow: 11 - (index - 10) };
    } else if (index <= 30) {
      // Top row (left to right)
      style = { gridColumn: index - 20 + 1, gridRow: 1 };
    } else {
      // Right column (top to bottom)
      style = { gridColumn: 11, gridRow: index - 30 + 1 };
    }

    return (
      <motion.div
        key={index}
        style={style}
        className={`relative flex flex-col items-center justify-center p-1 border border-white/20 
          ${spaceType.bg || 'bg-white/5'} text-[8px] md:text-[10px] overflow-hidden cursor-pointer
          hover:z-20 hover:scale-110 transition-transform group`}
        title={space.name}
        onClick={() => {
          if (canBuild && (space.houses || 0) < 5) {
            buildHouse(index);
          }
        }}
      >
        {/* Property color bar */}
        {isProperty && space.color && !space.isRailroad && !space.isUtility && (
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: PROPERTY_COLORS[space.color] }}
          />
        )}

        {/* Space content */}
        <div className="flex flex-col items-center justify-center flex-1 mt-1">
          {isProperty ? (
            <>
              <div className="font-bold truncate max-w-full text-center leading-tight">
                {space.name.split(' ').map((word, i) => (
                  <div key={i} className="truncate">{word}</div>
                )).slice(0, 2)}
              </div>
              <div className="text-green-300 font-bold">${space.price}</div>
              
              {/* Houses/Hotel */}
              {space.houses > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {space.houses === 5 ? (
                    <span className="text-red-500">🏨</span>
                  ) : (
                    Array.from({ length: space.houses }).map((_, i) => (
                      <span key={i} className="text-green-400">🏠</span>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-xl">{spaceType.icon}</div>
          )}
        </div>

        {/* Owner indicator */}
        {isOwned && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: owner?.color }}
          />
        )}

        {/* Player tokens */}
        {playersHere.length > 0 && (
          <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[70%]">
            {playersHere.map((player) => (
              <motion.div
                key={player.id}
                layoutId={`player-${player.id}`}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white shadow-lg"
                style={{ backgroundColor: player.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            ))}
          </div>
        )}

        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-40">
          <div className="glass p-2 rounded-lg text-white text-xs whitespace-normal">
            <div className="font-bold">{space.name}</div>
            {isProperty && (
              <>
                <div>Price: ${space.price}</div>
                <div>Rent: ${space.rent?.[space.houses || 0] || 'N/A'}</div>
                {owner && <div>Owner: {owner.name}</div>}
                {space.houses > 0 && <div>Buildings: {space.houses}</div>}
              </>
            )}
            {space.type === 'tax' && <div>Pay: ${space.amount}</div>}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="glass p-2 md:p-4 rounded-2xl">
      <div 
        className="grid gap-0.5"
        style={{ 
          gridTemplateColumns: 'repeat(11, minmax(40px, 60px))',
          gridTemplateRows: 'repeat(11, minmax(40px, 60px))',
        }}
      >
        {/* Render all 40 spaces */}
        {Array.from({ length: 40 }).map((_, i) => renderSpace(i))}
        
        {/* Center area */}
        <div 
          className="col-start-2 col-end-11 row-start-2 row-end-11 
            flex flex-col items-center justify-center bg-gradient-to-br from-green-900/50 to-green-700/30 rounded-xl"
        >
          <div className="font-game text-2xl md:text-4xl text-yellow-400 mb-2">
            SKILL MONOPOLY
          </div>
          <div className="text-gray-400 text-sm">🎲 Roll the dice!</div>
          
          {/* Current player indicator */}
          {gameState.players[gameState.currentPlayerIndex] && (
            <div className="mt-4 glass p-3 rounded-lg flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: gameState.players[gameState.currentPlayerIndex].color }}
              />
              <span className="font-bold">
                {gameState.players[gameState.currentPlayerIndex].name}'s Turn
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
