import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Board from './Board';
import PlayerPanel from './PlayerPanel';
import MyProperties from './MyProperties';
import AuctionModal from './AuctionModal';
import BuyPropertyModal from './BuyPropertyModal';
import TradeModal from './TradeModal';
import TradeProposalModal from './TradeProposalModal';
import DiceRoller from './DiceRoller';
import Chat from './Chat';

export default function GameBoard() {
  const { 
    gameState, 
    playerId,
    pendingPropertyDecision,
    pendingTradeProposal,
    lastCard,
    buyProperty,
    auctionProperty
  } = useGameStore();
  const [showChat, setShowChat] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

  if (!gameState) return null;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;
  const hasAuction = gameState.currentAuction !== null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[85vh] p-2">
      {/* Left side - Players and controls */}
      <div className="lg:w-72 space-y-4">
        <PlayerPanel />
        
        <AnimatePresence mode="wait">
          {isMyTurn && !hasAuction && !pendingPropertyDecision && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="glass p-4 rounded-xl"
            >
              <DiceRoller />
            </motion.div>
          )}
        </AnimatePresence>
        
        {myPlayer && !myPlayer.bankrupt && (
          <div className="space-y-3">
            {/* Trade Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTrade(true)}
              className="w-full py-3 glass rounded-xl flex items-center justify-center gap-2 text-yellow-400 font-bold hover:bg-white/10 transition-all"
            >
              Propose Trade
            </motion.button>
          </div>
        )}
      </div>

      {/* Center - Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <Board />
      </div>

      {/* Right side - Info, Properties and Chat */}
      <div className="lg:w-80 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
        {/* Game info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-4 rounded-xl space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Room</span>
            <span className="font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              {gameState.roomCode}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Turn</span>
            <span className="font-bold text-lg">{gameState.turnNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Prize Pool</span>
            <span className="font-bold text-xl text-green-400">
              ${gameState.totalPot?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Time Left</span>
            <span className="font-mono text-lg">
              {Math.floor(gameState.timeRemaining / 60000)}:{String(Math.floor((gameState.timeRemaining % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        {/* My balance */}
        {myPlayer && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-xl"
          >
            <div className="text-gray-400 text-sm mb-1">Your Balance</div>
            <div className="text-3xl font-bold text-green-400">
              ${myPlayer.money.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Net Worth: ${myPlayer.netWorth?.toFixed(2)}
            </div>
          </motion.div>
        )}

        {/* My Properties */}
        <MyProperties />

        {/* Toggle chat */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowChat(!showChat)}
          className="w-full glass p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
        >
          💬 {showChat ? 'Hide Chat' : 'Show Chat'}
        </motion.button>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Chat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buy/Auction Property Modal */}
      <AnimatePresence>
        {pendingPropertyDecision && (
          <BuyPropertyModal
            property={pendingPropertyDecision.property}
            propertyIndex={pendingPropertyDecision.propertyIndex}
            onBuy={() => buyProperty(pendingPropertyDecision.propertyIndex)}
            onAuction={() => auctionProperty(pendingPropertyDecision.propertyIndex)}
          />
        )}
      </AnimatePresence>

      {/* Auction Modal */}
      <AnimatePresence>
        {hasAuction && <AuctionModal />}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {showTrade && <TradeModal onClose={() => setShowTrade(false)} />}
      </AnimatePresence>

      {/* Incoming Trade Proposal */}
      <AnimatePresence>
        {pendingTradeProposal && (
          <TradeProposalModal
            proposal={pendingTradeProposal}
            onClose={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Card Drawn Notification */}
      <AnimatePresence>
        {lastCard && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`glass p-8 rounded-2xl text-center max-w-md ${
              lastCard.cardType === 'chance' ? 'border-2 border-orange-400' : 'border-2 border-blue-400'
            }`}>
              <div className="text-4xl mb-4">
                {lastCard.cardType === 'chance' ? '🎲' : '📦'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                lastCard.cardType === 'chance' ? 'text-orange-400' : 'text-blue-400'
              }`}>
                {lastCard.cardType === 'chance' ? 'CHANCE' : 'COMMUNITY CHEST'}
              </h3>
              <p className="text-lg">{lastCard.card.text}</p>
              {lastCard.card.type === 'money' && (
                <p className={`text-2xl font-bold mt-3 ${
                  lastCard.card.amount >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastCard.card.amount >= 0 ? '+' : ''}${lastCard.card.amount.toFixed(2)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
