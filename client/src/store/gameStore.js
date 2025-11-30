import { create } from 'zustand';
import { io } from 'socket.io-client';

// In production, connect to same origin. In dev, use localhost:3001
const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const useGameStore = create((set, get) => ({
  // Connection
  socket: null,
  connected: false,
  
  // Player info
  playerId: null,
  playerName: '',
  accountBalance: parseFloat(localStorage.getItem('accountBalance')) || 0,
  roomCode: null,
  
  // Game state
  gameState: null,
  phase: 'menu', // menu, lobby, playing, ended
  
  // Matchmaking state
  matchmakingStatus: null, // null, 'searching', 'found'
  matchmakingTier: null,
  matchmakingPlayers: 0,
  isAnonymousGame: false,
  
  // UI state
  error: null,
  messages: [],
  lastDice: null,
  isRolling: false,
  pendingTradeProposal: null, // Incoming trade proposal
  pendingPropertyDecision: null, // Property to buy or auction
  lastCard: null, // Last chance/community chest card drawn
  
  // Actions
  connect: () => {
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      set({ connected: true, socket, playerId: socket.id });
      console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
      set({ connected: false });
      console.log('Disconnected from server');
    });
    
    socket.on('error', ({ message }) => {
      set({ error: message });
      setTimeout(() => set({ error: null }), 3000);
    });
    
    // Matchmaking events
    socket.on('matchmakingUpdate', ({ playersInQueue }) => {
      set({ matchmakingPlayers: playersInQueue });
    });
    
    socket.on('matchFound', ({ roomCode, gameState }) => {
      // Deduct buy-in when match found
      get().withdrawFromAccount(gameState.buyIn);
      set({ 
        roomCode, 
        gameState, 
        phase: 'lobby',
        matchmakingStatus: null,
        matchmakingTier: null,
        isAnonymousGame: true
      });
    });
    
    socket.on('matchmakingCancelled', () => {
      set({ 
        matchmakingStatus: null, 
        matchmakingTier: null,
        matchmakingPlayers: 0
      });
    });
    
    socket.on('roomCreated', ({ roomCode, player, gameState }) => {
      set({ roomCode, gameState, phase: 'lobby', playerName: player.name, isAnonymousGame: false });
    });
    
    socket.on('roomJoined', ({ roomCode, player, gameState }) => {
      // Deduct buy-in when successfully joining
      get().onJoinedRoom(gameState.buyIn);
      set({ roomCode, gameState, phase: 'lobby', playerName: player.name, isAnonymousGame: false });
    });
    
    socket.on('playerJoined', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerLeft', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('gameStarted', ({ gameState }) => {
      set({ gameState, phase: 'playing' });
    });
    
    socket.on('turnStart', ({ currentPlayer, gameState }) => {
      set({ gameState });
    });
    
    socket.on('diceRolled', ({ dice, newPosition, passedGo, gameState }) => {
      set({ lastDice: dice, isRolling: false, gameState });
    });
    
    socket.on('auctionStarted', ({ property, propertyIndex, gameState }) => {
      set({ gameState });
    });
    
    socket.on('bidPlaced', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerPassed', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('auctionComplete', ({ winner, property, price, gameState }) => {
      set({ gameState });
    });
    
    socket.on('rentPaid', ({ fromPlayer, toPlayer, amount, gameState }) => {
      set({ gameState });
    });
    
    socket.on('taxPaid', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('sentToJail', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('houseBuilt', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('cardDrawn', ({ playerId, cardType, card, gameState }) => {
      // Show the card that was drawn
      set({ 
        gameState,
        lastCard: { playerId, cardType, card }
      });
      // Clear after a few seconds
      setTimeout(() => set({ lastCard: null }), 3000);
    });
    
    socket.on('awaitingAction', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerBankrupt', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('tradeProposed', ({ fromPlayerId, offer, gameState }) => {
      set({ pendingTradeProposal: { fromPlayerId, offer }, gameState });
    });
    
    socket.on('tradeCompleted', ({ gameState }) => {
      set({ gameState, pendingTradeProposal: null });
    });
    
    socket.on('tradeDeclined', ({ byPlayerId }) => {
      // Show notification that trade was declined
      set({ error: 'Trade was declined' });
    });
    
    socket.on('propertyLanded', ({ property, propertyIndex, gameState }) => {
      // Show buy or auction modal
      set({ pendingPropertyDecision: { property, propertyIndex }, gameState });
    });
    
    socket.on('propertyPurchased', ({ gameState }) => {
      set({ gameState, pendingPropertyDecision: null });
    });
    
    socket.on('gameOver', ({ winner, gameState }) => {
      set({ gameState, phase: 'ended' });
    });
    
    socket.on('chatMessage', (message) => {
      set(state => ({ messages: [...state.messages.slice(-50), message] }));
    });
    
    set({ socket });
  },
  
  // Matchmaking functions
  joinMatchmaking: (tier) => {
    const { socket, accountBalance } = get();
    if (socket && tier <= accountBalance) {
      set({ 
        matchmakingStatus: 'searching', 
        matchmakingTier: tier,
        matchmakingPlayers: 1
      });
      socket.emit('joinMatchmaking', { buyIn: tier });
    }
  },
  
  leaveMatchmaking: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveMatchmaking');
      set({ 
        matchmakingStatus: null, 
        matchmakingTier: null,
        matchmakingPlayers: 0
      });
    }
  },
  
  createRoom: (playerName, buyIn, isPrivate = false) => {
    const { socket, accountBalance, withdrawFromAccount } = get();
    if (socket) {
      const buyInAmount = parseFloat(buyIn) || 10;
      if (buyInAmount > accountBalance) {
        set({ error: 'Insufficient balance' });
        return false;
      }
      withdrawFromAccount(buyInAmount);
      set({ playerName });
      socket.emit('createRoom', { playerName, buyIn: buyInAmount, isPrivate });
      return true;
    }
    return false;
  },
  
  joinRoom: (roomCode, playerName) => {
    const { socket } = get();
    if (socket) {
      set({ playerName });
      socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName });
    }
  },
  
  // Called after successfully joining to deduct buy-in
  onJoinedRoom: (buyIn) => {
    const { withdrawFromAccount } = get();
    withdrawFromAccount(buyIn);
  },
  
  startGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startGame');
    }
  },
  
  rollDice: () => {
    const { socket } = get();
    if (socket) {
      set({ isRolling: true });
      socket.emit('rollDice');
    }
  },
  
  placeBid: (amount) => {
    const { socket } = get();
    if (socket) {
      socket.emit('placeBid', { amount });
    }
  },
  
  passAuction: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('passAuction');
    }
  },
  
  buildHouse: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('buildHouse', { propertyIndex });
    }
  },
  
  endTurn: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('endTurn');
    }
  },
  
  sendMessage: (message) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chatMessage', { message });
    }
  },
  
  proposeTrade: (targetPlayerId, offer) => {
    const { socket } = get();
    if (socket) {
      socket.emit('proposeTrade', { targetPlayerId, offer });
    }
  },
  
  acceptTrade: (fromPlayerId, offer) => {
    const { socket } = get();
    if (socket) {
      socket.emit('acceptTrade', { fromPlayerId, offer });
      set({ pendingTradeProposal: null });
    }
  },
  
  declineTrade: (fromPlayerId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('declineTrade', { fromPlayerId });
      set({ pendingTradeProposal: null });
    }
  },
  
  buyProperty: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('buyProperty', { propertyIndex });
      set({ pendingPropertyDecision: null });
    }
  },
  
  auctionProperty: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('auctionProperty', { propertyIndex });
      set({ pendingPropertyDecision: null });
    }
  },
  
  resetGame: () => {
    set({
      roomCode: null,
      gameState: null,
      phase: 'menu',
      messages: [],
      draftProperties: [],
      currentDrafter: null,
      lastDice: null,
      isRolling: false,
      matchmakingStatus: null,
      matchmakingTier: null,
      matchmakingPlayers: 0,
      isAnonymousGame: false,
    });
  },
  
  // Account balance functions
  depositToAccount: (amount) => {
    const newBalance = get().accountBalance + amount;
    localStorage.setItem('accountBalance', newBalance.toString());
    set({ accountBalance: newBalance });
  },
  
  withdrawFromAccount: (amount) => {
    const currentBalance = get().accountBalance;
    if (amount > currentBalance) return false;
    const newBalance = currentBalance - amount;
    localStorage.setItem('accountBalance', newBalance.toString());
    set({ accountBalance: newBalance });
    return true;
  },
  
  // Called when joining a game to deduct buy-in
  payBuyIn: (amount) => {
    return get().withdrawFromAccount(amount);
  },
  
  // Called when winning to add prize
  receivePrize: (amount) => {
    get().depositToAccount(amount);
  },
}));
