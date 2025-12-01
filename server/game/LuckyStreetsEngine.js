// LuckyStreetsEngine.js - 30 CRAZY WHEEL OUTCOMES + 10-SECOND TURN TIMER

class LuckyStreetsEngine {
  constructor() {
    this.rooms = new Map();
  }

  // 30 CRAZY WHEEL OUTCOMES - Some with skill-based choices!
  static WHEEL_OUTCOMES = [
    // MONEY MAKERS (8)
    { id: 'JACKPOT', label: '🎰 JACKPOT', color: '#FFD700', description: 'WIN 50% OF THE POT!', type: 'instant' },
    { id: 'TRIPLE', label: '3️⃣ TRIPLE', color: '#00FF00', description: 'Triple the rent you pay/receive!', type: 'multiplier', value: 3 },
    { id: 'DOUBLE', label: '2️⃣ DOUBLE', color: '#32CD32', description: 'Double the rent!', type: 'multiplier', value: 2 },
    { id: 'PAYDAY', label: '💵 PAYDAY', color: '#00CED1', description: 'Collect $5 from the pot!', type: 'instant', value: 5 },
    { id: 'BONUS', label: '🎁 BONUS', color: '#9370DB', description: 'Get $3 free!', type: 'instant', value: 3 },
    { id: 'LUCKY7', label: '7️⃣ LUCKY 7', color: '#FF6347', description: 'Move to space 7 and collect $7!', type: 'teleport', space: 7, bonus: 7 },
    { id: 'CASHBACK', label: '💸 CASHBACK', color: '#20B2AA', description: 'Get back last rent you paid!', type: 'cashback' },
    { id: 'INVESTOR', label: '📈 INVESTOR', color: '#4682B4', description: 'Your properties pay 2X this round!', type: 'buff', duration: 1 },
    
    // MONEY LOSERS (6)
    { id: 'TAX', label: '🏛️ TAX', color: '#8B0000', description: 'Pay $3 to the pot!', type: 'pay', value: 3 },
    { id: 'BROKE', label: '😭 BROKE', color: '#B22222', description: 'Lose half your cash!', type: 'losehalf' },
    { id: 'FINE', label: '👮 FINE', color: '#DC143C', description: 'Pay $2 fine!', type: 'pay', value: 2 },
    { id: 'ROBBED', label: '🦹 ROBBED', color: '#800000', description: 'Lose $4!', type: 'pay', value: 4 },
    { id: 'CRASH', label: '📉 CRASH', color: '#A52A2A', description: 'Your properties worth nothing this round!', type: 'debuff', duration: 1 },
    { id: 'OOPS', label: '🙈 OOPS', color: '#CD5C5C', description: 'Pay $1 to each player!', type: 'payall', value: 1 },
    
    // SKILL-BASED CHOICES (8) - THE FUN ONES!
    { id: 'GAMBLE', label: '🎲 GAMBLE', color: '#FF1493', description: 'CHOICE: Risk your cash - Double or Lose it all!', type: 'choice', choices: ['RISK IT', 'PLAY SAFE'] },
    { id: 'DUEL', label: '⚔️ DUEL', color: '#FF4500', description: 'CHOICE: Challenge someone to a dice duel!', type: 'choice', choices: ['DUEL!', 'PASS'] },
    { id: 'STEAL', label: '🦝 STEAL', color: '#8A2BE2', description: 'CHOICE: Try to steal $5 - 50% chance to pay $5 instead!', type: 'choice', choices: ['STEAL!', 'DONT RISK'] },
    { id: 'SABOTAGE', label: '💣 SABOTAGE', color: '#FF6600', description: 'CHOICE: Pay $2 to remove an opponent property!', type: 'choice', choices: ['SABOTAGE', 'PASS'] },
    { id: 'INSURANCE', label: '🛡️ INSURANCE', color: '#1E90FF', description: 'CHOICE: Pay $3 now to block next bad outcome!', type: 'choice', choices: ['BUY INSURANCE', 'SKIP'] },
    { id: 'AUCTION', label: '🔨 AUCTION', color: '#DAA520', description: 'CHOICE: Auction a random property - you set the price!', type: 'choice', choices: ['AUCTION', 'KEEP'] },
    { id: 'ALLIN', label: '🃏 ALL IN', color: '#9400D3', description: 'CHOICE: Go all-in! Win 3X your bet or lose it!', type: 'choice', choices: ['ALL IN!', 'FOLD'] },
    { id: 'SWITCH', label: '🔄 SWITCH', color: '#00BFFF', description: 'CHOICE: Swap positions with any player!', type: 'choice', choices: ['SWAP', 'STAY'] },
    
    // CHAOS EVENTS (8)
    { id: 'SHUFFLE', label: '🔀 SHUFFLE', color: '#FF69B4', description: 'Everyone moves to random spaces!', type: 'chaos' },
    { id: 'REVERSE', label: '↩️ REVERSE', color: '#00FA9A', description: 'Turn order reverses!', type: 'reverse' },
    { id: 'FREERENT', label: '🏠 FREE RENT', color: '#98FB98', description: 'No rent paid this landing!', type: 'freerent' },
    { id: 'TELEPORT', label: '✨ TELEPORT', color: '#BA55D3', description: 'Teleport anywhere you want!', type: 'teleport_choice' },
    { id: 'EARTHQUAKE', label: '🌋 EARTHQUAKE', color: '#FF8C00', description: 'All properties lose one owner!', type: 'chaos' },
    { id: 'LOTTERY', label: '🎟️ LOTTERY', color: '#FFD700', description: 'Random player wins $10 from pot!', type: 'lottery', value: 10 },
    { id: 'FREEZE', label: '❄️ FREEZE', color: '#ADD8E6', description: 'Pick a player to skip their next turn!', type: 'freeze' },
    { id: 'MYSTERY', label: '❓ MYSTERY', color: '#9932CC', description: 'Something random happens...', type: 'mystery' }
  ];

