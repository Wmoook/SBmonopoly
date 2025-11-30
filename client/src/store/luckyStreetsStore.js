import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const useLuckyStreetsStore = create((set, get) => ({
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
  
  // Matchmaking
  matchmakingStatus: null,
  matchmakingTier: null,
  matchmakingPlayers: 0,
  
  // UI state
  error: null,
  lastDice: null,
  lastSpin: null,
  isSpinning: false,
  pendingBuy: null,
  pendingSwap: false,
  pendingFreeHouse: false,
  luckyDrop: null,
  
  // Actions
  connect: () => {
    // Prevent multiple connections
    const existingSocket = get().socket;
    if (existingSocket?.connected) {
      return;
    }
    
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      set({ socket, connected: true, playerId: socket.id });
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ connected: false });
    });
    
    socket.on('error', ({ message }) => {
      console.log('Server error:', message);
      set({ error: message });
      setTimeout(() => set({ error: null }), 3000);
    });

    // Matchmaking
    socket.on('matchmakingUpdate', ({ playersInQueue }) => {
      set({ matchmakingPlayers: playersInQueue });
    });
    
    socket.on('matchFound', ({ roomCode, gameState }) => {
      set({ 
        roomCode, 
        gameState, 
        phase: 'lobby',
        matchmakingStatus: 'found'
      });
    });
    
    socket.on('matchmakingCancelled', () => {
      set({ matchmakingStatus: null, matchmakingTier: null, matchmakingPlayers: 0 });
    });

    // Room events
    socket.on('roomCreated', ({ roomCode, player, gameState }) => {
      set({ roomCode, gameState, phase: 'lobby', playerId: player.id });
    });
    
    socket.on('roomJoined', ({ roomCode, player, gameState }) => {
      // Deduct buy-in from account balance
      const buyIn = gameState.buyIn || 0;
      const currentBalance = get().accountBalance;
      if (buyIn > 0 && currentBalance >= buyIn) {
        localStorage.setItem('accountBalance', (currentBalance - buyIn).toString());
        set({ accountBalance: currentBalance - buyIn });
      }
      set({ roomCode, gameState, phase: 'lobby', playerId: player.id });
    });
    
    socket.on('playerJoined', ({ player, gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerLeft', ({ gameState }) => {
      set({ gameState });
    });

    // Game events
    socket.on('gameStarted', ({ gameState }) => {
      set({ gameState, phase: 'playing' });
    });
    
    socket.on('turnStart', ({ currentPlayer, gameState }) => {
      set({ 
        gameState, 
        pendingBuy: null, 
        pendingSwap: false, 
        pendingFreeHouse: false,
        isSpinning: false,
        lastSpin: null
      });
    });
    
    socket.on('diceRolled', ({ dice, newPosition, passedGo, spin, gameState }) => {
      set({ 
        lastDice: dice, 
        lastSpin: spin,
        isSpinning: true,
        gameState 
      });
    });
    
    socket.on('landingResolved', ({ playerId, result, gameState }) => {
      set({ gameState, isSpinning: false });
    });
    
    socket.on('buyOption', ({ propertyIndex, price, property }) => {
      set({ pendingBuy: { propertyIndex, price, property } });
    });
    
    socket.on('swapOption', ({ gameState }) => {
      set({ pendingSwap: true, gameState });
    });
    
    socket.on('freeHouseOption', ({ gameState }) => {
      set({ pendingFreeHouse: true, gameState });
    });
    
    socket.on('propertyBought', ({ gameState }) => {
      set({ gameState, pendingBuy: null });
    });
    
    socket.on('propertiesSwapped', ({ gameState }) => {
      set({ gameState, pendingSwap: false });
    });
    
    socket.on('freeHouseClaimed', ({ gameState }) => {
      set({ gameState, pendingFreeHouse: false });
    });
    
    socket.on('houseBuilt', ({ gameState }) => {
      set({ gameState });
    });

    // Lucky drops
    socket.on('luckyDrop', ({ drop, gameState }) => {
      set({ luckyDrop: drop, gameState });
    });
    
    socket.on('luckyDropAnnounce', ({ playerId, drop }) => {
      // Could show toast notification
    });
    
    socket.on('luckyDropApplied', ({ gameState }) => {
      set({ gameState, luckyDrop: null });
    });
    
    socket.on('luckyDropPending', ({ pending }) => {
      // Handle pending actions (choose property, choose target)
    });

    // Timer
    socket.on('timeUpdate', ({ timeRemaining }) => {
      set(state => ({
        gameState: state.gameState ? { ...state.gameState, timeRemaining } : null
      }));
    });

    // Game end
    socket.on('playerBankrupt', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('gameOver', ({ winner, reason, gameState }) => {
      set({ gameState, phase: 'ended' });
    });

    set({ socket });
  },

  // Account balance
  setAccountBalance: (amount) => {
    localStorage.setItem('accountBalance', amount.toString());
    set({ accountBalance: amount });
  },
  
  deposit: (amount) => {
    const newBalance = get().accountBalance + amount;
    localStorage.setItem('accountBalance', newBalance.toString());
    set({ accountBalance: newBalance });
  },

  // Matchmaking
  joinMatchmaking: (buyIn) => {
    const { socket, accountBalance, setAccountBalance } = get();
    if (socket && accountBalance >= buyIn) {
      setAccountBalance(accountBalance - buyIn);
      socket.emit('joinMatchmaking', { buyIn });
      set({ matchmakingStatus: 'searching', matchmakingTier: buyIn });
    }
  },
  
  leaveMatchmaking: () => {
    const { socket, matchmakingTier, accountBalance, setAccountBalance } = get();
    if (socket) {
      socket.emit('leaveMatchmaking');
      if (matchmakingTier) {
        setAccountBalance(accountBalance + matchmakingTier);
      }
      set({ matchmakingStatus: null, matchmakingTier: null, matchmakingPlayers: 0 });
    }
  },

  // Room actions
  createRoom: (playerName, buyIn) => {
    const { socket, accountBalance, setAccountBalance } = get();
    if (socket && accountBalance >= buyIn) {
      setAccountBalance(accountBalance - buyIn);
      set({ playerName });
      socket.emit('createRoom', { playerName, buyIn });
    }
  },
  
  joinRoom: (roomCode, playerName) => {
    const { socket } = get();
    if (socket) {
      set({ playerName, roomCode });
      socket.emit('joinRoom', { roomCode, playerName });
    }
  },
  
  startGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startGame');
    }
  },

  // Game actions
  rollDice: () => {
    const { socket } = get();
    if (socket) {
      set({ isSpinning: true });
      socket.emit('rollDice');
    }
  },
  
  buyProperty: () => {
    const { socket, pendingBuy } = get();
    if (socket && pendingBuy) {
      socket.emit('buyProperty', { 
        propertyIndex: pendingBuy.propertyIndex, 
        price: pendingBuy.price 
      });
    }
  },
  
  skipBuy: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('skipBuy');
      set({ pendingBuy: null });
    }
  },
  
  buildHouse: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('buildHouse', { propertyIndex });
    }
  },
  
  claimFreeHouse: (propertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('claimFreeHouse', { propertyIndex });
    }
  },
  
  swapProperty: (myPropertyIndex, theirPropertyIndex) => {
    const { socket } = get();
    if (socket) {
      socket.emit('swapProperty', { myPropertyIndex, theirPropertyIndex });
    }
  },
  
  applyLuckyDrop: (dropId, targetData = {}) => {
    const { socket } = get();
    if (socket) {
      socket.emit('applyLuckyDrop', { dropId, targetData });
    }
  },
  
  endTurn: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('endTurn');
    }
  },

  // Reset
  resetGame: () => {
    set({
      gameState: null,
      phase: 'menu',
      roomCode: null,
      lastDice: null,
      lastSpin: null,
      isSpinning: false,
      pendingBuy: null,
      pendingSwap: false,
      pendingFreeHouse: false,
      luckyDrop: null,
      matchmakingStatus: null,
      matchmakingTier: null,
      matchmakingPlayers: 0,
    });
  },
}));
