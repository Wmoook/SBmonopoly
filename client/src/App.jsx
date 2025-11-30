import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import DraftPhase from './components/DraftPhase';
import GameBoard from './components/GameBoard';
import GameOver from './components/GameOver';

function App() {
  const { connect, connected, phase, error } = useGameStore();

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="min-h-screen text-white">
      {/* Connection status */}
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm ${
        connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {connected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ⚠️ {error}
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {phase === 'menu' && <MainMenu />}
        {phase === 'lobby' && <Lobby />}
        {phase === 'draft' && <DraftPhase />}
        {phase === 'playing' && <GameBoard />}
        {phase === 'ended' && <GameOver />}
      </div>
    </div>
  );
}

export default App;
