import { TILE_TYPES, GRID_SIZE } from '../constants/config';
import { MATCH_SCORE } from '../constants/config';

// ── Tile factory ──────────────────────────────────────────────────────────────
let _id = 0;
export function newId() { return ++_id; }

export function createTile(type, row, col, extra = {}) {
  return { id: newId(), type, row, col, obstacle: null, powerup: null, ...extra };
}

export function randomType(numColors = 6) {
  return TILE_TYPES[Math.floor(Math.random() * numColors)];
}

// ── Board initialisation ──────────────────────────────────────────────────────
export function buildBoard(level) {
  const numColors = level.colors || 6;
  const board = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let type = randomType(numColors);
      // avoid starting matches
      while (
        (c >= 2 && board[r][c-1]?.type === type && board[r][c-2]?.type === type) ||
        (r >= 2 && board[r-1]?.[c]?.type === type && board[r-2]?.[c]?.type === type)
      ) { type = randomType(numColors); }
      board[r][c] = createTile(type, r, c);
    }
  }

  // Apply obstacles
  if (level.obstacles) {
    if (level.obstacles.ice) {
      for (const [r, c] of level.obstacles.ice) {
        if (board[r] && board[r][c]) board[r][c].obstacle = { type: 'ice', hp: 1 };
      }
    }
    if (level.obstacles.chain) {
      for (const [r, c] of level.obstacles.chain) {
        if (board[r] && board[r][c]) board[r][c].obstacle = { type: 'chain', hp: 2 };
      }
    }
    if (level.obstacles.locked) {
      for (const [r, c] of level.obstacles.locked) {
        if (board[r] && board[r][c]) board[r][c].obstacle = { type: 'locked', hp: 3 };
      }
    }
  }
  return board;
}

// ── Swap ──────────────────────────────────────────────────────────────────────
export function isAdjacent(r1, c1, r2, c2) {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

export function swapTiles(board, r1, c1, r2, c2) {
  const b = cloneBoard(board);
  const tmp = { ...b[r1][c1] };
  b[r1][c1] = { ...b[r2][c2], row: r1, col: c1 };
  b[r2][c2] = { ...tmp, row: r2, col: c2 };
  return b;
}

// ── Match finding ─────────────────────────────────────────────────────────────
export function findMatches(board) {
  const matched = new Set();

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    let run = 1;
    for (let c = 1; c < GRID_SIZE; c++) {
      const cur = board[r][c];
      const prev = board[r][c-1];
      if (cur && prev && !cur.powerup && !prev.powerup &&
          cur.type === prev.type && cur.obstacle?.type !== 'locked' && prev.obstacle?.type !== 'locked') {
        run++;
      } else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) matched.add(key(r, k));
        }
        run = 1;
      }
    }
    if (run >= 3) {
      for (let k = GRID_SIZE - run; k < GRID_SIZE; k++) matched.add(key(r, k));
    }
  }

  // Vertical
  for (let c = 0; c < GRID_SIZE; c++) {
    let run = 1;
    for (let r = 1; r < GRID_SIZE; r++) {
      const cur = board[r][c];
      const prev = board[r-1][c];
      if (cur && prev && !cur.powerup && !prev.powerup &&
          cur.type === prev.type && cur.obstacle?.type !== 'locked' && prev.obstacle?.type !== 'locked') {
        run++;
      } else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) matched.add(key(k, c));
        }
        run = 1;
      }
    }
    if (run >= 3) {
      for (let k = GRID_SIZE - run; k < GRID_SIZE; k++) matched.add(key(k, c));
    }
  }

  return matched;
}

function key(r, c) { return `${r},${c}`; }
function fromKey(k) { const [r, c] = k.split(',').map(Number); return { r, c }; }

// ── Power-up creation ─────────────────────────────────────────────────────────
export function detectPowerups(board, matchSet, swapR, swapC) {
  // Find connected components in matchSet
  const cells = [...matchSet].map(fromKey);

  // Group by contiguous regions
  const rows = {};
  const cols = {};
  cells.forEach(({ r, c }) => {
    if (!rows[r]) rows[r] = [];
    if (!cols[c]) cols[c] = [];
    rows[r].push(c);
    cols[c].push(r);
  });

  const powerups = [];

  // Find L/T shapes (intersection of h-run >=3 and v-run >=3)
  for (const [r, rCols] of Object.entries(rows)) {
    if (rCols.length >= 3) {
      for (const c of rCols) {
        const vRun = cols[c] || [];
        if (vRun.length >= 3) {
          powerups.push({ type: 'color_bomb', row: Number(r), col: Number(c) });
          return powerups; // highest priority
        }
      }
    }
  }

  // Match 5 in a row → bomb
  for (const [r, rCols] of Object.entries(rows)) {
    if (rCols.length >= 5) {
      const c = swapC != null ? swapC : Math.floor(rCols.length / 2);
      powerups.push({ type: 'bomb', row: Number(r), col: Math.min(Math.max(c, rCols[0]), rCols[rCols.length-1]) });
      return powerups;
    }
  }
  for (const [c, cRows] of Object.entries(cols)) {
    if (cRows.length >= 5) {
      const r = swapR != null ? swapR : Math.floor(cRows.length / 2);
      powerups.push({ type: 'bomb', row: Math.min(Math.max(r, cRows[0]), cRows[cRows.length-1]), col: Number(c) });
      return powerups;
    }
  }

  // Match 4 → line blast
  for (const [r, rCols] of Object.entries(rows)) {
    if (rCols.length === 4) {
      const c = swapC != null && rCols.includes(swapC) ? swapC : rCols[1];
      powerups.push({ type: 'line_h', row: Number(r), col: c });
      return powerups;
    }
  }
  for (const [c, cRows] of Object.entries(cols)) {
    if (cRows.length === 4) {
      const r = swapR != null && cRows.includes(swapR) ? swapR : cRows[1];
      powerups.push({ type: 'line_v', row: r, col: Number(c) });
      return powerups;
    }
  }

  return powerups;
}

