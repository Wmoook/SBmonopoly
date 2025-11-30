import { useState } from 'react';
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

export default function AuctionModal() {
  const { gameState, playerId, placeBid, passAuction } = useGameStore();
  const [bidAmount, setBidAmount] = useState(0);

  if (!gameState?.currentAuction) return null;

  const auction = gameState.currentAuction;
  const property = auction.property;
  const currentBidder = gameState.players.find(p => p.id === auction.currentBidder);
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const hasPassed = auction.passedPlayers?.includes(playerId);
  const isHighestBidder = auction.currentBidder === playerId;

  const minBid = auction.currentBid > 0 ? auction.currentBid + 10 : auction.startingPrice;
  const canBid = myPlayer && !myPlayer.bankrupt && !hasPassed && myPlayer.money >= minBid;

  const handleBid = (amount) => {
    if (amount >= minBid && amount <= myPlayer.money) {
      placeBid(amount);
      setBidAmount(0);
    }
  };

  const quickBidAmounts = [
    minBid,
    Math.min(minBid + 50, myPlayer?.money || 0),
    Math.min(minBid + 100, myPlayer?.money || 0),
    myPlayer?.money || 0,
  ].filter((v, i, a) => a.indexOf(v) === i && v <= (myPlayer?.money || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="glass p-6 rounded-2xl max-w-md w-full auction-active"
      >
        <h2 className="font-game text-3xl text-yellow-400 text-center mb-4">
          🏛️ AUCTION!
        </h2>

        {/* Property card */}
        <div className="bg-white/10 rounded-xl overflow-hidden mb-4">
          <div
            className="h-4"
            style={{ backgroundColor: PROPERTY_COLORS[property.color] || '#666' }}
          />
          <div className="p-4 text-center">
            <h3 className="font-bold text-xl mb-2">{property.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Market Value:</span>
                <div className="font-bold text-green-400">${property.price}</div>
              </div>
              <div>
                <span className="text-gray-400">Starting Bid:</span>
                <div className="font-bold text-yellow-400">${auction.startingPrice}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current bid */}
        <div className="text-center mb-6">
          <div className="text-gray-400 mb-1">Current Bid</div>
          <div className="text-4xl font-bold text-green-400">
            ${auction.currentBid || 'No bids'}
          </div>
          {currentBidder && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentBidder.color }}
              />
              <span className="text-sm">{currentBidder.name}</span>
            </div>
          )}
        </div>

        {/* Passed players */}
        {auction.passedPlayers?.length > 0 && (
          <div className="text-center mb-4 text-sm text-gray-400">
            Passed: {auction.passedPlayers.map(id => 
              gameState.players.find(p => p.id === id)?.name
            ).join(', ')}
          </div>
        )}

        {/* Bidding controls */}
        {!hasPassed && !myPlayer?.bankrupt && (
          <div className="space-y-4">
            {/* Quick bid buttons */}
            <div className="grid grid-cols-2 gap-2">
              {quickBidAmounts.map((amount, i) => (
                <button
                  key={i}
                  onClick={() => handleBid(amount)}
                  disabled={!canBid || amount > myPlayer.money}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    amount === myPlayer?.money
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  ${amount}
                  {amount === myPlayer?.money && ' (All In!)'}
                </button>
              ))}
            </div>

            {/* Custom bid */}
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount || ''}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                placeholder={`Min: $${minBid}`}
                min={minBid}
                max={myPlayer?.money}
                className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={() => handleBid(bidAmount)}
                disabled={!canBid || bidAmount < minBid || bidAmount > myPlayer?.money}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bid
              </button>
            </div>

            {/* Your cash */}
            <div className="text-center text-sm text-gray-400">
              Your cash: <span className="text-green-400 font-bold">${myPlayer?.money}</span>
            </div>

            {/* Pass button */}
            <button
              onClick={passAuction}
              disabled={isHighestBidder}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {isHighestBidder ? "You're winning!" : '👋 Pass (Drop out)'}
            </button>
          </div>
        )}

        {hasPassed && (
          <div className="text-center py-4 text-gray-400">
            You passed on this auction
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
