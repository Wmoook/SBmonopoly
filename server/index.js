const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const GameEngine = require('./game/GameEngine');

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

// Matchmaking queues - one per buy-in tier
const matchmakingQueues = new Map(); // buyIn -> [{ socketId, timestamp }]
const playerToQueue = new Map(); // socketId -> buyIn tier

// Anonymous names for matchmaking games
const ANON_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const ANON_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

// Check if a queue has enough players to start
function checkMatchmakingQueue(buyIn) {
  const queue = matchmakingQueues.get(buyIn);
  if (!queue || queue.length < 2) return;
  
  // Start game with 2-4 players after a short wait, or immediately if 4 players
  if (queue.length >= 4) {
    startMatchmakingGame(buyIn, 4);
  } else if (queue.length >= 2) {
    // Wait 10 seconds for more players, then start
    const oldestPlayer = queue[0];
    const waitTime = Date.now() - oldestPlayer.timestamp;
    
    if (waitTime >= 10000) {
      startMatchmakingGame(buyIn, queue.length);
    } else {
      // Schedule a check
      setTimeout(() => checkMatchmakingQueue(buyIn), 10000 - waitTime + 100);
    }
  }
}

function startMatchmakingGame(buyIn, playerCount) {
  const queue = matchmakingQueues.get(buyIn);
  if (!queue || queue.length < playerCount) return;
  
  // Take players from queue
  const players = queue.splice(0, playerCount);
  
  // Create a new game
  const roomCode = generateRoomCode();
  const game = new GameEngine(roomCode, buyIn, true); // true = anonymous
  
  games.set(roomCode, game);
  
  // Add all players with anonymous names
  players.forEach((p, index) => {
    const socket = io.sockets.sockets.get(p.socketId);
    if (socket) {
      const player = game.addPlayer(p.socketId, ANON_NAMES[index], true);
      playerToGame.set(p.socketId, roomCode);
      playerToQueue.delete(p.socketId);
      socket.join(roomCode);
    }
  });
  
  // Notify all players
  players.forEach((p, index) => {
    const socket = io.sockets.sockets.get(p.socketId);
    if (socket) {
      socket.emit('matchFound', { 
        roomCode, 
        gameState: game.getState()
      });
    }
  });
  
  // Update remaining queue members
  if (queue.length > 0) {
    queue.forEach(p => {
      const socket = io.sockets.sockets.get(p.socketId);
      if (socket) {
        socket.emit('matchmakingUpdate', { playersInQueue: queue.length });
      }
    });
  }
  
  // Auto-start the game after a brief delay
  setTimeout(() => {
    if (game && !game.hasStarted && game.players.length >= 2) {
      game.startGame();
      io.to(roomCode).emit('gameStarted', { gameState: game.getState() });
      
      // Start property draft
      io.to(roomCode).emit('draftPhase', { 
        draftProperties: game.getDraftProperties(),
        currentDrafter: game.getCurrentDrafter(),
        gameState: game.getState()
      });
      
      console.log(`Matchmaking game ${roomCode} auto-started with ${game.players.length} anonymous players ($${buyIn} buy-in)`);
    }
  }, 3000);
  
  console.log(`Matchmaking game ${roomCode} created with ${playerCount} players ($${buyIn} buy-in)`);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join matchmaking queue
  socket.on('joinMatchmaking', ({ buyIn }) => {
    // Remove from any existing queue
    const existingTier = playerToQueue.get(socket.id);
    if (existingTier !== undefined) {
      const existingQueue = matchmakingQueues.get(existingTier);
      if (existingQueue) {
        const idx = existingQueue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) existingQueue.splice(idx, 1);
      }
    }
    
    // Add to new queue
    if (!matchmakingQueues.has(buyIn)) {
      matchmakingQueues.set(buyIn, []);
    }
    
    const queue = matchmakingQueues.get(buyIn);
    queue.push({ socketId: socket.id, timestamp: Date.now() });
    playerToQueue.set(socket.id, buyIn);
    
    // Notify player of queue status
    socket.emit('matchmakingUpdate', { playersInQueue: queue.length });
    
    // Notify other players in queue
    queue.forEach(p => {
      if (p.socketId !== socket.id) {
        const otherSocket = io.sockets.sockets.get(p.socketId);
        if (otherSocket) {
          otherSocket.emit('matchmakingUpdate', { playersInQueue: queue.length });
        }
      }
    });
    
    console.log(`Player ${socket.id} joined $${buyIn} matchmaking queue (${queue.length} in queue)`);
    
    // Check if we can start a game
    checkMatchmakingQueue(buyIn);
  });
  
  // Leave matchmaking queue
  socket.on('leaveMatchmaking', () => {
    const tier = playerToQueue.get(socket.id);
    if (tier !== undefined) {
      const queue = matchmakingQueues.get(tier);
      if (queue) {
        const idx = queue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
        
        // Notify remaining players
        queue.forEach(p => {
          const otherSocket = io.sockets.sockets.get(p.socketId);
          if (otherSocket) {
            otherSocket.emit('matchmakingUpdate', { playersInQueue: queue.length });
          }
        });
      }
      playerToQueue.delete(socket.id);
      socket.emit('matchmakingCancelled');
      console.log(`Player ${socket.id} left matchmaking queue`);
    }
  });

  // Create a new private game room
  socket.on('createRoom', ({ playerName, buyIn, isPrivate }) => {
    const roomCode = generateRoomCode();
    const game = new GameEngine(roomCode, buyIn, false); // false = not anonymous
    const player = game.addPlayer(socket.id, playerName, false);
    
    games.set(roomCode, game);
    playerToGame.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, player, gameState: game.getState() });
    console.log(`Private room ${roomCode} created by ${playerName} with $${buyIn} buy-in`);
  });

  // Join existing room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const game = games.get(roomCode);
    
    if (!game) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (game.isAnonymous) {
      socket.emit('error', { message: 'Cannot join matchmaking games with room code' });
      return;
    }
    
    if (game.hasStarted) {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    if (game.players.length >= 4) {
      socket.emit('error', { message: 'Room is full (max 4 players)' });
      return;
    }

    const player = game.addPlayer(socket.id, playerName, false);
    playerToGame.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('roomJoined', { roomCode, player, gameState: game.getState() });
    io.to(roomCode).emit('playerJoined', { player, gameState: game.getState() });
    console.log(`${playerName} joined room ${roomCode} (buy-in: $${game.buyIn})`);
  });

  // Start the game (host only) - for private games
  socket.on('startGame', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    // Anonymous games auto-start, so this is only for private games
    if (game.isAnonymous) {
      socket.emit('error', { message: 'Matchmaking games start automatically' });
      return;
    }
    
    if (game.players[0].id !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }
    
    if (game.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    game.startGame();
    io.to(roomCode).emit('gameStarted', { gameState: game.getState() });
    
    // Start property draft
    io.to(roomCode).emit('draftPhase', { 
      draftProperties: game.getDraftProperties(),
      currentDrafter: game.getCurrentDrafter(),
      gameState: game.getState()
    });
  });

  // Draft a property
  socket.on('draftProperty', ({ propertyIndex }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.draftProperty(socket.id, propertyIndex);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('propertyDrafted', {
      playerId: socket.id,
      property: result.property,
      gameState: game.getState()
    });
    
    if (result.draftComplete) {
      io.to(roomCode).emit('draftComplete', { gameState: game.getState() });
      io.to(roomCode).emit('turnStart', { 
        currentPlayer: game.getCurrentPlayer(),
        gameState: game.getState()
      });
    } else {
      io.to(roomCode).emit('draftPhase', {
        draftProperties: game.getDraftProperties(),
        currentDrafter: game.getCurrentDrafter(),
        gameState: game.getState()
      });
    }
  });

  // Roll dice
  socket.on('rollDice', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.rollDice(socket.id);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('diceRolled', {
      playerId: socket.id,
      dice: result.dice,
      newPosition: result.newPosition,
      passedGo: result.passedGo,
      gameState: game.getState()
    });
    
    // Handle landing effects
    setTimeout(() => {
      handleLanding(roomCode, socket.id, game);
    }, 1500);
  });

  // Use power token
  socket.on('usePowerToken', ({ tokenType, targetData }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.usePowerToken(socket.id, tokenType, targetData);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('powerTokenUsed', {
      playerId: socket.id,
      tokenType,
      result,
      gameState: game.getState()
    });
  });

  // Place auction bid
  socket.on('placeBid', ({ amount }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.placeBid(socket.id, amount);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('bidPlaced', {
      playerId: socket.id,
      amount,
      gameState: game.getState()
    });
  });

  // Pass on auction
  socket.on('passAuction', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.passAuction(socket.id);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('playerPassed', {
      playerId: socket.id,
      gameState: game.getState()
    });
    
    if (result.auctionComplete) {
      io.to(roomCode).emit('auctionComplete', {
        winner: result.winner,
        property: result.property,
        price: result.price,
        gameState: game.getState()
      });
      
      // End turn after auction
      setTimeout(() => {
        endTurn(roomCode, game);
      }, 1500);
    }
  });

  // Build house/hotel
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
      gameState: game.getState()
    });
  });

  // End turn manually
  socket.on('endTurn', () => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    if (game.getCurrentPlayer().id !== socket.id) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    endTurn(roomCode, game);
  });

  // Trade offer
  socket.on('proposeTrade', ({ targetPlayerId, offer }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    io.to(targetPlayerId).emit('tradeProposed', {
      fromPlayerId: socket.id,
      offer,
      gameState: game.getState()
    });
  });

  // Accept trade
  socket.on('acceptTrade', ({ fromPlayerId, offer }) => {
    const roomCode = playerToGame.get(socket.id);
    const game = games.get(roomCode);
    
    if (!game) return;
    
    const result = game.executeTrade(fromPlayerId, socket.id, offer);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('tradeCompleted', {
      player1: fromPlayerId,
      player2: socket.id,
      offer,
      gameState: game.getState()
    });
  });

  // Decline trade
  socket.on('declineTrade', ({ fromPlayerId }) => {
    io.to(fromPlayerId).emit('tradeDeclined', { byPlayerId: socket.id });
  });

  // Chat message
  socket.on('chatMessage', ({ message }) => {
    const roomCode = playerToGame.get(socket.id);
    if (!roomCode) return;
    
    const game = games.get(roomCode);
    const player = game?.players.find(p => p.id === socket.id);
    
    io.to(roomCode).emit('chatMessage', {
      playerId: socket.id,
      playerName: player?.name || 'Unknown',
      message,
      timestamp: Date.now()
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    // Remove from matchmaking queue if in one
    const tier = playerToQueue.get(socket.id);
    if (tier !== undefined) {
      const queue = matchmakingQueues.get(tier);
      if (queue) {
        const idx = queue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
        
        // Notify remaining players
        queue.forEach(p => {
          const otherSocket = io.sockets.sockets.get(p.socketId);
          if (otherSocket) {
            otherSocket.emit('matchmakingUpdate', { playersInQueue: queue.length });
          }
        });
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
        
        // Check if game should end
        const activePlayers = game.players.filter(p => !p.bankrupt);
        if (activePlayers.length <= 1 && game.hasStarted) {
          io.to(roomCode).emit('gameOver', {
            winner: activePlayers[0],
            gameState: game.getState()
          });
        }
        
        // Clean up empty rooms
        if (game.players.length === 0) {
          games.delete(roomCode);
        }
      }
    }
    
    console.log(`Player disconnected: ${socket.id}`);
  });
});

