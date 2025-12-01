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

// Game engine instance
const engine = new LuckyStreetsEngine();

// Track socket to room
const playerRooms = new Map();

// Turn timers
const turnTimers = new Map();

// 10 SECOND TURN TIMER
const TURN_TIME = 10;

function startTurnTimer(roomCode, playerId) {
  // Clear any existing timer
  clearTurnTimer(roomCode);
  
  const room = engine.getRoom(roomCode);
  if (!room || room.state !== 'playing') return;
  
  let timeLeft = TURN_TIME;
  
  // Broadcast initial time
  io.to(roomCode).emit('turnTimerUpdate', { timeLeft });
  
  const interval = setInterval(() => {
    timeLeft--;
    io.to(roomCode).emit('turnTimerUpdate', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      turnTimers.delete(roomCode);
      
      // TIMEOUT! Apply penalty and skip turn
      const result = engine.handleTurnTimeout(roomCode);
      if (result) {
        io.to(roomCode).emit('turnTimeout', {
          player: result.player,
          penalty: result.penalty,
          message: `⏰ ${result.player} took too long! -$${result.penalty}!`
        });
        
        if (result.room.state === 'finished') {
          io.to(roomCode).emit('gameOver', {
            winner: result.room.winner,
            pot: result.room.pot,
            message: `🏆 ${result.room.winner.name} wins!`
          });
        } else {
          io.to(roomCode).emit('turnStart', {
            currentPlayer: result.nextPlayer,
            gameState: engine.getGameState(roomCode)
          });
          startTurnTimer(roomCode, result.nextPlayer.id);
        }
      }
    }
  }, 1000);
  
  turnTimers.set(roomCode, interval);
}

function clearTurnTimer(roomCode) {
  const timer = turnTimers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    turnTimers.delete(roomCode);
  }
}

io.on('connection', (socket) => {
  console.log(`🎰 Player connected: ${socket.id}`);

  // CREATE ROOM
  socket.on('createRoom', ({ playerName, buyIn }) => {
    const room = engine.createRoom(socket.id, playerName, { buyIn: buyIn || 10 });
    
    playerRooms.set(socket.id, room.code);
    socket.join(room.code);
    
    socket.emit('roomCreated', { 
      roomCode: room.code, 
      player: room.players[0],
      gameState: engine.getGameState(room.code)
    });
    
    console.log(`📍 Room ${room.code} created by ${playerName}`);
  });

  // JOIN ROOM
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const result = engine.joinRoom(roomCode, socket.id, playerName);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    playerRooms.set(socket.id, roomCode.toUpperCase());
    socket.join(roomCode.toUpperCase());
    
    const gameState = engine.getGameState(roomCode);
    const player = result.room.players.find(p => p.id === socket.id);
    
    // Send to joining player
    socket.emit('roomJoined', { 
      roomCode: roomCode.toUpperCase(), 
      player,
      gameState
    });
    
    // Notify others
    socket.to(roomCode.toUpperCase()).emit('playerJoined', { 
      player,
      gameState
    });
    
    console.log(`👤 ${playerName} joined room ${roomCode.toUpperCase()}`);
  });

  // START GAME
  socket.on('startGame', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    const result = engine.startGame(roomCode, socket.id);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('gameStarted', { 
      gameState: engine.getGameState(roomCode)
    });
    
    io.to(roomCode).emit('turnStart', {
      currentPlayer: result.firstPlayer,
      gameState: engine.getGameState(roomCode)
    });
    
    // Start 10-second turn timer!
    startTurnTimer(roomCode, result.firstPlayer.id);
    
    console.log(`🎮 Game started in room ${roomCode}`);
  });

  // ROLL DICE (player hit the button in time!)
  socket.on('rollDice', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    // Stop turn timer - they made it in time!
    clearTurnTimer(roomCode);
    
    const result = engine.rollDice(roomCode, socket.id);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    io.to(roomCode).emit('diceRolled', {
      playerId: socket.id,
      dice: result.dice,
      total: result.total,
      newPosition: result.newPosition,
      passedGo: result.passedGo,
      space: result.space,
      gameState: engine.getGameState(roomCode)
    });
    
    // Wait for movement animation, then handle landing
    setTimeout(() => {
      const landingResult = engine.handleLanding(roomCode, socket.id);
      
      if (landingResult.success) {
        // Emit landing result
        io.to(roomCode).emit('landingResult', {
          playerId: socket.id,
          space: landingResult.space,
          message: landingResult.message,
          actions: landingResult.actions,
          gameState: engine.getGameState(roomCode)
        });
        
        // If it's a spin zone, trigger the wheel
        if (landingResult.space.type === 'spin') {
          io.to(roomCode).emit('triggerSpin', {
            playerId: socket.id,
            wheelOutcome: landingResult.wheelOutcome,
            needsChoice: landingResult.needsChoice,
            choices: landingResult.choices
          });
          
          // Wait for spin animation
          setTimeout(() => {
            if (landingResult.needsChoice) {
              // Wait for player choice
              socket.emit('makeChoice', {
                outcome: landingResult.wheelOutcome,
                choices: landingResult.choices
              });
            } else {
              // Process non-choice outcome
              processWheelOutcome(roomCode, socket.id, landingResult.wheelOutcome);
            }
          }, 3500);
        } else {
          // Not a spin zone - just end turn after a bit
          setTimeout(() => {
            endTurn(roomCode);
          }, 2000);
        }
      }
    }, 1500);
  });

  // PLAYER MAKES A SKILL-BASED CHOICE
  socket.on('makeWheelChoice', ({ choiceIndex }) => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    const room = engine.getRoom(roomCode);
    const player = room?.players.find(p => p.id === socket.id);
    
    if (!player?.pendingChoice) {
      socket.emit('error', { message: 'No pending choice' });
      return;
    }
    
    const result = engine.handleWheelChoice(roomCode, socket.id, choiceIndex);
    
    if (result.success) {
      io.to(roomCode).emit('choiceResult', {
        playerId: socket.id,
        message: result.message,
        value: result.value,
        gameState: engine.getGameState(roomCode)
      });
      
      if (result.eliminated) {
        handleElimination(roomCode, socket.id);
      } else {
        setTimeout(() => endTurn(roomCode), 2000);
      }
    }
  });

  // TELEPORT CHOICE
  socket.on('chooseTeleport', ({ targetSpace }) => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    const result = engine.handleTeleport(roomCode, socket.id, targetSpace);
    
    if (result.success) {
      io.to(roomCode).emit('teleportComplete', {
        playerId: socket.id,
        message: result.message,
        gameState: engine.getGameState(roomCode)
      });
      
      setTimeout(() => endTurn(roomCode), 1500);
    }
  });

  // FREEZE CHOICE
  socket.on('chooseFreeze', ({ targetId }) => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    const result = engine.handleFreeze(roomCode, socket.id, targetId);
    
    if (result.success) {
      io.to(roomCode).emit('freezeComplete', {
        playerId: socket.id,
        message: result.message,
        gameState: engine.getGameState(roomCode)
      });
      
      setTimeout(() => endTurn(roomCode), 1500);
    }
  });

  // END TURN
  socket.on('endTurn', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;
    
    const result = engine.endTurn(roomCode, socket.id);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    if (result.gameOver) {
      clearTurnTimer(roomCode);
      io.to(roomCode).emit('gameOver', {
        winner: result.winner,
        message: `🏆 ${result.winner.name} wins with $${result.winner.cash}!`
      });
    } else {
      io.to(roomCode).emit('turnStart', {
        currentPlayer: result.nextPlayer,
        gameState: engine.getGameState(roomCode)
      });
      
      // Start next player's timer
      startTurnTimer(roomCode, result.nextPlayer.id);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const roomCode = playerRooms.get(socket.id);
    if (roomCode) {
      const room = engine.getRoom(roomCode);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.connected = false;
          
          io.to(roomCode).emit('playerDisconnected', {
            playerId: socket.id,
            playerName: player.name,
            gameState: engine.getGameState(roomCode)
          });
          
          // If it was their turn, skip it
          if (room.state === 'playing' && room.players[room.currentPlayerIndex]?.id === socket.id) {
            endTurn(roomCode);
          }
        }
      }
      playerRooms.delete(socket.id);
    }
    
    console.log(`👋 Player disconnected: ${socket.id}`);
  });
});

