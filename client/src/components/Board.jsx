import { useEffect, useRef, useState } from 'react';
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

// SVG Icons instead of emojis
const Icons = {
  go: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chance: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9a3 3 0 115.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chest: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  tax: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  jail: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 3v18M12 3v18M16 3v18" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 17V7h4a3 3 0 010 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gotoJail: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  railroad: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M4 15l8 6 8-6M4 9l8-6 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  utility: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  house: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  ),
  hotel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0v-4m-14 4H3m2 0v-4m6-6h.01M12 11h.01M12 7h.01M12 15h.01M8 7h.01M8 11h.01M8 15h.01M16 7h.01M16 11h.01M16 15h.01"/>
    </svg>
  ),
};

// Player piece component with animation
const PlayerPiece = ({ player, index, total }) => {
  const offset = total > 1 ? (index - (total - 1) / 2) * 12 : 0;
  
  return (
    <motion.div
      layoutId={`player-piece-${player.id}`}
      className="absolute z-20"
      style={{ 
        left: `calc(50% + ${offset}px)`,
        bottom: '4px',
        transform: 'translateX(-50%)'
      }}
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        duration: 0.5
      }}
    >
      <div 
        className="w-6 h-8 rounded-t-full border-2 border-white shadow-lg flex items-end justify-center pb-0.5 text-[8px] font-bold text-white"
        style={{ 
          backgroundColor: player.color,
          boxShadow: `0 4px 12px ${player.color}80`
        }}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
    </motion.div>
  );
};

