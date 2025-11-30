const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const LuckyStreetsEngine = require('./game/LuckyStreetsEngine');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from client build in production
app.use(express.static(path.join(__dirname, '../client/dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "*"],
    methods: ["GET", "POST"]
  }
});

// Store active games
const games = new Map();
const playerToGame = new Map();

// Matchmaking queues
const matchmakingQueues = new Map();
const playerToQueue = new Map();

const ANON_NAMES = ['Lucky', 'Star', 'Ace', 'Flash'];

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Check matchmaking queue
function checkMatchmakingQueue(buyIn) {
  const queue = matchmakingQueues.get(buyIn);
  if (!queue || queue.length < 2) return;
  
  if (queue.length >= 4) {
    startMatchmakingGame(buyIn, 4);
  } else if (queue.length >= 2) {
    const oldestPlayer = queue[0];
    const waitTime = Date.now() - oldestPlayer.timestamp;
    
    if (waitTime >= 10000) {
      startMatchmakingGame(buyIn, queue.length);
    } else {
      setTimeout(() => checkMatchmakingQueue(buyIn), 10000 - waitTime + 100);
    }
  }
}

function startMatchmakingGame(buyIn, playerCount) {
  const queue = matchmakingQueues.get(buyIn);
  if (!queue || queue.length < playerCount) return;
  
  const players = queue.splice(0, playerCount);
  const roomCode = generateRoomCode();
  const game = new LuckyStreetsEngine(roomCode, buyIn);
  
  games.set(roomCode, game);
  
  players.forEach((p, index) => {
    const socket = io.sockets.sockets.get(p.socketId);
    if (socket) {
      game.addPlayer(p.socketId, ANON_NAMES[index]);
      playerToGame.set(p.socketId, roomCode);
      playerToQueue.delete(p.socketId);
      socket.join(roomCode);
    }
  });
  
  // Notify all players
  players.forEach((p) => {
    const socket = io.sockets.sockets.get(p.socketId);
    if (socket) {
      socket.emit('matchFound', { 
        roomCode, 
        gameState: game.getState()
      });
    }
  });
  
  // Auto-start after brief delay
  setTimeout(() => {
    if (game && !game.hasStarted && game.players.length >= 2) {
      game.startGame();
      io.to(roomCode).emit('gameStarted', { gameState: game.getState() });
      io.to(roomCode).emit('turnStart', { 
        currentPlayer: game.getCurrentPlayer(),
        gameState: game.getState()
      });
      
      // Start game timer
      startGameTimer(roomCode, game);
      
      console.log(`Lucky Streets game ${roomCode} started with ${game.players.length} players ($${buyIn} buy-in)`);
    }
  }, 3000);
}

