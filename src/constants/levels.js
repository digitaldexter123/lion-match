// Level definitions for 50 levels
// objectives: 'score', 'clear_ice', 'collect', 'clear_chain'
// obstacles: 'ice' (needs 1 adjacent match), 'chain' (needs 2), 'locked' (immovable, needs 3)

function mkLevel(id, moves, target, objective, obstacles, colors) {
  return { id, moves, target, objective, obstacles: obstacles || {}, colors: colors || 6 };
}

export const LEVELS = [
  // World 1: Tutorial (1-10)
  mkLevel(1,  20, 800,   'score',      {}),
  mkLevel(2,  22, 1000,  'score',      {}),
  mkLevel(3,  18, 1200,  'score',      {}),
  mkLevel(4,  20, 5,     'clear_ice',  { ice: [[0,0],[0,7],[7,0],[7,7],[3,3]] }),
  mkLevel(5,  22, 8,     'clear_ice',  { ice: [[1,1],[1,6],[3,3],[4,4],[6,1],[6,6]] }),
  mkLevel(6,  18, 1500,  'score',      {}),
  mkLevel(7,  24, 10,    'clear_ice',  { ice: [[0,0],[0,3],[0,7],[7,0],[7,4],[7,7],[3,3],[4,4]] }),
  mkLevel(8,  20, 5,     'collect',    {}),
  mkLevel(9,  22, 8,     'collect',    {}),
  mkLevel(10, 20, 2000,  'score',      {}),

  // World 2: Ice Kingdom (11-20)
  mkLevel(11, 18, 12,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]] }, 5),
  mkLevel(12, 22, 2500,  'score',      {}, 5),
  mkLevel(13, 20, 3,     'clear_chain',{ chain: [[3,3],[4,4],[3,4]] }),
  mkLevel(14, 18, 5,     'clear_chain',{ chain: [[2,2],[2,5],[5,2],[5,5]] }),
  mkLevel(15, 24, 3000,  'score',      {}, 5),
  mkLevel(16, 20, 15,    'clear_ice',  { ice: [[0,0],[0,7],[7,0],[7,7],[3,3],[3,4],[4,3],[4,4],[1,3],[6,4]] }),
  mkLevel(17, 22, 6,     'clear_chain',{ chain: [[0,0],[0,7],[7,0],[7,7],[3,3],[4,4]] }),
  mkLevel(18, 18, 10,    'collect',    {}),
  mkLevel(19, 20, 3500,  'score',      {}),
  mkLevel(20, 16, 20,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,0],[1,7]] }),

  // World 3: Crystal Caves (21-30)
  mkLevel(21, 20, 4000,  'score',      {}),
  mkLevel(22, 18, 8,     'clear_chain',{ chain: [[1,1],[1,6],[3,3],[3,4],[4,3],[4,4],[6,1],[6,6]] }),
  mkLevel(23, 22, 15,    'collect',    {}),
  mkLevel(24, 16, 4500,  'score',      {}, 5),
  mkLevel(25, 18, 25,    'clear_ice',  { ice: [[0,2],[0,3],[0,4],[0,5],[7,2],[7,3],[7,4],[7,5],[3,0],[4,0],[3,7],[4,7],[3,3],[3,4],[4,3],[4,4]] }),
  mkLevel(26, 20, 10,    'clear_chain',{ chain: [[0,0],[0,7],[7,0],[7,7],[1,3],[1,4],[6,3],[6,4],[3,1],[3,6],[4,1],[4,6]] }),
  mkLevel(27, 18, 5000,  'score',      {}),
  mkLevel(28, 22, 20,    'collect',    {}),
  mkLevel(29, 16, 5500,  'score',      {}, 5),
  mkLevel(30, 18, 30,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[1,0],[1,1],[0,5],[0,6],[0,7],[1,6],[1,7],[6,0],[7,0],[7,1],[6,7],[7,6],[7,7],[3,3],[3,4],[4,3],[4,4]] }),

  // World 4: Golden Palace (31-40)
  mkLevel(31, 16, 6000,  'score',      {}),
  mkLevel(32, 18, 15,    'clear_chain',{ chain: [[0,3],[1,3],[2,3],[5,4],[6,4],[7,4],[3,0],[3,1],[3,2],[4,5],[4,6],[4,7]] }),
  mkLevel(33, 20, 25,    'collect',    {}),
  mkLevel(34, 14, 6500,  'score',      {}, 5),
  mkLevel(35, 18, 35,    'clear_ice',  { ice: [[0,0],[0,1],[0,6],[0,7],[1,0],[1,7],[6,0],[6,7],[7,0],[7,1],[7,6],[7,7],[2,2],[2,5],[5,2],[5,5],[3,3],[3,4],[4,3],[4,4]] }),
  mkLevel(36, 16, 20,    'clear_chain',{ chain: [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[0,7],[1,6],[2,5],[3,4],[4,3],[5,2],[6,1],[7,0]] }),
  mkLevel(37, 20, 7000,  'score',      {}),
  mkLevel(38, 18, 30,    'collect',    {}),
  mkLevel(39, 14, 7500,  'score',      {}, 5),
  mkLevel(40, 16, 40,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[3,3],[3,4],[4,3],[4,4],[1,3],[1,4],[6,3],[6,4]] }),

  // World 5: Royal Tower (41-50)
  mkLevel(41, 14, 8000,  'score',      {}),
  mkLevel(42, 16, 25,    'clear_chain',{ chain: [[0,0],[0,2],[0,4],[0,6],[2,0],[2,7],[4,0],[4,7],[6,0],[6,7],[7,1],[7,3],[7,5],[7,7],[3,3],[4,4]] }),
  mkLevel(43, 18, 35,    'collect',    {}),
  mkLevel(44, 12, 8500,  'score',      {}, 5),
  mkLevel(45, 14, 45,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]] }),
  mkLevel(46, 16, 30,    'clear_chain',{ chain: [[0,0],[0,3],[0,7],[3,0],[3,7],[7,0],[7,3],[7,7],[2,2],[2,5],[5,2],[5,5],[3,3],[3,4],[4,3],[4,4]] }),
  mkLevel(47, 14, 9000,  'score',      {}),
  mkLevel(48, 16, 40,    'collect',    {}),
  mkLevel(49, 12, 9500,  'score',      {}, 5),
  mkLevel(50, 14, 50,    'clear_ice',  { ice: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,0],[1,1],[1,6],[1,7],[2,0],[2,7],[3,0],[3,7],[4,0],[4,7],[5,0],[5,7],[6,0],[6,1],[6,6],[6,7],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7]] }),
];

export const WORLD_NAMES = ['Tutorial', 'Ice Kingdom', 'Crystal Caves', 'Golden Palace', 'Royal Tower'];
export const WORLD_COLORS = ['#2979FF', '#00BCD4', '#9C27B0', '#FF8F00', '#E91E63'];
export const WORLD_EMOJIS = ['🏰', '❄️', '💎', '👑', '🗼'];