// Helper: Process wheel outcome
function processWheelOutcome(roomCode, playerId, outcome) {
  const result = engine.processWheelOutcome(roomCode, playerId, outcome);
  
  if (result.success) {
    io.to(roomCode).emit('wheelResult', {
      playerId,
      outcome,
      message: result.message,
      value: result.value,
      gameState: engine.getGameState(roomCode)
    });
    
    if (result.needsTeleport) {
      io.to(playerId).emit('chooseTeleportSpace', {
        spaces: LuckyStreetsEngine.BOARD_SPACES
      });
    } else if (result.needsFreeze) {
      const room = engine.getRoom(roomCode);
      const others = room.players.filter(p => p.id !== playerId);
      io.to(playerId).emit('chooseFreezeTarget', { players: others });
    } else if (result.eliminated) {
      handleElimination(roomCode, playerId);
    } else {
      setTimeout(() => endTurn(roomCode), 2000);
    }
  }
}

// Helper: Handle elimination
function handleElimination(roomCode, playerId) {
  const room = engine.getRoom(roomCode);
  const player = room?.players.find(p => p.id === playerId);
  
  if (player) {
    io.to(roomCode).emit('playerEliminated', {
      playerId,
      playerName: player.name,
      message: `💀 ${player.name} is BROKE and eliminated!`
    });
    
    // Check for game over
    if (room.state === 'finished') {
      clearTurnTimer(roomCode);
      io.to(roomCode).emit('gameOver', {
        winner: room.winner,
        message: `🏆 ${room.winner.name} wins with $${room.winner.cash}!`
      });
    } else {
      setTimeout(() => endTurn(roomCode), 2000);
    }
  }
}

// Helper: End turn
function endTurn(roomCode) {
  clearTurnTimer(roomCode);
  
  const room = engine.getRoom(roomCode);
  if (!room || room.state !== 'playing') return;
  
  const currentPlayer = room.players[room.currentPlayerIndex];
  const result = engine.endTurn(roomCode, currentPlayer.id);
  
  if (!result.success) return;
  
  if (result.gameOver) {
    io.to(roomCode).emit('gameOver', {
      winner: result.winner,
      message: `🏆 ${result.winner.name} wins with $${result.winner.cash}!`
    });
  } else {
    io.to(roomCode).emit('turnStart', {
      currentPlayer: result.nextPlayer,
      gameState: engine.getGameState(roomCode)
    });
    
    startTurnTimer(roomCode, result.nextPlayer.id);
  }
}

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎰 LUCKY STREETS server running on port ${PORT}`);
  console.log(`⏱️ Turn timer: ${TURN_TIME} seconds`);
});