  // 30 SPACES - BIGGER COOLER BOARD!
  static BOARD_SPACES = [
    { id: 0, name: 'GO!', type: 'go', rent: 0, emoji: '🚀' },
    { id: 1, name: 'Crypto Corner', type: 'property', rent: 2, color: '#9C27B0', emoji: '₿' },
    { id: 2, name: 'Spin Zone', type: 'spin', rent: 0, emoji: '🎡' },
    { id: 3, name: 'Meme Street', type: 'property', rent: 2, color: '#E91E63', emoji: '🐸' },
    { id: 4, name: 'Diamond District', type: 'property', rent: 3, color: '#3F51B5', emoji: '💎' },
    { id: 5, name: 'Lucky Lane', type: 'lucky', rent: 0, emoji: '🍀' },
    { id: 6, name: 'Rocket Road', type: 'property', rent: 3, color: '#2196F3', emoji: '🚀' },
    { id: 7, name: 'Jackpot Junction', type: 'jackpot', rent: 0, emoji: '🎰' },
    { id: 8, name: 'Moon Base', type: 'property', rent: 4, color: '#00BCD4', emoji: '🌙' },
    { id: 9, name: 'Spin Zone', type: 'spin', rent: 0, emoji: '🎡' },
    { id: 10, name: 'NFT Avenue', type: 'property', rent: 4, color: '#009688', emoji: '🖼️' },
    { id: 11, name: 'YOLO Square', type: 'property', rent: 5, color: '#4CAF50', emoji: '🎲' },
    { id: 12, name: 'Free Parking', type: 'free', rent: 0, emoji: '🅿️' },
    { id: 13, name: 'Degen Den', type: 'property', rent: 5, color: '#8BC34A', emoji: '🎰' },
    { id: 14, name: 'Whale Way', type: 'property', rent: 6, color: '#CDDC39', emoji: '🐋' },
    { id: 15, name: 'Spin Zone', type: 'spin', rent: 0, emoji: '🎡' },
    { id: 16, name: 'Lambo Lane', type: 'property', rent: 6, color: '#FFC107', emoji: '🏎️' },
    { id: 17, name: 'Chaos Corner', type: 'chaos', rent: 0, emoji: '💥' },
    { id: 18, name: 'Penthouse Peak', type: 'property', rent: 7, color: '#FF9800', emoji: '🏰' },
    { id: 19, name: 'Ape Alley', type: 'property', rent: 7, color: '#FF5722', emoji: '🦍' },
    { id: 20, name: 'Spin Zone', type: 'spin', rent: 0, emoji: '🎡' },
    { id: 21, name: 'Billionaire Blvd', type: 'property', rent: 8, color: '#795548', emoji: '💰' },
    { id: 22, name: 'Tax Office', type: 'tax', rent: 0, emoji: '🏛️' },
    { id: 23, name: 'Gold Coast', type: 'property', rent: 8, color: '#FFD700', emoji: '🏆' },
    { id: 24, name: 'Spin Zone', type: 'spin', rent: 0, emoji: '🎡' },
    { id: 25, name: 'Castle Keep', type: 'property', rent: 9, color: '#607D8B', emoji: '🏯' },
    { id: 26, name: 'Lucky Lane', type: 'lucky', rent: 0, emoji: '🍀' },
    { id: 27, name: 'Mega Mall', type: 'property', rent: 9, color: '#E91E63', emoji: '🏬' },
    { id: 28, name: 'Dragon Lair', type: 'property', rent: 10, color: '#F44336', emoji: '🐉' },
    { id: 29, name: 'THE THRONE', type: 'property', rent: 12, color: '#9C27B0', emoji: '👑' }
  ];

