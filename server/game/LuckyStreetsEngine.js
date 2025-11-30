// LUCKY STREETS - Fast, Fun Monopoly with Spin Wheels
// 5-minute games, every roll spins the wheel!

const WHEEL_OUTCOMES = [
  { id: '2x', label: '2X', color: '#22c55e', weight: 15, effect: 'double' },
  { id: '1x', label: '1X', color: '#3b82f6', weight: 35, effect: 'normal' },
  { id: 'free', label: 'FREE', color: '#eab308', weight: 15, effect: 'free' },
  { id: 'swap', label: 'SWAP', color: '#f97316', weight: 10, effect: 'swap' },
  { id: 'pay', label: 'PAY', color: '#ef4444', weight: 15, effect: 'pay' },
  { id: 'steal', label: 'STEAL', color: '#1f2937', weight: 10, effect: 'steal' },
];

const LUCKY_DROPS = [
  { id: 'cash', label: 'CASH DROP', icon: '💰', description: 'Get $5 free!' },
  { id: 'house', label: 'FREE HOUSE', icon: '🏠', description: 'Add a house to any property!' },
  { id: 'shield', label: 'SHIELD', icon: '🛡️', description: 'Next rent you owe = $0!' },
  { id: 'sniper', label: 'SNIPER', icon: '🎯', description: 'Steal $3 from any player!' },
];

// Simplified board - 24 spaces for faster games
const BOARD = [
  { name: 'GO', type: 'go', color: null },
  { name: 'Vine St', type: 'property', color: '#8B4513', price: 2, rent: 0.5 },
  { name: 'Luck', type: 'luck', color: null },
  { name: 'Oak Ave', type: 'property', color: '#8B4513', price: 2, rent: 0.5 },
  { name: 'Palm Rd', type: 'property', color: '#87CEEB', price: 3, rent: 0.75 },
  { name: 'Station', type: 'property', color: '#1f2937', price: 5, rent: 1, isStation: true },
  { name: 'Rose Ln', type: 'property', color: '#87CEEB', price: 3, rent: 0.75 },
  { name: 'Luck', type: 'luck', color: null },
  { name: 'Cedar Bl', type: 'property', color: '#EC4899', price: 4, rent: 1 },
  { name: 'Jail', type: 'jail', color: null },
  { name: 'Maple Dr', type: 'property', color: '#EC4899', price: 4, rent: 1 },
  { name: 'Electric', type: 'property', color: '#fbbf24', price: 4, rent: 1, isUtility: true },
  { name: 'Pine Way', type: 'property', color: '#F97316', price: 5, rent: 1.25 },
  { name: 'Luck', type: 'luck', color: null },
  { name: 'Beach St', type: 'property', color: '#F97316', price: 5, rent: 1.25 },
  { name: 'Station', type: 'property', color: '#1f2937', price: 5, rent: 1, isStation: true },
  { name: 'Sun Ave', type: 'property', color: '#EF4444', price: 6, rent: 1.5 },
  { name: 'Parking', type: 'free', color: null },
  { name: 'Moon Rd', type: 'property', color: '#EF4444', price: 6, rent: 1.5 },
  { name: 'Water', type: 'property', color: '#fbbf24', price: 4, rent: 1, isUtility: true },
  { name: 'Star Ln', type: 'property', color: '#22C55E', price: 7, rent: 1.75 },
  { name: 'Luck', type: 'luck', color: null },
  { name: 'Gold Bl', type: 'property', color: '#22C55E', price: 7, rent: 1.75 },
  { name: 'Diamond', type: 'property', color: '#3B82F6', price: 10, rent: 2.5 },
];

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

class LuckyStreetsEngine {
  constructor(roomCode, buyIn = 10) {
    this.roomCode = roomCode;
    this.buyIn = parseFloat(buyIn) || 10;
    this.players = [];
    this.board = JSON.parse(JSON.stringify(BOARD));
    this.currentPlayerIndex = 0;
    this.hasStarted = false;
    this.phase = 'lobby';
    
    // Lucky Streets specific
    this.gameLength = 5 * 60 * 1000; // 5 minutes
    this.timeRemaining = this.gameLength;
    this.startTime = null;
    this.luckyDropInterval = 60 * 1000; // Every 60 seconds
    this.lastLuckyDrop = 0;
    this.pendingLuckyDrop = null;
    
    // Current spin state
    this.currentSpin = null;
    
    // Pot
    this.totalPot = 0;
    this.priceMultiplier = 1;
  }

