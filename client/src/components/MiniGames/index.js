export { default as PongGame } from './PongGame';
export { default as DodgeGame } from './DodgeGame';
export { default as ReactionGame } from './ReactionGame';
export { default as MemoryGame } from './MemoryGame';
export { default as ClickerGame } from './ClickerGame';
export { default as SnakeGame } from './SnakeGame';
export { default as HigherLowerGame } from './HigherLowerGame';

// Mini-game mapping
export const MINI_GAMES = {
  'PONG': { component: 'PongGame', name: '🏓 Pong Duel', description: 'Beat opponent in pong!' },
  'DODGE': { component: 'DodgeGame', name: '🔥 Dodge', description: 'Survive 10 seconds!' },
  'REACTION': { component: 'ReactionGame', name: '⚡ Reaction', description: 'Fastest click wins!' },
  'MEMORY': { component: 'MemoryGame', name: '🧠 Memory', description: 'Match all pairs!' },
  'CLICKER': { component: 'ClickerGame', name: '👆 Clicker', description: 'Out-click opponent!' },
  'SNAKE': { component: 'SnakeGame', name: '🐍 Snake', description: 'Eat 5 apples!' },
  'HIGHLOW': { component: 'HigherLowerGame', name: '📊 Higher/Lower', description: 'Guess 5 right!' },
};
