# 🎲 Skill Monopoly

A skill-based multiplayer Monopoly game with dice, auctions, power tokens, and strategic drafting.

## Features

- **Property Auctions**: All properties go to auction - no first-come-first-serve!
- **Draft System**: Pick 2 starting properties strategically
- **Power Tokens**: 2 special abilities per game (re-roll, move adjust, block property, force auction)
- **Real-time Multiplayer**: Play with 2-4 players
- **Quick Games**: 60-minute time limit, fast-paced gameplay

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (server + client)
npm run install:all
```

### 2. Run Locally (Development)

```bash
# Start both server and client
npm run dev
```

- Server runs on: `http://localhost:3001`
- Client runs on: `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
npm start
```

## Deployment Options

### Option 1: Railway.app (Recommended - Free)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy! Railway auto-detects Node.js
4. Share the URL with friends

### Option 2: Render.com (Free)

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your repo
4. Set build command: `npm run install:all && npm run build`
5. Set start command: `npm start`

### Option 3: Vercel + Railway (Frontend + Backend separate)

**Frontend (Vercel):**
1. Deploy the `/client` folder to Vercel
2. Set `VITE_SOCKET_URL` environment variable to your backend URL

**Backend (Railway):**
1. Deploy the root folder to Railway
2. It will run the Socket.io server

### Option 4: Local Network (Play with friends on same WiFi)

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Run `npm run dev`
3. Friends connect to `http://YOUR_IP:5173`

## Game Rules

### Setup
- Each player starts with the same buy-in amount (default $1000)
- Everyone drafts 2 starter properties for free
- Each player gets 2 power tokens

### Gameplay
1. Roll dice to move
2. Landing on unowned property triggers an AUCTION (everyone bids!)
3. Pay rent when landing on opponent's property
4. Build houses/hotels on monopolies
5. Use power tokens strategically

### Power Tokens
- 🎲 **Re-Roll**: Roll one die again
- 👟 **Move Adjust**: Move +2 or -2 spaces after rolling
- 🚫 **Block Property**: Block a property from collecting rent for 1 round
- ⚔️ **Force Auction**: Force an opponent to auction one of their properties

### Win Condition
- Last player standing, OR
- Highest net worth when time runs out (60 min)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + Socket.io
- **State Management**: Zustand

## Environment Variables

Create a `.env` file in the root:

```
PORT=3001
```

For the client, create `/client/.env`:

```
VITE_SOCKET_URL=http://localhost:3001
```

## License

MIT