  addPlayer(socketId, name) {
    const startingMoney = this.buyIn;
    
    const player = {
      id: socketId,
      name: name || `Player ${this.players.length + 1}`,
      money: startingMoney,
      position: 0,
      properties: [],
      houses: {}, // propertyIndex -> house count
      streak: 0,
      shield: false, // Next rent = $0
      color: PLAYER_COLORS[this.players.length],
      bankrupt: false,
    };
    
    this.players.push(player);
    this.totalPot = this.players.length * this.buyIn;
    return player;
  }

  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.id === socketId);
    if (index !== -1) {
      const player = this.players[index];
      player.properties.forEach(propIndex => {
        this.board[propIndex].owner = null;
      });
      player.bankrupt = true;
    }
  }

  startGame() {
    this.hasStarted = true;
    this.phase = 'playing';
    this.startTime = Date.now();
    this.timeRemaining = this.gameLength;
    this.lastLuckyDrop = Date.now();
    
    this.totalPot = this.players.length * this.buyIn;
    this.priceMultiplier = this.buyIn / 10; // Scale prices to buy-in
    
    // Scale board prices
    this.board.forEach(space => {
      if (space.price) {
        space.price = Math.round(space.price * this.priceMultiplier * 100) / 100;
        space.rent = Math.round(space.rent * this.priceMultiplier * 100) / 100;
      }
    });
  }

  // Spin the wheel!
  spinWheel() {
    const totalWeight = WHEEL_OUTCOMES.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const outcome of WHEEL_OUTCOMES) {
      random -= outcome.weight;
      if (random <= 0) {
        return { ...outcome };
      }
    }
    return { ...WHEEL_OUTCOMES[1] }; // Default to 1x
  }

  rollDice(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };
    if (this.getCurrentPlayer().id !== playerId) return { error: 'Not your turn' };
    if (player.bankrupt) return { error: 'You are bankrupt' };

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    const oldPosition = player.position;
    player.position = (player.position + total) % this.board.length;

    // Passed GO
    const passedGo = player.position < oldPosition;
    if (passedGo) {
      const goBonus = Math.round(2 * this.priceMultiplier * 100) / 100;
      player.money += goBonus;
    }

    // SPIN THE WHEEL!
    const spin = this.spinWheel();
    this.currentSpin = spin;

    return { 
      dice: [die1, die2], 
      newPosition: player.position, 
      passedGo,
      spin 
    };
  }

  // Handle landing after spin
  handleLanding(playerId, spin) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const space = this.board[player.position];
    let result = { spin, space, effects: [] };

    // Check streak - landing on own property
    if (space.type === 'property' && space.owner === playerId) {
      player.streak++;
      result.streak = player.streak;
      result.effects.push({ type: 'streak', value: player.streak });

      // Streak bonuses
      if (player.streak === 2) {
        result.effects.push({ type: 'streak-bonus', bonus: '2x rent next collection' });
        player.streakBonus = '2x';
      } else if (player.streak === 3) {
        result.effects.push({ type: 'streak-bonus', bonus: 'Free house!' });
        // Will be handled by client choosing property
        result.pendingFreeHouse = true;
      } else if (player.streak >= 4) {
        // Jackpot! 20% of pot
        const jackpot = Math.round(this.totalPot * 0.2 * 100) / 100;
        player.money += jackpot;
        result.effects.push({ type: 'jackpot', amount: jackpot });
        player.streak = 0; // Reset after jackpot
      }
    } else {
      player.streak = 0; // Reset streak
    }

    // Apply spin effect
    switch (spin.effect) {
      case 'double':
        result.multiplier = 2;
        break;
      case 'normal':
        result.multiplier = 1;
        break;
      case 'free':
        result.multiplier = 0;
        result.effects.push({ type: 'free', message: 'FREE! No cost!' });
        break;
      case 'swap':
        if (space.type === 'property' && space.owner && space.owner !== playerId) {
          result.canSwap = true;
          result.effects.push({ type: 'swap', message: 'You can swap a property!' });
        }
        result.multiplier = 1;
        break;
      case 'pay':
        const payAmount = Math.round(player.money * 0.1 * 100) / 100;
        player.money -= payAmount;
        result.effects.push({ type: 'pay', amount: payAmount, message: `Paid $${payAmount} to bank` });
        result.multiplier = 1;
        break;
      case 'steal':
        let stolen = 0;
        const stealAmount = Math.round(2 * this.priceMultiplier * 100) / 100;
        this.players.forEach(p => {
          if (p.id !== playerId && !p.bankrupt) {
            const take = Math.min(p.money, stealAmount);
            p.money -= take;
            stolen += take;
          }
        });
        player.money += stolen;
        result.effects.push({ type: 'steal', amount: stolen, message: `Stole $${stolen}!` });
        result.multiplier = 1;
        break;
    }

    // Handle space type
    if (space.type === 'property') {
      if (!space.owner) {
        // Can buy
        const price = result.multiplier === 0 ? 0 : Math.round(space.price * result.multiplier * 100) / 100;
        result.canBuy = true;
        result.buyPrice = price;
      } else if (space.owner !== playerId) {
        // Pay rent (unless shield or FREE spin)
        if (player.shield) {
          player.shield = false;
          result.effects.push({ type: 'shield-used', message: 'Shield blocked rent!' });
        } else if (result.multiplier > 0) {
          const owner = this.players.find(p => p.id === space.owner);
          let rent = space.rent;
          
          // House multiplier
          const houses = this.getHouses(player.position);
          rent = rent * (1 + houses * 0.5);
          
          // Streak bonus for owner
          if (owner && owner.streakBonus === '2x') {
            rent *= 2;
            owner.streakBonus = null;
          }
          
          rent = Math.round(rent * result.multiplier * 100) / 100;
          
          player.money -= rent;
          if (owner) owner.money += rent;
          
          result.effects.push({ type: 'rent', amount: rent, to: space.owner });
          
          if (player.money < 0) {
            player.bankrupt = true;
            result.effects.push({ type: 'bankrupt' });
          }
        }
      }
    } else if (space.type === 'luck') {
      // Luck space - bonus spin effect already applied
      result.effects.push({ type: 'luck', message: 'Lucky space!' });
    }

    return result;
  }

  buyProperty(playerId, propertyIndex, price) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const space = this.board[propertyIndex];
    if (space.owner) return { error: 'Already owned' };
    if (player.money < price) return { error: 'Not enough money' };

    player.money -= price;
    space.owner = playerId;
    player.properties.push(propertyIndex);

    return { success: true, property: space };
  }

  getHouses(propertyIndex) {
    for (const player of this.players) {
      if (player.houses[propertyIndex]) {
        return player.houses[propertyIndex];
      }
    }
    return 0;
  }

  buildHouse(playerId, propertyIndex) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };
    if (!player.properties.includes(propertyIndex)) return { error: 'Not your property' };

    const houseCost = Math.round(2 * this.priceMultiplier * 100) / 100;
    if (player.money < houseCost) return { error: 'Not enough money' };

    const currentHouses = player.houses[propertyIndex] || 0;
    if (currentHouses >= 4) return { error: 'Max houses reached' };

    player.money -= houseCost;
    player.houses[propertyIndex] = currentHouses + 1;

    return { success: true, houses: player.houses[propertyIndex] };
  }

  addFreeHouse(playerId, propertyIndex) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };
    if (!player.properties.includes(propertyIndex)) return { error: 'Not your property' };

    const currentHouses = player.houses[propertyIndex] || 0;
    if (currentHouses >= 4) return { error: 'Max houses reached' };

    player.houses[propertyIndex] = currentHouses + 1;
    return { success: true, houses: player.houses[propertyIndex] };
  }

  // Check for lucky drops
  checkLuckyDrop() {
    const now = Date.now();
    if (now - this.lastLuckyDrop >= this.luckyDropInterval) {
      this.lastLuckyDrop = now;
      
      // Pick random non-bankrupt player
      const activePlayers = this.players.filter(p => !p.bankrupt);
      if (activePlayers.length === 0) return null;
      
      const luckyPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      const drop = LUCKY_DROPS[Math.floor(Math.random() * LUCKY_DROPS.length)];
      
      this.pendingLuckyDrop = {
        playerId: luckyPlayer.id,
        drop: drop
      };
      
      return this.pendingLuckyDrop;
    }
    return null;
  }

  applyLuckyDrop(playerId, dropId, targetData = {}) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const drop = LUCKY_DROPS.find(d => d.id === dropId);
    if (!drop) return { error: 'Invalid drop' };

    switch (dropId) {
      case 'cash':
        const cashAmount = Math.round(5 * this.priceMultiplier * 100) / 100;
        player.money += cashAmount;
        return { success: true, effect: `+$${cashAmount}` };
      
      case 'house':
        if (targetData.propertyIndex !== undefined) {
          return this.addFreeHouse(playerId, targetData.propertyIndex);
        }
        return { pending: 'house', message: 'Choose a property' };
      
      case 'shield':
        player.shield = true;
        return { success: true, effect: 'Shield activated!' };
      
      case 'sniper':
        if (targetData.targetPlayerId) {
          const target = this.players.find(p => p.id === targetData.targetPlayerId);
          if (target && !target.bankrupt) {
            const stealAmount = Math.round(3 * this.priceMultiplier * 100) / 100;
            const actual = Math.min(target.money, stealAmount);
            target.money -= actual;
            player.money += actual;
            return { success: true, effect: `Stole $${actual}!` };
          }
        }
        return { pending: 'sniper', message: 'Choose a player' };
    }

    return { error: 'Unknown drop' };
  }

  swapProperty(playerId, myPropertyIndex, theirPropertyIndex) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const myProp = this.board[myPropertyIndex];
    const theirProp = this.board[theirPropertyIndex];

    if (!player.properties.includes(myPropertyIndex)) return { error: 'Not your property' };
    if (!theirProp.owner || theirProp.owner === playerId) return { error: 'Invalid target' };

    const otherPlayer = this.players.find(p => p.id === theirProp.owner);
    if (!otherPlayer) return { error: 'Other player not found' };

    // Swap ownership
    myProp.owner = otherPlayer.id;
    theirProp.owner = playerId;

    // Update property arrays
    player.properties = player.properties.filter(i => i !== myPropertyIndex);
    player.properties.push(theirPropertyIndex);
    
    otherPlayer.properties = otherPlayer.properties.filter(i => i !== theirPropertyIndex);
    otherPlayer.properties.push(myPropertyIndex);

    return { success: true };
  }

  getCurrentPlayer() {
    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 0) return null;
    return activePlayers[this.currentPlayerIndex % activePlayers.length];
  }

  nextTurn() {
    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 0) return;
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;
    this.currentSpin = null;
  }

  updateTime() {
    if (this.startTime) {
      this.timeRemaining = Math.max(0, this.gameLength - (Date.now() - this.startTime));
    }
    return this.timeRemaining;
  }

  checkGameEnd() {
    const activePlayers = this.players.filter(p => !p.bankrupt);
    
    // Time's up
    if (this.timeRemaining <= 0) {
      // Winner is highest net worth
      let winner = null;
      let highestWorth = -1;
      
      activePlayers.forEach(p => {
        const worth = this.calculateNetWorth(p);
        if (worth > highestWorth) {
          highestWorth = worth;
          winner = p;
        }
      });
      
      return { ended: true, winner, reason: 'time' };
    }
    
    // Only one player left
    if (activePlayers.length === 1) {
      return { ended: true, winner: activePlayers[0], reason: 'bankrupt' };
    }
    
    return { ended: false };
  }

  calculateNetWorth(player) {
    let worth = player.money;
    player.properties.forEach(propIndex => {
      worth += this.board[propIndex].price || 0;
      const houses = player.houses[propIndex] || 0;
      worth += houses * 2 * this.priceMultiplier;
    });
    return Math.round(worth * 100) / 100;
  }

  getState() {
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: this.players.map(p => ({
        ...p,
        netWorth: this.calculateNetWorth(p)
      })),
      board: this.board,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer(),
      timeRemaining: this.updateTime(),
      totalPot: this.totalPot,
      buyIn: this.buyIn,
      currentSpin: this.currentSpin,
      pendingLuckyDrop: this.pendingLuckyDrop,
    };
  }
}

module.exports = LuckyStreetsEngine;