// ── Remove matched, apply obstacles, create powerups ─────────────────────────
export function resolveMatches(board, matchSet, powerupsToCreate = []) {
  const b = cloneBoard(board);
  let scoreGain = 0;
  let iceCleared = 0;
  let chainDamaged = 0;
  let collected = 0;

  // Damage adjacent obstacles for each match
  const damaged = new Set();
  for (const k of matchSet) {
    const { r, c } = fromKey(k);
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        const neighbor = b[nr][nc];
        if (neighbor?.obstacle && !matchSet.has(key(nr, nc))) {
          const nk = key(nr, nc);
          if (!damaged.has(nk)) {
            damaged.add(nk);
            neighbor.obstacle.hp--;
            if (neighbor.obstacle.hp <= 0) {
              if (neighbor.obstacle.type === 'ice') iceCleared++;
              if (neighbor.obstacle.type === 'chain') chainDamaged++;
              neighbor.obstacle = null;
            }
          }
        }
      }
    }
  }

  // Remove matched tiles
  const matchSize = matchSet.size;
  scoreGain += (MATCH_SCORE[Math.min(matchSize, 6)] || MATCH_SCORE[6]) * Math.floor(matchSize / 3);

  for (const k of matchSet) {
    const { r, c } = fromKey(k);
    const tile = b[r][c];
    if (tile?.obstacle) {
      tile.obstacle.hp--;
      if (tile.obstacle.hp <= 0) {
        if (tile.obstacle.type === 'ice') iceCleared++;
        if (tile.obstacle.type === 'chain') chainDamaged++;
        tile.obstacle = null;
      }
      // Don't remove locked tiles
      if (b[r][c].obstacle?.type === 'locked') continue;
    }
    collected++;
    b[r][c] = null;
  }

  // Place powerups
  for (const pu of powerupsToCreate) {
    const { type, row, col } = pu;
    const tileType = board[row][col]?.type || randomType();
    b[row][col] = createTile(tileType, row, col, { powerup: type });
  }

  return { board: b, scoreGain, iceCleared, chainDamaged, collected };
}

// ── Activate power-up ─────────────────────────────────────────────────────────
export function activatePowerup(board, r, c) {
  const tile = board[r][c];
  if (!tile?.powerup) return { board, affected: new Set() };

  const affected = new Set();
  const b = cloneBoard(board);

  if (tile.powerup === 'line_h') {
    for (let cc = 0; cc < GRID_SIZE; cc++) affected.add(key(r, cc));
  } else if (tile.powerup === 'line_v') {
    for (let rr = 0; rr < GRID_SIZE; rr++) affected.add(key(rr, c));
  } else if (tile.powerup === 'bomb') {
    for (let dr = -2; dr <= 2; dr++)
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE)
          affected.add(key(nr, nc));
      }
  } else if (tile.powerup === 'color_bomb') {
    // Remove all tiles of the swapped tile's color (handled externally)
    affected.add(key(r, c));
  }

  return { board: b, affected };
}

// ── Gravity (tiles fall down) ─────────────────────────────────────────────────
export function applyGravity(board) {
  const b = cloneBoard(board);
  for (let c = 0; c < GRID_SIZE; c++) {
    let empty = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (b[r][c] !== null) {
        if (r !== empty) {
          b[empty][c] = { ...b[r][c], row: empty, col: c };
          b[r][c] = null;
        }
        empty--;
      }
    }
  }
  return b;
}

// ── Fill empty cells ──────────────────────────────────────────────────────────
export function fillBoard(board, numColors = 6) {
  const b = cloneBoard(board);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (b[r][c] === null) {
        b[r][c] = createTile(randomType(numColors), r, c, { isNew: true });
      }
    }
  }
  return b;
}

// ── Hint / possible moves ─────────────────────────────────────────────────────
export function hasValidMoves(board) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE) {
        const swapped = swapTiles(board, r, c, r, c + 1);
        if (findMatches(swapped).size > 0) return true;
      }
      if (r + 1 < GRID_SIZE) {
        const swapped = swapTiles(board, r, c, r + 1, c);
        if (findMatches(swapped).size > 0) return true;
      }
    }
  }
  return false;
}

export function getHint(board) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE) {
        const swapped = swapTiles(board, r, c, r, c + 1);
        if (findMatches(swapped).size > 0) return { r1: r, c1: c, r2: r, c2: c + 1 };
      }
      if (r + 1 < GRID_SIZE) {
        const swapped = swapTiles(board, r, c, r + 1, c);
        if (findMatches(swapped).size > 0) return { r1: r, c1: c, r2: r + 1, c2: c };
      }
    }
  }
  return null;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
export function cloneBoard(board) {
  return board.map(row => row.map(tile => tile ? { ...tile, obstacle: tile.obstacle ? { ...tile.obstacle } : null } : null));
}

export function scoreToStars(score, maxScore) {
  const pct = score / maxScore;
  if (pct >= 0.9) return 3;
  if (pct >= 0.65) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}
