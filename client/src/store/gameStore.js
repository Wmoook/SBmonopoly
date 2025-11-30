import { create } from 'zustand';
import { io } from 'socket.io-client';

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
  phase: 'menu', // menu, lobby, draft, playing, ended
  
  // Matchmaking state
  matchmakingStatus: null, // null, 'searching', 'found'
  matchmakingTier: null,
  matchmakingPlayers: 0,
  isAnonymousGame: false,
  
  // UI state
  error: null,
  messages: [],
  draftProperties: [],
  currentDrafter: null,
  lastDice: null,
  isRolling: false,
  
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
      set({ gameState, phase: 'draft' });
    });
    
    socket.on('draftPhase', ({ draftProperties, currentDrafter, gameState }) => {
      set({ draftProperties, currentDrafter, gameState });
    });
    
    socket.on('propertyDrafted', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('draftComplete', ({ gameState }) => {
      set({ gameState, phase: 'playing', draftProperties: [], currentDrafter: null });
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
    
    socket.on('powerTokenUsed', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('awaitingAction', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerBankrupt', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('tradeProposed', ({ fromPlayerId, offer }) => {
      // Handle trade UI
    });
    
    socket.on('tradeCompleted', ({ gameState }) => {
      set({ gameState });
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
  
  draftProperty: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('draftProperty', { propertyIndex });
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
  
  usePowerToken: (tokenType, targetData = {}) => {
    const { socket } = get();
    if (socket) {
      socket.emit('usePowerToken', { tokenType, targetData });
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