function startGameTimer(roomCode, game) {
  const timerInterval = setInterval(() => {
    if (!games.has(roomCode)) {
      clearInterval(timerInterval);
      return;
    }
    
    game.updateTime();
    
    // Check for lucky drops
    const drop = game.checkLuckyDrop();
    if (drop) {
      io.to(drop.playerId).emit('luckyDrop', {
        drop: drop.drop,
        gameState: game.getState()
      });
      io.to(roomCode).emit('luckyDropAnnounce', {
        playerId: drop.playerId,
        drop: drop.drop
      });
    }
    
    // Broadcast time update
    io.to(roomCode).emit('timeUpdate', { 
      timeRemaining: game.timeRemaining 
    });
    
    // Check game end
    const endCheck = game.checkGameEnd();
    if (endCheck.ended) {
      clearInterval(timerInterval);
      game.phase = 'ended';
      io.to(roomCode).emit('gameOver', {
        winner: endCheck.winner,
        reason: endCheck.reason,
        gameState: game.getState()
      });
    }
  }, 1000);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join matchmaking
  socket.on('joinMatchmaking', ({ buyIn }) => {
    const existingTier = playerToQueue.get(socket.id);
    if (existingTier !== undefined) {
      const existingQueue = matchmakingQueues.get(existingTier);
      if (existingQueue) {
        const idx = existingQueue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) existingQueue.splice(idx, 1);
      }
    }
    
    if (!matchmakingQueues.has(buyIn)) {
      matchmakingQueues.set(buyIn, []);
    }
    
    const queue = matchmakingQueues.get(buyIn);
    queue.push({ socketId: socket.id, timestamp: Date.now() });
    playerToQueue.set(socket.id, buyIn);
    
    socket.emit('matchmakingUpdate', { playersInQueue: queue.length });
    
    queue.forEach(p => {
      if (p.socketId !== socket.id) {
        const otherSocket = io.sockets.sockets.get(p.socketId);
        if (otherSocket) {
          otherSocket.emit('matchmakingUpdate', { playersInQueue: queue.length });
        }
      }
    });
    
    checkMatchmakingQueue(buyIn);
  });

  // Leave matchmaking
  socket.on('leaveMatchmaking', () => {
    const tier = playerToQueue.get(socket.id);
    if (tier !== undefined) {
      const queue = matchmakingQueues.get(tier);
      if (queue) {
        const idx = queue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
      }
      playerToQueue.delete(socket.id);
      socket.emit('matchmakingCancelled');
    }
  });

  // Create private room
  socket.on('createRoom', ({ playerName, buyIn }) => {
    const roomCode = generateRoomCode();
    const game = new LuckyStreetsEngine(roomCode, buyIn);
    const player = game.addPlayer(socket.id, playerName);
    
    games.set(roomCode, game);
    playerToGame.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, player, gameState: game.getState() });
  });

  // Join room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const game = games.get(roomCode);
    
    if (!game) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (game.hasStarted) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }
    
    if (game.players.length >= 4) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    const player = game.addPlayer(socket.id, playerName);
    playerToGame.set(socket.id, roomCode);
    
    socket.join(roomCode);
    io.to(roomCode).emit('playerJoined', { player, gameState: game.getState() });
  });

  // Start game
  socket.on('startGame', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    if (game.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players' });
      return;
    }

    game.startGame();
    io.to(roomCode).emit('gameStarted', { gameState: game.getState() });
    io.to(roomCode).emit('turnStart', { 
      currentPlayer: game.getCurrentPlayer(),
      gameState: game.getState()
    });
    
    startGameTimer(roomCode, game);
  });

  // Roll dice - this triggers the spin!
  socket.on('rollDice', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.rollDice(socket.id);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    // Broadcast dice roll and spin result
    io.to(roomCode).emit('diceRolled', {
      playerId: socket.id,
      dice: result.dice,
      newPosition: result.newPosition,
      passedGo: result.passedGo,
      spin: result.spin,
      gameState: game.getState()
    });
    
    // Handle landing after spin animation
    setTimeout(() => {
      const landingResult = game.handleLanding(socket.id, result.spin);
      
      io.to(roomCode).emit('landingResolved', {
        playerId: socket.id,
        result: landingResult,
        gameState: game.getState()
      });
      
      // If player can buy, wait for their decision
      if (landingResult.canBuy) {
        socket.emit('buyOption', {
          propertyIndex: game.players.find(p => p.id === socket.id)?.position,
          price: landingResult.buyPrice,
          property: game.board[game.players.find(p => p.id === socket.id)?.position]
        });
      } else if (landingResult.canSwap) {
        socket.emit('swapOption', {
          gameState: game.getState()
        });
      } else if (landingResult.pendingFreeHouse) {
        socket.emit('freeHouseOption', {
          gameState: game.getState()
        });
      } else {
        // Auto end turn
        setTimeout(() => endTurn(roomCode, game), 1500);
      }
      
      // Check for bankruptcy
      const player = game.players.find(p => p.id === socket.id);
      if (player?.bankrupt) {
        io.to(roomCode).emit('playerBankrupt', {
          playerId: socket.id,
          gameState: game.getState()
        });
        
        const endCheck = game.checkGameEnd();
        if (endCheck.ended) {
          game.phase = 'ended';
          io.to(roomCode).emit('gameOver', {
            winner: endCheck.winner,
            reason: endCheck.reason,
            gameState: game.getState()
          });
        }
      }
    }, 3500); // Wait for spin animation
  });

  // Buy property
  socket.on('buyProperty', ({ propertyIndex, price }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.buyProperty(socket.id, propertyIndex, price);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('propertyBought', {
      playerId: socket.id,
      propertyIndex,
      gameState: game.getState()
    });
    
    setTimeout(() => endTurn(roomCode, game), 1000);
  });

  // Skip buying
  socket.on('skipBuy', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    endTurn(roomCode, game);
  });

  // Build house
  socket.on('buildHouse', ({ propertyIndex }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.buildHouse(socket.id, propertyIndex);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('houseBuilt', {
      playerId: socket.id,
      propertyIndex,
      houses: result.houses,
      gameState: game.getState()
    });
  });

  // Free house from streak
  socket.on('claimFreeHouse', ({ propertyIndex }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.addFreeHouse(socket.id, propertyIndex);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('freeHouseClaimed', {
      playerId: socket.id,
      propertyIndex,
      gameState: game.getState()
    });
    
    setTimeout(() => endTurn(roomCode, game), 1000);
  });

  // Swap property (from SWAP spin)
  socket.on('swapProperty', ({ myPropertyIndex, theirPropertyIndex }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.swapProperty(socket.id, myPropertyIndex, theirPropertyIndex);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('propertiesSwapped', {
      playerId: socket.id,
      myPropertyIndex,
      theirPropertyIndex,
      gameState: game.getState()
    });
    
    setTimeout(() => endTurn(roomCode, game), 1000);
  });

  // Apply lucky drop
  socket.on('applyLuckyDrop', ({ dropId, targetData }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.applyLuckyDrop(socket.id, dropId, targetData);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    if (result.pending) {
      socket.emit('luckyDropPending', { pending: result.pending });
      return;
    }
    
    io.to(roomCode).emit('luckyDropApplied', {
      playerId: socket.id,
      dropId,
      effect: result.effect,
      gameState: game.getState()
    });
    
    game.pendingLuckyDrop = null;
  });

  // End turn manually
  socket.on('endTurn', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    if (game.getCurrentPlayer()?.id !== socket.id) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    endTurn(roomCode, game);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const tier = playerToQueue.get(socket.id);
    if (tier !== undefined) {
      const queue = matchmakingQueues.get(tier);
      if (queue) {
        const idx = queue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
      }
      playerToQueue.delete(socket.id);
    }
    
    const roomCode = playerToGame.get(socket.id);
    if (roomCode) {
      const game = games.get(roomCode);
      if (game) {
        game.removePlayer(socket.id);
        playerToGame.delete(socket.id);
        
        io.to(roomCode).emit('playerLeft', {
          playerId: socket.id,
          gameState: game.getState()
        });
        
        const endCheck = game.checkGameEnd();
        if (endCheck.ended) {
          game.phase = 'ended';
          io.to(roomCode).emit('gameOver', {
            winner: endCheck.winner,
            reason: endCheck.reason,
            gameState: game.getState()
          });
        }
        
        if (game.players.filter(p => !p.bankrupt).length === 0) {
          games.delete(roomCode);
        }
      }
    }
    
    console.log(`Player disconnected: ${socket.id}`);
  });
});

function endTurn(roomCode, game) {
  game.nextTurn();
  const currentPlayer = game.getCurrentPlayer();
  
  if (currentPlayer) {
    io.to(roomCode).emit('turnStart', {
      currentPlayer,
      gameState: game.getState()
    });
  }
}

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎰 Lucky Streets server running on port ${PORT}`);
});
