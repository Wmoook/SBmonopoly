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
  accountBalance: parseFloat(localStorage.getItem('accountBalance')) || 100,
  roomCode: null,
  
  // Game state
  gameState: null,
  phase: 'menu', // menu, lobby, playing, ended
  
  // UI state
  error: null,
  
  // Actions
  connect: () => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;
    
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('🎰 Connected:', socket.id);
      set({ socket, connected: true, playerId: socket.id });
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected');
      set({ connected: false });
    });
    
    socket.on('error', ({ message }) => {
      console.log('Error:', message);
      set({ error: message });
      setTimeout(() => set({ error: null }), 3000);
    });

    // Room events
    socket.on('roomCreated', ({ roomCode, player, gameState }) => {
      set({ roomCode, gameState, phase: 'lobby', playerId: player.id });
    });
    
    socket.on('roomJoined', ({ roomCode, player, gameState }) => {
      // Deduct buy-in from account balance
      const buyIn = gameState?.settings?.buyIn || 0;
      const currentBalance = get().accountBalance;
      if (buyIn > 0 && currentBalance >= buyIn) {
        localStorage.setItem('accountBalance', (currentBalance - buyIn).toString());
        set({ accountBalance: currentBalance - buyIn });
      }
      set({ roomCode, gameState, phase: 'lobby', playerId: player.id });
    });
    
    socket.on('playerJoined', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('playerLeft', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('playerDisconnected', ({ gameState }) => {
      set({ gameState });
    });

    // Game events
    socket.on('gameStarted', ({ gameState }) => {
      set({ gameState, phase: 'playing' });
    });
    
    socket.on('turnStart', ({ currentPlayer, gameState }) => {
      set({ gameState });
    });
    
    socket.on('diceRolled', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('landingResult', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('wheelResult', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('choiceResult', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('teleportComplete', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('freezeComplete', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('miniGameComplete', ({ gameState }) => {
      set({ gameState });
    });

    socket.on('playerEliminated', ({ gameState }) => {
      set({ gameState });
    });
    
    socket.on('gameOver', ({ winner, message }) => {
      const myId = get().playerId;
      const didWin = winner?.id === myId;
      
      if (didWin && winner.cash > 0) {
        const currentBalance = get().accountBalance;
        const newBalance = currentBalance + winner.cash;
        localStorage.setItem('accountBalance', newBalance.toString());
        set({ accountBalance: newBalance });
      }
      
      set({ phase: 'ended', winner, winMessage: message });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  // Room actions
  createRoom: (playerName, buyIn = 10) => {
    const socket = get().socket;
    if (!socket) return;
    
    set({ playerName });
    socket.emit('createRoom', { playerName, buyIn });
  },

  joinRoom: (roomCode, playerName) => {
    const socket = get().socket;
    if (!socket) return;
    
    set({ playerName });
    socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName });
  },

  startGame: () => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('startGame');
  },

  // Game actions
  rollDice: () => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('rollDice');
  },

  makeChoice: (choiceIndex) => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('makeWheelChoice', { choiceIndex });
  },

  chooseTeleport: (targetSpace) => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('chooseTeleport', { targetSpace });
  },

  chooseFreeze: (targetId) => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('chooseFreeze', { targetId });
  },

  miniGameResult: (won, stakes) => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('miniGameResult', { won, stakes });
  },

  endTurn: () => {
    const socket = get().socket;
    if (!socket) return;
    
    socket.emit('endTurn');
  },

  // Balance management
  addBalance: (amount) => {
    const current = get().accountBalance;
    const newBalance = current + amount;
    localStorage.setItem('accountBalance', newBalance.toString());
    set({ accountBalance: newBalance });
  },

  // Reset
  resetGame: () => {
    set({
      gameState: null,
      phase: 'menu',
      roomCode: null,
      error: null,
    });
  },
}));