// Single board space component
const BoardSpace = ({ space, index, players, gameState, playerId, onBuild }) => {
  const isProperty = space.type === 'property';
  const owner = gameState.players.find(p => p.id === space.owner);
  const isOwned = !!space.owner;
  const isMine = space.owner === playerId;
  
  // Calculate grid position
  let gridStyle = {};
  if (index <= 10) {
    gridStyle = { gridColumn: 11 - index, gridRow: 11 };
  } else if (index <= 20) {
    gridStyle = { gridColumn: 1, gridRow: 11 - (index - 10) };
  } else if (index <= 30) {
    gridStyle = { gridColumn: index - 20 + 1, gridRow: 1 };
  } else {
    gridStyle = { gridColumn: 11, gridRow: index - 30 + 1 };
  }

  const getSpaceContent = () => {
    switch (space.type) {
      case 'go':
        return (
          <div className="flex flex-col items-center text-green-400">
            {Icons.go}
            <span className="text-[7px] font-bold mt-0.5">GO</span>
          </div>
        );
      case 'chance':
        return (
          <div className="flex flex-col items-center text-orange-400">
            {Icons.chance}
            <span className="text-[6px] mt-0.5">CHANCE</span>
          </div>
        );
      case 'chest':
        return (
          <div className="flex flex-col items-center text-blue-400">
            {Icons.chest}
            <span className="text-[5px] mt-0.5">COMMUNITY</span>
          </div>
        );
      case 'tax':
        return (
          <div className="flex flex-col items-center text-red-400">
            {Icons.tax}
            <span className="text-[6px] mt-0.5">${space.amount?.toFixed(0)}</span>
          </div>
        );
      case 'jail':
        return (
          <div className="flex flex-col items-center text-gray-400">
            {Icons.jail}
            <span className="text-[6px] mt-0.5">JAIL</span>
          </div>
        );
      case 'free-parking':
        return (
          <div className="flex flex-col items-center text-green-400">
            {Icons.parking}
            <span className="text-[5px] mt-0.5">PARKING</span>
          </div>
        );
      case 'goto-jail':
        return (
          <div className="flex flex-col items-center text-red-400">
            {Icons.gotoJail}
            <span className="text-[5px] mt-0.5">GO TO JAIL</span>
          </div>
        );
      case 'property':
        if (space.isRailroad) {
          return (
            <div className="flex flex-col items-center">
              {Icons.railroad}
              <span className="text-[6px] font-medium mt-0.5 text-center leading-tight truncate w-full px-0.5">
                {space.name.replace(' Railroad', '')}
              </span>
              <span className="text-[7px] text-green-400 font-bold">${space.price?.toFixed(0)}</span>
            </div>
          );
        }
        if (space.isUtility) {
          return (
            <div className="flex flex-col items-center">
              {Icons.utility}
              <span className="text-[6px] font-medium mt-0.5 text-center leading-tight">
                {space.name.includes('Electric') ? 'ELECTRIC' : 'WATER'}
              </span>
              <span className="text-[7px] text-green-400 font-bold">${space.price?.toFixed(0)}</span>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-[6px] font-medium text-center leading-tight line-clamp-2 px-0.5">
              {space.name.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="text-[8px] text-green-400 font-bold">${space.price?.toFixed(0)}</span>
            {/* Houses */}
            {(space.houses || 0) > 0 && (
              <div className="flex gap-0.5 mt-0.5">
                {space.houses === 5 ? (
                  <div className="text-red-500">{Icons.hotel}</div>
                ) : (
                  Array.from({ length: space.houses }).map((_, i) => (
                    <div key={i} className="text-green-500">{Icons.house}</div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      style={gridStyle}
      className={`relative flex flex-col items-center justify-center border border-gray-700 
        ${isMine ? 'bg-white/10 ring-1 ring-yellow-400/50' : 'bg-gray-900/80'}
        text-white overflow-hidden cursor-pointer group transition-all duration-200
        hover:z-30 hover:scale-105 hover:shadow-xl`}
      onClick={() => {
        if (isMine && !space.isRailroad && !space.isUtility && (space.houses || 0) < 5) {
          onBuild(index);
        }
      }}
    >
      {/* Property color strip */}
      {isProperty && space.color && !space.isRailroad && !space.isUtility && (
        <div
          className="absolute top-0 left-0 right-0 h-3"
          style={{ backgroundColor: PROPERTY_COLORS[space.color] }}
        />
      )}

      {/* Content */}
      <div className={`flex-1 flex items-center justify-center w-full ${
        isProperty && space.color && !space.isRailroad && !space.isUtility ? 'mt-3' : ''
      }`}>
        {getSpaceContent()}
      </div>

      {/* Owner bar */}
      {isOwned && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: owner?.color }}
        />
      )}

      {/* Player pieces */}
      {players.map((player, i) => (
        <PlayerPiece key={player.id} player={player} index={i} total={players.length} />
      ))}

      {/* Hover tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 border border-gray-700 p-2 rounded-lg shadow-xl text-xs whitespace-nowrap">
          <div className="font-bold text-white">{space.name}</div>
          {isProperty && (
            <div className="text-gray-300 mt-1 space-y-0.5">
              <div>Price: <span className="text-green-400">${space.price?.toFixed(2)}</span></div>
              <div>Rent: <span className="text-yellow-400">${space.rent?.[space.houses || 0]?.toFixed(2) || 'N/A'}</span></div>
              {owner && <div>Owner: <span style={{ color: owner.color }}>{owner.name}</span></div>}
            </div>
          )}
          {space.type === 'tax' && <div className="text-red-400">Pay ${space.amount?.toFixed(2)}</div>}
        </div>
      </div>
    </motion.div>
  );
};

export default function Board() {
  const { gameState, playerId, buildHouse } = useGameStore();

  if (!gameState) return null;

  const getPlayersOnSpace = (position) => {
    return gameState.players.filter(p => p.position === position && !p.bankrupt);
  };

  return (
    <div className="bg-gray-800/50 p-3 rounded-2xl border border-gray-700 shadow-2xl">
      <div 
        className="grid gap-px bg-gray-700"
        style={{ 
          gridTemplateColumns: 'repeat(11, minmax(45px, 55px))',
          gridTemplateRows: 'repeat(11, minmax(45px, 55px))',
        }}
      >
        {/* Render all 40 spaces */}
        {Array.from({ length: 40 }).map((_, index) => (
          <BoardSpace
            key={index}
            space={gameState.board[index]}
            index={index}
            players={getPlayersOnSpace(index)}
            gameState={gameState}
            playerId={playerId}
            onBuild={buildHouse}
          />
        ))}
        
        {/* Center area */}
        <div 
          className="col-start-2 col-end-11 row-start-2 row-end-11 
            flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/80 to-green-800/60 
            border border-emerald-600/30"
        >
          {/* Logo */}
          <div className="text-center mb-4">
            <h1 className="font-game text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 drop-shadow-lg">
              SKILL MONOPOLY
            </h1>
            <div className="text-emerald-300/70 text-sm mt-1">Winner Takes All</div>
          </div>

          {/* Current player */}
          {gameState.players[gameState.currentPlayerIndex] && (
            <motion.div 
              className="bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-3"
              animate={{ boxShadow: ['0 0 0 rgba(255,215,0,0)', '0 0 20px rgba(255,215,0,0.3)', '0 0 0 rgba(255,215,0,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="w-4 h-6 rounded-t-full border border-white"
                style={{ backgroundColor: gameState.players[gameState.currentPlayerIndex].color }}
              />
              <div>
                <div className="text-xs text-gray-400">Current Turn</div>
                <div className="font-bold text-white">
                  {gameState.players[gameState.currentPlayerIndex].name}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-center">
            <div className="bg-gray-900/50 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">Prize Pool</div>
              <div className="text-lg font-bold text-green-400">${gameState.totalPot?.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">Turn</div>
              <div className="text-lg font-bold text-white">{gameState.turnNumber}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