function handleLanding(roomCode, playerId, game) {
  const player = game.players.find(p => p.id === playerId);
  const space = game.board[player.position];
  
  if (space.type === 'property') {
    if (!space.owner) {
      // Start auction
      game.startAuction(player.position);
      io.to(roomCode).emit('auctionStarted', {
        property: space,
        propertyIndex: player.position,
        gameState: game.getState()
      });
    } else if (space.owner !== playerId && !space.mortgaged) {
      // Pay rent
      const rent = game.calculateRent(player.position);
      const result = game.payRent(playerId, space.owner, rent);
      
      io.to(roomCode).emit('rentPaid', {
        fromPlayer: playerId,
        toPlayer: space.owner,
        amount: rent,
        gameState: game.getState()
      });
      
      if (result.bankrupt) {
        io.to(roomCode).emit('playerBankrupt', {
          playerId,
          gameState: game.getState()
        });
        
        // Check for winner
        const activePlayers = game.players.filter(p => !p.bankrupt);
        if (activePlayers.length === 1) {
          io.to(roomCode).emit('gameOver', {
            winner: activePlayers[0],
            gameState: game.getState()
          });
          return;
        }
      }
      
      // Auto end turn after rent
      setTimeout(() => endTurn(roomCode, game), 1000);
    } else {
      // Own property, can build or end turn
      io.to(roomCode).emit('awaitingAction', {
        playerId,
        canBuild: game.canBuild(playerId),
        gameState: game.getState()
      });
    }
  } else if (space.type === 'tax') {
    const result = game.payTax(playerId, space.amount);
    
    io.to(roomCode).emit('taxPaid', {
      playerId,
      amount: space.amount,
      gameState: game.getState()
    });
    
    if (result.bankrupt) {
      io.to(roomCode).emit('playerBankrupt', { playerId, gameState: game.getState() });
    }
    
    setTimeout(() => endTurn(roomCode, game), 1000);
  } else if (space.type === 'goto-jail') {
    game.sendToJail(playerId);
    io.to(roomCode).emit('sentToJail', { playerId, gameState: game.getState() });
    setTimeout(() => endTurn(roomCode, game), 1000);
  } else {
    // Free parking, go, etc.
    io.to(roomCode).emit('awaitingAction', {
      playerId,
      canBuild: game.canBuild(playerId),
      gameState: game.getState()
    });
  }
}

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

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎲 Skill Monopoly server running on port ${PORT}`);
});
