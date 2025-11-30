// Board configuration - Monopoly-style board with 40 spaces
const BOARD = [
  { name: 'GO', type: 'go' },
  { name: 'Mediterranean Ave', type: 'property', color: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50 },
  { name: 'Community Chest', type: 'chest' },
  { name: 'Baltic Ave', type: 'property', color: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50 },
  { name: 'Income Tax', type: 'tax', amount: 200 },
  { name: 'Reading Railroad', type: 'property', color: 'railroad', price: 200, rent: [25, 50, 100, 200], isRailroad: true },
  { name: 'Oriental Ave', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { name: 'Chance', type: 'chance' },
  { name: 'Vermont Ave', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { name: 'Connecticut Ave', type: 'property', color: 'lightblue', price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50 },
  { name: 'Jail / Just Visiting', type: 'jail' },
  { name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { name: 'Electric Company', type: 'property', color: 'utility', price: 150, isUtility: true },
  { name: 'States Ave', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { name: 'Virginia Ave', type: 'property', color: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100 },
  { name: 'Pennsylvania Railroad', type: 'property', color: 'railroad', price: 200, rent: [25, 50, 100, 200], isRailroad: true },
  { name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { name: 'Community Chest', type: 'chest' },
  { name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { name: 'New York Ave', type: 'property', color: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100 },
  { name: 'Free Parking', type: 'free-parking' },
  { name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { name: 'Chance', type: 'chance' },
  { name: 'Indiana Ave', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { name: 'Illinois Ave', type: 'property', color: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150 },
  { name: 'B&O Railroad', type: 'property', color: 'railroad', price: 200, rent: [25, 50, 100, 200], isRailroad: true },
  { name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { name: 'Water Works', type: 'property', color: 'utility', price: 150, isUtility: true },
  { name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150 },
  { name: 'Go To Jail', type: 'goto-jail' },
  { name: 'Pacific Ave', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { name: 'North Carolina Ave', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { name: 'Community Chest', type: 'chest' },
  { name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200 },
  { name: 'Short Line Railroad', type: 'property', color: 'railroad', price: 200, rent: [25, 50, 100, 200], isRailroad: true },
  { name: 'Chance', type: 'chance' },
  { name: 'Park Place', type: 'property', color: 'darkblue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200 },
  { name: 'Luxury Tax', type: 'tax', amount: 100 },
  { name: 'Boardwalk', type: 'property', color: 'darkblue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200 }
];

// Color groups for monopoly detection
const COLOR_GROUPS = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
  railroad: [5, 15, 25, 35],
  utility: [12, 28]
};

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
const ANON_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

class GameEngine {
  constructor(roomCode, buyIn = 10, isAnonymous = false) {
    this.roomCode = roomCode;
    this.buyIn = parseFloat(buyIn) || 10;
    this.isAnonymous = isAnonymous;
    this.players = [];
    this.board = JSON.parse(JSON.stringify(BOARD)); // Deep copy
    this.currentPlayerIndex = 0;
    this.hasStarted = false;
    this.phase = 'lobby'; // lobby, draft, playing, ended
    this.turnNumber = 0;
    this.maxTurns = 100; // Game ends after this many rounds
    
    // Pot-based scaling
    this.totalPot = 0;
    this.priceMultiplier = 1; // Will be calculated when game starts
    
    // Draft system
    this.draftRound = 0;
    this.draftPlayerIndex = 0;
    this.draftProperties = [];
    this.propertiesPerDraft = 6;
    this.draftsPerPlayer = 2;
    
    // Auction system
    this.currentAuction = null;
    
    // Game timer (60 min limit)
    this.startTime = null;
    this.timeLimit = 60 * 60 * 1000; // 60 minutes in ms
  }

  addPlayer(socketId, name, isAnonymous = false) {
    // For anonymous games, use generic player name
    const displayName = this.isAnonymous ? ANON_NAMES[this.players.length] : name;
    
    // Players start with exactly their buy-in amount - feels like real money!
    const startingMoney = this.buyIn;
    
    const player = {
      id: socketId,
      name: displayName,
      money: startingMoney,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      bankrupt: false,
      color: PLAYER_COLORS[this.players.length],
      netWorth: startingMoney,
      isAnonymous: this.isAnonymous
    };
    this.players.push(player);
    this.totalPot = this.players.length * this.buyIn;
    return player;
  }

  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.id === socketId);
    if (index !== -1) {
      const player = this.players[index];
      // Return properties to bank
      player.properties.forEach(propIndex => {
        this.board[propIndex].owner = null;
        this.board[propIndex].houses = 0;
      });
      player.bankrupt = true;
    }
  }

  startGame() {
    this.hasStarted = true;
    this.phase = 'playing';
    this.startTime = Date.now();
    
    // Calculate total pot
    this.totalPot = this.players.length * this.buyIn;
    
    // Price multiplier: scale standard Monopoly prices to match buy-in
    // Standard Monopoly: $1500 starting, cheapest $60, most expensive $400
    // We want: buyIn starting, cheapest ~buyIn/25, most expensive ~buyIn/4
    // So multiplier = buyIn / 1500 (e.g., $25 buy-in -> 0.0167)
    // This means $60 property becomes $1, $400 becomes ~$6.67
    this.priceMultiplier = this.buyIn / 1500;
    
    // Scale all board prices
    this.scaleBoardPrices();
    
    this.generateDraftProperties();
  }
  
  scaleBoardPrices() {
    // Scale all property prices, rents, house costs, and taxes
    this.board.forEach(space => {
      if (space.type === 'property') {
        space.originalPrice = space.price;
        space.price = Math.round(space.price * this.priceMultiplier);
        
        if (space.rent) {
          space.originalRent = [...space.rent];
          space.rent = space.rent.map(r => Math.round(r * this.priceMultiplier));
        }
        
        if (space.housePrice) {
          space.originalHousePrice = space.housePrice;
          space.housePrice = Math.round(space.housePrice * this.priceMultiplier);
        }
      } else if (space.type === 'tax') {
        space.originalAmount = space.amount;
        space.amount = Math.round(space.amount * this.priceMultiplier);
      }
    });
    
    // Scale GO income
    this.goIncome = Math.round(200 * this.priceMultiplier);
  }

  generateDraftProperties() {
    // Get all purchasable properties
    const allProperties = this.board
      .map((space, index) => ({ ...space, index }))
      .filter(space => space.type === 'property' && !space.owner);
    
    // Shuffle and pick 6
    const shuffled = allProperties.sort(() => Math.random() - 0.5);
    this.draftProperties = shuffled.slice(0, this.propertiesPerDraft);
  }

  getDraftProperties() {
    return this.draftProperties;
  }

  getCurrentDrafter() {
    return this.players[this.draftPlayerIndex];
  }

  draftProperty(playerId, propertyIndex) {
    const currentDrafter = this.getCurrentDrafter();
    
    if (currentDrafter.id !== playerId) {
      return { error: 'Not your turn to draft' };
    }
    
    const draftProp = this.draftProperties.find(p => p.index === propertyIndex);
    if (!draftProp) {
      return { error: 'Property not available for draft' };
    }
    
    // Assign property to player (free during draft)
    this.board[propertyIndex].owner = playerId;
    this.board[propertyIndex].houses = 0;
    currentDrafter.properties.push(propertyIndex);
    
    // Remove from draft pool
    this.draftProperties = this.draftProperties.filter(p => p.index !== propertyIndex);
    
    // Move to next player
    this.draftPlayerIndex = (this.draftPlayerIndex + 1) % this.players.length;
    
    // Check if draft round complete
    const totalDraftPicks = this.players.length * this.draftsPerPlayer;
    const currentPicks = this.players.reduce((sum, p) => sum + p.properties.length, 0);
    
    if (currentPicks >= totalDraftPicks) {
      // Draft complete
      this.phase = 'playing';
      this.draftProperties = [];
      return { property: this.board[propertyIndex], draftComplete: true };
    }
    
    // Generate new draft properties if pool is empty
    if (this.draftProperties.length === 0) {
      this.generateDraftProperties();
    }
    
    return { property: this.board[propertyIndex], draftComplete: false };
  }

  rollDice(playerId) {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      return { error: 'Player not found' };
    }
    
    if (this.getCurrentPlayer().id !== playerId) {
      return { error: 'Not your turn' };
    }
    
    if (player.bankrupt) {
      return { error: 'You are bankrupt' };
    }
    
    // Handle jail
    if (player.inJail) {
      player.jailTurns++;
      if (player.jailTurns >= 3) {
        player.inJail = false;
        player.jailTurns = 0;
        // Pay $50 to get out
        player.money -= 50;
      }
    }
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    
    if (player.inJail) {
      // Doubles get you out of jail
      if (die1 === die2) {
        player.inJail = false;
        player.jailTurns = 0;
      } else {
        return { dice: [die1, die2], newPosition: player.position, passedGo: false, inJail: true };
      }
    }
    
    const oldPosition = player.position;
    player.position = (player.position + total) % 40;
    
    const passedGo = player.position < oldPosition;
    if (passedGo) {
      const goAmount = this.goIncome || Math.round(200 * this.priceMultiplier);
      player.money += goAmount;
    }
    
    this.updateNetWorth(player);
    
    return { dice: [die1, die2], newPosition: player.position, passedGo };
  }

  // Draw a Chance card and apply effect
  drawChance(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const cards = [
      { type: 'money', amount: Math.round(50 * this.priceMultiplier), text: 'Bank pays you dividend!' },
      { type: 'money', amount: Math.round(100 * this.priceMultiplier), text: 'You won a crossword competition!' },
      { type: 'money', amount: Math.round(-50 * this.priceMultiplier), text: 'Speeding fine.' },
      { type: 'money', amount: Math.round(-15 * this.priceMultiplier), text: 'Parking ticket.' },
      { type: 'move', position: 0, text: 'Advance to GO!' },
      { type: 'move', position: 10, text: 'Go directly to Jail!' },
      { type: 'money', amount: Math.round(150 * this.priceMultiplier), text: 'Your building loan matures!' },
      { type: 'money', amount: Math.round(-100 * this.priceMultiplier), text: 'Pay poor tax.' },
    ];

    const card = cards[Math.floor(Math.random() * cards.length)];
    let result = { card };

    if (card.type === 'money') {
      player.money += card.amount;
      if (player.money < 0) player.money = 0;
    } else if (card.type === 'move') {
      const oldPos = player.position;
      player.position = card.position;
      if (card.position === 10) {
        player.inJail = true;
        player.jailTurns = 0;
      } else if (card.position === 0 && oldPos > 0) {
        // Passed GO
        player.money += this.goIncome || Math.round(200 * this.priceMultiplier);
      }
    }

    this.updateNetWorth(player);
    return result;
  }

  // Draw a Community Chest card and apply effect
  drawCommunityChest(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const cards = [
      { type: 'money', amount: Math.round(200 * this.priceMultiplier), text: 'Bank error in your favor!' },
      { type: 'money', amount: Math.round(100 * this.priceMultiplier), text: 'Life insurance matures!' },
      { type: 'money', amount: Math.round(50 * this.priceMultiplier), text: 'From sale of stock!' },
      { type: 'money', amount: Math.round(25 * this.priceMultiplier), text: 'Income tax refund!' },
      { type: 'money', amount: Math.round(-50 * this.priceMultiplier), text: 'Doctor\'s fees.' },
      { type: 'money', amount: Math.round(-100 * this.priceMultiplier), text: 'Hospital fees.' },
      { type: 'move', position: 0, text: 'Advance to GO!' },
      { type: 'move', position: 10, text: 'Go to Jail!' },
    ];

    const card = cards[Math.floor(Math.random() * cards.length)];
    let result = { card };

    if (card.type === 'money') {
      player.money += card.amount;
      if (player.money < 0) player.money = 0;
    } else if (card.type === 'move') {
      const oldPos = player.position;
      player.position = card.position;
      if (card.position === 10) {
        player.inJail = true;
        player.jailTurns = 0;
      } else if (card.position === 0 && oldPos > 0) {
        player.money += this.goIncome || Math.round(200 * this.priceMultiplier);
      }
    }

    this.updateNetWorth(player);
    return result;
  }

  startAuction(propertyIndex) {
    const property = this.board[propertyIndex];
    
    this.currentAuction = {
      propertyIndex,
      property,
      currentBid: 0,
      currentBidder: null,
      passedPlayers: [],
      startingPrice: Math.floor(property.price * 0.5)
    };
    
    return this.currentAuction;
  }

  placeBid(playerId, amount) {
    if (!this.currentAuction) {
      return { error: 'No auction in progress' };
    }
    
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      return { error: 'Player not found' };
    }
    
    if (player.bankrupt) {
      return { error: 'Bankrupt players cannot bid' };
    }
    
    if (amount > player.money) {
      return { error: 'Not enough money' };
    }
    
    if (amount <= this.currentAuction.currentBid) {
      return { error: 'Bid must be higher than current bid' };
    }
    
    this.currentAuction.currentBid = amount;
    this.currentAuction.currentBidder = playerId;
    
    // Reset passed players when new bid comes in
    this.currentAuction.passedPlayers = [];
    
    return { bid: amount };
  }

  passAuction(playerId) {
    if (!this.currentAuction) {
      return { error: 'No auction in progress' };
    }
    
    const player = this.players.find(p => p.id === playerId);
    
    if (!player || player.bankrupt) {
      return { error: 'Invalid player' };
    }
    
    if (!this.currentAuction.passedPlayers.includes(playerId)) {
      this.currentAuction.passedPlayers.push(playerId);
    }
    
    // Check if all other active players have passed
    const activePlayers = this.players.filter(p => !p.bankrupt);
    const allPassed = activePlayers.every(p => 
      p.id === this.currentAuction.currentBidder || 
      this.currentAuction.passedPlayers.includes(p.id)
    );
    
    if (allPassed && this.currentAuction.currentBidder) {
      // Auction complete - award to highest bidder
      const winner = this.players.find(p => p.id === this.currentAuction.currentBidder);
      const propIndex = this.currentAuction.propertyIndex;
      
      winner.money -= this.currentAuction.currentBid;
      winner.properties.push(propIndex);
      this.board[propIndex].owner = winner.id;
      this.board[propIndex].houses = 0;
      
      this.updateNetWorth(winner);
      
      const result = {
        auctionComplete: true,
        winner: winner,
        property: this.board[propIndex],
        price: this.currentAuction.currentBid
      };
      
      this.currentAuction = null;
      return result;
    }
    
    if (allPassed && !this.currentAuction.currentBidder) {
      // No one bid - property stays unowned
      const result = {
        auctionComplete: true,
        winner: null,
        property: this.board[this.currentAuction.propertyIndex],
        price: 0
      };
      
      this.currentAuction = null;
      return result;
    }
    
    return { passed: true };
  }

  calculateRent(propertyIndex) {
    const property = this.board[propertyIndex];
    
    if (!property.owner || property.mortgaged || property.blocked) {
      return 0;
    }
    
    const owner = this.players.find(p => p.id === property.owner);
    
    if (property.isRailroad) {
      const railroadsOwned = owner.properties.filter(p => this.board[p].isRailroad).length;
      return property.rent[railroadsOwned - 1];
    }
    
    if (property.isUtility) {
      const utilitiesOwned = owner.properties.filter(p => this.board[p].isUtility).length;
      // Roll dice for utility rent
      const dice = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
      return utilitiesOwned === 2 ? dice * 10 : dice * 4;
    }
    
    const houses = property.houses || 0;
    let rent = property.rent[houses];
    
    // Double rent if monopoly and no houses
    if (houses === 0 && this.hasMonopoly(property.owner, property.color)) {
      rent *= 2;
    }
    
    return rent;
  }

  hasMonopoly(playerId, color) {
    if (!COLOR_GROUPS[color]) return false;
    
    const groupProperties = COLOR_GROUPS[color];
    return groupProperties.every(index => this.board[index].owner === playerId);
  }

  payRent(fromPlayerId, toPlayerId, amount) {
    const fromPlayer = this.players.find(p => p.id === fromPlayerId);
    const toPlayer = this.players.find(p => p.id === toPlayerId);
    
    if (fromPlayer.money >= amount) {
      fromPlayer.money -= amount;
      toPlayer.money += amount;
      this.updateNetWorth(fromPlayer);
      this.updateNetWorth(toPlayer);
      return { success: true };
    } else {
      // Bankruptcy
      toPlayer.money += fromPlayer.money;
      fromPlayer.money = 0;
      fromPlayer.bankrupt = true;
      
      // Transfer properties to rent collector
      fromPlayer.properties.forEach(propIndex => {
        this.board[propIndex].owner = toPlayerId;
        toPlayer.properties.push(propIndex);
      });
      fromPlayer.properties = [];
      
      this.updateNetWorth(fromPlayer);
      this.updateNetWorth(toPlayer);
      
      return { bankrupt: true };
    }
  }

  payTax(playerId, amount) {
    const player = this.players.find(p => p.id === playerId);
    
    if (player.money >= amount) {
      player.money -= amount;
      this.updateNetWorth(player);
      return { success: true };
    } else {
      player.money = 0;
      player.bankrupt = true;
      // Return properties to bank
      player.properties.forEach(propIndex => {
        this.board[propIndex].owner = null;
        this.board[propIndex].houses = 0;
      });
      player.properties = [];
      this.updateNetWorth(player);
      return { bankrupt: true };
    }
  }

  sendToJail(playerId) {
    const player = this.players.find(p => p.id === playerId);
    player.position = 10; // Jail position
    player.inJail = true;
    player.jailTurns = 0;
  }

  canBuild(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return [];
    
    const buildableProperties = [];
    
    player.properties.forEach(propIndex => {
      const property = this.board[propIndex];
      
      if (property.isRailroad || property.isUtility) return;
      if ((property.houses || 0) >= 5) return; // Max is hotel (5)
      if (!this.hasMonopoly(playerId, property.color)) return;
      if (player.money < property.housePrice) return;
      
      buildableProperties.push(propIndex);
    });
    
    return buildableProperties;
  }

  buyProperty(playerId, propertyIndex) {
    const player = this.players.find(p => p.id === playerId);
    const property = this.board[propertyIndex];
    
    if (!player) {
      return { error: 'Player not found' };
    }
    
    if (property.owner) {
      return { error: 'Property already owned' };
    }
    
    if (player.money < property.price) {
      return { error: 'Not enough money' };
    }
    
    player.money -= property.price;
    property.owner = playerId;
    property.houses = 0;
    player.properties.push(propertyIndex);
    
    this.updateNetWorth(player);
    
    return { success: true, property };
  }

  buildHouse(playerId, propertyIndex) {
    const player = this.players.find(p => p.id === playerId);
    const property = this.board[propertyIndex];
    
    if (!player.properties.includes(propertyIndex)) {
      return { error: 'You do not own this property' };
    }
    
    if (!this.hasMonopoly(playerId, property.color)) {
      return { error: 'You need a monopoly to build' };
    }
    
    if ((property.houses || 0) >= 5) {
      return { error: 'Maximum buildings reached' };
    }
    
    if (player.money < property.housePrice) {
      return { error: 'Not enough money' };
    }
    
    player.money -= property.housePrice;
    property.houses = (property.houses || 0) + 1;
    
    this.updateNetWorth(player);
    
    return { success: true, houses: property.houses };
  }

  executeTrade(fromPlayerId, toPlayerId, offer) {
    const fromPlayer = this.players.find(p => p.id === fromPlayerId);
    const toPlayer = this.players.find(p => p.id === toPlayerId);
    
    // offer: { fromMoney, toMoney, fromProperties: [], toProperties: [] }
    
    // Validate
    if (fromPlayer.money < offer.fromMoney) {
      return { error: 'From player does not have enough money' };
    }
    
    if (toPlayer.money < offer.toMoney) {
      return { error: 'To player does not have enough money' };
    }
    
    for (const propIndex of offer.fromProperties) {
      if (!fromPlayer.properties.includes(propIndex)) {
        return { error: 'From player does not own property' };
      }
    }
    
    for (const propIndex of offer.toProperties) {
      if (!toPlayer.properties.includes(propIndex)) {
        return { error: 'To player does not own property' };
      }
    }
    
    // Execute trade
    fromPlayer.money -= offer.fromMoney;
    fromPlayer.money += offer.toMoney;
    toPlayer.money += offer.fromMoney;
    toPlayer.money -= offer.toMoney;
    
    offer.fromProperties.forEach(propIndex => {
      fromPlayer.properties = fromPlayer.properties.filter(p => p !== propIndex);
      toPlayer.properties.push(propIndex);
      this.board[propIndex].owner = toPlayerId;
    });
    
    offer.toProperties.forEach(propIndex => {
      toPlayer.properties = toPlayer.properties.filter(p => p !== propIndex);
      fromPlayer.properties.push(propIndex);
      this.board[propIndex].owner = fromPlayerId;
    });
    
    this.updateNetWorth(fromPlayer);
    this.updateNetWorth(toPlayer);
    
    return { success: true };
  }

  updateNetWorth(player) {
    let netWorth = player.money;
    
    player.properties.forEach(propIndex => {
      const property = this.board[propIndex];
      netWorth += property.price;
      netWorth += (property.houses || 0) * (property.housePrice || 0);
    });
    
    player.netWorth = netWorth;
  }

  getCurrentPlayer() {
    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 0) return null;
    
    // Skip bankrupt players
    while (this.players[this.currentPlayerIndex]?.bankrupt) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    
    return this.players[this.currentPlayerIndex];
  }

  nextTurn() {
    this.turnNumber++;
    
    // Clear property blocks that have expired
    this.board.forEach(space => {
      if (space.blocked && space.blockedUntilTurn <= this.turnNumber) {
        space.blocked = false;
        delete space.blockedUntilTurn;
      }
    });
    
    // Move to next active player
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex]?.bankrupt);
    
    // Check time limit
    if (this.startTime && Date.now() - this.startTime > this.timeLimit) {
      this.phase = 'ended';
    }
    
    // Check turn limit
    if (this.turnNumber >= this.maxTurns * this.players.length) {
      this.phase = 'ended';
    }
  }

  getState() {
    return {
      roomCode: this.roomCode,
      buyIn: this.buyIn,
      totalPot: this.totalPot,
      priceMultiplier: this.priceMultiplier,
      isAnonymous: this.isAnonymous,
      players: this.players.map(p => ({
        ...p,
        isCurrentTurn: this.getCurrentPlayer()?.id === p.id
      })),
      board: this.board,
      currentPlayerIndex: this.currentPlayerIndex,
      phase: this.phase,
      turnNumber: this.turnNumber,
      currentAuction: this.currentAuction,
      timeRemaining: this.startTime ? Math.max(0, this.timeLimit - (Date.now() - this.startTime)) : this.timeLimit
    };
  }
}

module.exports = GameEngine;