  createRoom(hostId, hostName, settings = {}) {
    const roomCode = this.generateRoomCode();
    const room = {
      code: roomCode,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        cash: 0,
        position: 0,
        properties: [],
        isHost: true,
        connected: true,
        hasInsurance: false,
        isInvestor: false,
        isFrozen: false,
        lastRentPaid: 0
      }],
      settings: {
        buyIn: settings.buyIn || 10,
        maxPlayers: settings.maxPlayers || 4,
        gameLength: settings.gameLength || 5,
        turnTimer: 10 // 10 SECOND TURN TIMER!
      },
      state: 'waiting',
      pot: 0,
      currentPlayerIndex: 0,
      turnStartTime: null,
      turnTimerId: null,
      roundNumber: 1,
      maxRounds: 20,
      reversed: false,
      createdAt: Date.now()
    };
    this.rooms.set(roomCode, room);
    return room;
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  joinRoom(roomCode, playerId, playerName) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (room.state !== 'waiting') return { success: false, error: 'Game already started' };
    if (room.players.length >= room.settings.maxPlayers) return { success: false, error: 'Room is full' };
    
    // Check if already in room
    const existing = room.players.find(p => p.id === playerId);
    if (existing) {
      existing.connected = true;
      return { success: true, room, rejoined: true };
    }

    room.players.push({
      id: playerId,
      name: playerName,
      cash: 0,
      position: 0,
      properties: [],
      isHost: false,
      connected: true,
      hasInsurance: false,
      isInvestor: false,
      isFrozen: false,
      lastRentPaid: 0
    });

    return { success: true, room };
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode.toUpperCase());
  }

  startGame(roomCode, hostId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== hostId) return { success: false, error: 'Only host can start' };
    if (room.players.length < 2) return { success: false, error: 'Need at least 2 players' };

    // Collect buy-ins
    room.players.forEach(p => {
      p.cash = room.settings.buyIn;
      room.pot += room.settings.buyIn;
    });
    
    room.state = 'playing';
    room.currentPlayerIndex = 0;
    room.turnStartTime = Date.now();
    
    return { 
      success: true, 
      room,
      firstPlayer: room.players[0]
    };
  }

  // Called when turn timer expires!
  handleTurnTimeout(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.state !== 'playing') return null;
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    
    // PENALTY: Lose $1 and skip turn!
    const penalty = Math.min(1, currentPlayer.cash);
    currentPlayer.cash -= penalty;
    room.pot += penalty;
    
    // Check if player is broke
    if (currentPlayer.cash <= 0) {
      return this.eliminatePlayer(room, currentPlayer);
    }
    
    // Move to next player
    this.advanceTurn(room);
    
    return {
      type: 'timeout',
      player: currentPlayer.name,
      penalty: penalty,
      room: room,
      nextPlayer: room.players[room.currentPlayerIndex]
    };
  }

  advanceTurn(room) {
    const direction = room.reversed ? -1 : 1;
    room.currentPlayerIndex = (room.currentPlayerIndex + direction + room.players.length) % room.players.length;
    
    // Skip frozen players
    let attempts = 0;
    while (room.players[room.currentPlayerIndex].isFrozen && attempts < room.players.length) {
      room.players[room.currentPlayerIndex].isFrozen = false; // Unfreeze after skip
      room.currentPlayerIndex = (room.currentPlayerIndex + direction + room.players.length) % room.players.length;
      attempts++;
    }
    
    // Clear investor/crash buffs from previous turn
    room.players.forEach(p => {
      p.isInvestor = false;
      p.isCrashed = false;
    });
    
    room.turnStartTime = Date.now();
    
    // Check round advancement
    if (room.currentPlayerIndex === 0) {
      room.roundNumber++;
      if (room.roundNumber > room.maxRounds) {
        room.state = 'finished';
      }
    }
  }

  rollDice(roomCode, playerId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.state !== 'playing') return { success: false, error: 'Game not active' };
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (currentPlayer.isFrozen) return { success: false, error: 'You are frozen!' };

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    const oldPosition = currentPlayer.position;
    currentPlayer.position = (currentPlayer.position + total) % LuckyStreetsEngine.BOARD_SPACES.length;

    // Check if passed GO
    const passedGo = currentPlayer.position < oldPosition;
    if (passedGo) {
      currentPlayer.cash += 2;
    }

    return {
      success: true,
      dice: [dice1, dice2],
      total,
      newPosition: currentPlayer.position,
      passedGo,
      space: LuckyStreetsEngine.BOARD_SPACES[currentPlayer.position]
    };
  }

  handleLanding(roomCode, playerId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };
    
    const space = LuckyStreetsEngine.BOARD_SPACES[player.position];
    let result = { space, actions: [], message: '' };

    switch (space.type) {
      case 'property':
        result = this.handleProperty(room, player, space);
        break;
      case 'spin':
        result = this.spinWheel(room, player);
        break;
      case 'go':
        result = { space, message: '🚀 Passed GO! Collected $2!', actions: ['passedGo'] };
        break;
      case 'free':
        result = { space, message: '🅿️ Free Parking - Relax!', actions: [] };
        break;
      case 'jackpot':
        const jackpotWin = Math.floor(room.pot * 0.1);
        player.cash += jackpotWin;
        room.pot -= jackpotWin;
        result = { space, message: `🎰 JACKPOT JUNCTION! Won $${jackpotWin}!`, actions: ['jackpot'], value: jackpotWin };
        break;
      case 'lucky':
        player.cash += 3;
        result = { space, message: '🍀 Lucky Lane! Free $3!', actions: ['lucky'], value: 3 };
        break;
      case 'chaos':
        result = this.handleChaos(room, player);
        break;
      case 'tax':
        const tax = 2;
        player.cash -= tax;
        room.pot += tax;
        result = { space, message: '🏛️ Tax Office! Paid $2!', actions: ['tax'], value: tax };
        break;
      default:
        result = { space, message: `Landed on ${space.name}`, actions: [] };
    }

    return { success: true, ...result };
  }

  handleProperty(room, player, space) {
    const owner = room.players.find(p => p.properties.includes(space.id));
    
    if (!owner) {
      // Unowned - auto buy for now
      player.properties.push(space.id);
      return {
        space,
        message: `🏠 Claimed ${space.emoji} ${space.name}!`,
        actions: ['claimed'],
        property: space
      };
    }
    
    if (owner.id === player.id) {
      return {
        space,
        message: `🏠 Your property ${space.name}!`,
        actions: ['own']
      };
    }
    
    // Pay rent (affected by buffs)
    let rent = space.rent;
    
    // Owner has investor buff = 2X rent
    if (owner.isInvestor) rent *= 2;
    
    // Owner has crash debuff = 0 rent
    if (owner.isCrashed) rent = 0;
    
    // Player has insurance = no rent
    if (player.hasInsurance) {
      player.hasInsurance = false;
      return {
        space,
        message: `🛡️ Insurance saved you from $${space.rent} rent!`,
        actions: ['insurance']
      };
    }
    
    player.cash -= rent;
    owner.cash += rent;
    player.lastRentPaid = rent;
    
    return {
      space,
      message: `💸 Paid $${rent} rent to ${owner.name}!`,
      actions: ['rent'],
      rent: rent,
      owner: owner.name
    };
  }

  spinWheel(room, player) {
    const outcomes = LuckyStreetsEngine.WHEEL_OUTCOMES;
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      space: { name: 'Spin Zone', type: 'spin', emoji: '🎡' },
      message: `🎡 SPIN RESULT: ${outcome.label}`,
      actions: ['spin'],
      wheelOutcome: outcome,
      needsChoice: outcome.type === 'choice',
      choices: outcome.choices || null
    };
  }

  // Handle skill-based wheel choice
  handleWheelChoice(roomCode, playerId, choiceIndex) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Determine what happens based on the pending choice
    const outcome = player.pendingChoice;
    if (!outcome) return { success: false, error: 'No pending choice' };
    
    const risked = choiceIndex === 0; // First choice is always the risky one
    let result = { message: '', value: 0 };

    switch (outcome.id) {
      case 'GAMBLE':
        if (risked) {
          if (Math.random() < 0.5) {
            result.value = player.cash;
            player.cash *= 2;
            result.message = `🎲 DOUBLED UP! You now have $${player.cash}!`;
          } else {
            result.value = player.cash;
            player.cash = 0;
            result.message = '🎲 BUSTED! Lost it all!';
          }
        } else {
          result.message = '🎲 Played it safe...';
        }
        break;

      case 'DUEL':
        if (risked) {
          // Pick random opponent
          const opponents = room.players.filter(p => p.id !== player.id);
          const opponent = opponents[Math.floor(Math.random() * opponents.length)];
          const playerRoll = Math.floor(Math.random() * 6) + 1;
          const opponentRoll = Math.floor(Math.random() * 6) + 1;
          
          if (playerRoll > opponentRoll) {
            const winnings = 3;
            opponent.cash -= winnings;
            player.cash += winnings;
            result.message = `⚔️ DUEL WON! Beat ${opponent.name} (${playerRoll} vs ${opponentRoll})! Took $${winnings}!`;
          } else {
            const loss = 3;
            player.cash -= loss;
            opponent.cash += loss;
            result.message = `⚔️ DUEL LOST! ${opponent.name} won (${opponentRoll} vs ${playerRoll})! Lost $${loss}!`;
          }
        } else {
          result.message = '⚔️ Passed on the duel...';
        }
        break;

      case 'STEAL':
        if (risked) {
          if (Math.random() < 0.5) {
            player.cash += 5;
            result.message = '🦝 STEAL SUCCESS! Got $5!';
          } else {
            player.cash -= 5;
            room.pot += 5;
            result.message = '🦝 CAUGHT! Paid $5 fine!';
          }
        } else {
          result.message = '🦝 Too risky...';
        }
        break;

      case 'SABOTAGE':
        if (risked) {
          player.cash -= 2;
          room.pot += 2;
          // Remove random property from random opponent
          const opponents = room.players.filter(p => p.id !== player.id && p.properties.length > 0);
          if (opponents.length > 0) {
            const target = opponents[Math.floor(Math.random() * opponents.length)];
            const removedProp = target.properties.pop();
            const propName = LuckyStreetsEngine.BOARD_SPACES[removedProp].name;
            result.message = `💣 SABOTAGE! Removed ${propName} from ${target.name}!`;
          } else {
            result.message = '💣 No properties to sabotage!';
          }
        } else {
          result.message = '💣 Passed on sabotage...';
        }
        break;

      case 'INSURANCE':
        if (risked) {
          player.cash -= 3;
          room.pot += 3;
          player.hasInsurance = true;
          result.message = '🛡️ Insurance bought! Next rent is FREE!';
        } else {
          result.message = '🛡️ No insurance...';
        }
        break;

      case 'AUCTION':
        if (risked && player.properties.length > 0) {
          // Simple auction - sell property to highest AI bidder (pot)
          const propId = player.properties.pop();
          const propValue = LuckyStreetsEngine.BOARD_SPACES[propId].rent * 3;
          player.cash += propValue;
          result.message = `🔨 Sold property for $${propValue}!`;
        } else {
          result.message = '🔨 Kept properties...';
        }
        break;

      case 'ALLIN':
        if (risked) {
          const bet = player.cash;
          if (Math.random() < 0.33) { // 33% to win
            player.cash = bet * 3;
            result.message = `🃏 ALL IN WIN! $${bet} → $${player.cash}!`;
          } else {
            player.cash = 0;
            result.message = '🃏 ALL IN BUST! Lost everything!';
          }
        } else {
          result.message = '🃏 Folded...';
        }
        break;

      case 'SWITCH':
        if (risked) {
          // Swap with random opponent
          const opponents = room.players.filter(p => p.id !== player.id);
          const target = opponents[Math.floor(Math.random() * opponents.length)];
          const tempPos = player.position;
          player.position = target.position;
          target.position = tempPos;
          result.message = `🔄 Swapped positions with ${target.name}!`;
        } else {
          result.message = '🔄 Stayed put...';
        }
        break;
    }

    player.pendingChoice = null;
    
    // Check if broke
    if (player.cash <= 0) {
      result.eliminated = true;
    }

    return { success: true, ...result, room };
  }

  // Handle instant wheel outcomes (non-choice)
  processWheelOutcome(roomCode, playerId, outcome) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    let result = { message: '', value: 0, actions: [] };

    switch (outcome.type) {
      case 'instant':
        if (outcome.id === 'JACKPOT') {
          const winnings = Math.floor(room.pot * 0.5);
          player.cash += winnings;
          room.pot -= winnings;
          result.message = `🎰 JACKPOT! Won $${winnings} (50% of pot)!`;
          result.value = winnings;
        } else {
          player.cash += outcome.value;
          result.message = `${outcome.label}: Got $${outcome.value}!`;
          result.value = outcome.value;
        }
        break;

      case 'multiplier':
        player.rentMultiplier = outcome.value;
        result.message = `${outcome.label}: Next rent is ${outcome.value}X!`;
        break;

      case 'pay':
        player.cash -= outcome.value;
        room.pot += outcome.value;
        result.message = `${outcome.label}: Paid $${outcome.value}!`;
        result.value = -outcome.value;
        break;

      case 'losehalf':
        const lost = Math.floor(player.cash / 2);
        player.cash -= lost;
        room.pot += lost;
        result.message = `😭 BROKE: Lost $${lost}!`;
        result.value = -lost;
        break;

      case 'payall':
        const otherPlayers = room.players.filter(p => p.id !== player.id);
        const totalPay = outcome.value * otherPlayers.length;
        player.cash -= totalPay;
        otherPlayers.forEach(p => p.cash += outcome.value);
        result.message = `🙈 OOPS: Paid $${outcome.value} to each player!`;
        result.value = -totalPay;
        break;

      case 'buff':
        player.isInvestor = true;
        result.message = '📈 INVESTOR: Your properties pay 2X this round!';
        break;

      case 'debuff':
        player.isCrashed = true;
        result.message = '📉 CRASH: Your properties pay nothing this round!';
        break;

      case 'cashback':
        const cashback = player.lastRentPaid || 0;
        player.cash += cashback;
        result.message = `💸 CASHBACK: Got $${cashback} back!`;
        result.value = cashback;
        break;

      case 'teleport':
        player.position = outcome.space;
        player.cash += outcome.bonus || 0;
        result.message = `${outcome.label}: Moved to space ${outcome.space}! +$${outcome.bonus}!`;
        break;

      case 'teleport_choice':
        result.needsTeleport = true;
        result.message = '✨ TELEPORT: Choose where to go!';
        break;

      case 'reverse':
        room.reversed = !room.reversed;
        result.message = '↩️ REVERSE: Turn order reversed!';
        break;

      case 'freerent':
        player.freeRent = true;
        result.message = '🏠 FREE RENT: No rent on this landing!';
        break;

      case 'chaos':
        result = this.handleChaos(room, player);
        break;

      case 'lottery':
        const winner = room.players[Math.floor(Math.random() * room.players.length)];
        const prize = Math.min(outcome.value, room.pot);
        winner.cash += prize;
        room.pot -= prize;
        result.message = `🎟️ LOTTERY: ${winner.name} won $${prize}!`;
        result.value = winner.id === player.id ? prize : 0;
        break;

      case 'freeze':
        result.needsFreeze = true;
        result.message = '❄️ FREEZE: Pick someone to skip their turn!';
        break;

      case 'mystery':
        result = this.handleMystery(room, player);
        break;

      case 'choice':
        player.pendingChoice = outcome;
        result.needsChoice = true;
        result.choices = outcome.choices;
        result.message = outcome.description;
        break;
    }

    // Check if player is broke
    if (player.cash <= 0) {
      result.eliminated = true;
    }

    return { success: true, ...result, room };
  }

  handleChaos(room, player) {
    const chaosEvents = [
      () => {
        // Shuffle all positions
        room.players.forEach(p => {
          p.position = Math.floor(Math.random() * LuckyStreetsEngine.BOARD_SPACES.length);
        });
        return '🔀 CHAOS: Everyone shuffled to random positions!';
      },
      () => {
        // Earthquake - remove one random property from each player
        room.players.forEach(p => {
          if (p.properties.length > 0) {
            p.properties.pop();
          }
        });
        return '🌋 EARTHQUAKE: All players lost a property!';
      },
      () => {
        // Money rain - everyone gets $2
        room.players.forEach(p => {
          p.cash += 2;
        });
        return '💰 MONEY RAIN: Everyone got $2!';
      }
    ];
    
    const event = chaosEvents[Math.floor(Math.random() * chaosEvents.length)];
    return { message: event(), actions: ['chaos'] };
  }

  handleMystery(room, player) {
    const mysteryEvents = [
      () => { player.cash += 5; return '❓ Mystery gift: $5!'; },
      () => { player.cash -= 3; room.pot += 3; return '❓ Mystery tax: -$3!'; },
      () => { player.position = 0; return '❓ Teleported to GO!'; },
      () => { 
        const opponents = room.players.filter(p => p.id !== player.id);
        if (opponents.length > 0) {
          const target = opponents[Math.floor(Math.random() * opponents.length)];
          target.cash -= 2;
          player.cash += 2;
          return `❓ Stole $2 from ${target.name}!`;
        }
        return '❓ Nothing happened...';
      },
      () => { player.hasInsurance = true; return '❓ Free insurance!'; }
    ];
    
    const event = mysteryEvents[Math.floor(Math.random() * mysteryEvents.length)];
    return { message: event(), actions: ['mystery'] };
  }

  handleFreeze(roomCode, playerId, targetId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const target = room.players.find(p => p.id === targetId);
    if (!target) return { success: false, error: 'Target not found' };
    
    target.isFrozen = true;
    return { 
      success: true, 
      message: `❄️ ${target.name} is frozen and will skip their next turn!`,
      room 
    };
  }

  handleTeleport(roomCode, playerId, targetSpace) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };
    
    if (targetSpace < 0 || targetSpace >= LuckyStreetsEngine.BOARD_SPACES.length) {
      return { success: false, error: 'Invalid space' };
    }
    
    player.position = targetSpace;
    const space = LuckyStreetsEngine.BOARD_SPACES[targetSpace];
    
    return { 
      success: true, 
      message: `✨ Teleported to ${space.emoji} ${space.name}!`,
      room 
    };
  }

  eliminatePlayer(room, player) {
    // Give remaining cash to pot
    if (player.cash > 0) {
      room.pot += player.cash;
      player.cash = 0;
    }
    
    // Remove from active players
    room.players = room.players.filter(p => p.id !== player.id);
    
    // Check for winner
    if (room.players.length === 1) {
      room.state = 'finished';
      room.winner = room.players[0];
      room.winner.cash += room.pot;
      room.pot = 0;
    } else {
      // Fix current player index if needed
      if (room.currentPlayerIndex >= room.players.length) {
        room.currentPlayerIndex = 0;
      }
    }
    
    return {
      type: 'elimination',
      player: player.name,
      room: room,
      winner: room.state === 'finished' ? room.winner : null
    };
  }

  endTurn(roomCode, playerId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };

    this.advanceTurn(room);

    // Check for game end conditions
    if (room.state === 'finished' || room.roundNumber > room.maxRounds) {
      room.state = 'finished';
      // Winner is player with most cash
      room.winner = room.players.reduce((a, b) => a.cash > b.cash ? a : b);
      room.winner.cash += room.pot;
      room.pot = 0;
    }

    return { 
      success: true, 
      room,
      nextPlayer: room.players[room.currentPlayerIndex],
      gameOver: room.state === 'finished',
      winner: room.winner
    };
  }

  getGameState(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    
    return {
      ...room,
      currentPlayer: room.players[room.currentPlayerIndex],
      board: LuckyStreetsEngine.BOARD_SPACES,
      wheelOutcomes: LuckyStreetsEngine.WHEEL_OUTCOMES,
      turnTimeRemaining: room.turnStartTime ? 
        Math.max(0, room.settings.turnTimer - Math.floor((Date.now() - room.turnStartTime) / 1000)) : 
        room.settings.turnTimer
    };
  }
}

module.exports = LuckyStreetsEngine;
