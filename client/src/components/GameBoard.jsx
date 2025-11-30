import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Board from './Board';
import PlayerPanel from './PlayerPanel';
import AuctionModal from './AuctionModal';
import DiceRoller from './DiceRoller';
import Chat from './Chat';
import PowerTokens from './PowerTokens';

export default function GameBoard() {
  const { gameState, playerId } = useGameStore();
  const [showChat, setShowChat] = useState(false);

  if (!gameState) return null;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;
  const hasAuction = gameState.currentAuction !== null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Left side - Players and controls */}
      <div className="lg:w-64 space-y-4">
        <PlayerPanel />
        
        {isMyTurn && !hasAuction && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-4 rounded-xl"
          >
            <DiceRoller />
          </motion.div>
        )}
        
        {myPlayer && !myPlayer.bankrupt && (
          <PowerTokens player={myPlayer} />
        )}
      </div>

      {/* Center - Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <Board />
      </div>

      {/* Right side - Info and Chat */}
      <div className="lg:w-72 space-y-4">
        {/* Game info */}
        <div className="glass p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Room</span>
            <span className="font-mono font-bold text-yellow-400">{gameState.roomCode}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Turn</span>
            <span className="font-bold">{gameState.turnNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Prize Pool</span>
            <span className="font-bold text-green-400">
              ${gameState.totalPot?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Time Left</span>
            <span className="font-mono">
              {Math.floor(gameState.timeRemaining / 60000)}:{String(Math.floor((gameState.timeRemaining % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Toggle chat */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full glass p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
        >
          💬 {showChat ? 'Hide Chat' : 'Show Chat'}
        </button>

        {showChat && <Chat />}
      </div>

      {/* Auction Modal */}
      <AnimatePresence>
        {hasAuction && <AuctionModal />}
      </AnimatePresence>
    </div>
  );
}
