export const GRID_SIZE = 8;
export const TILE_SIZE = 44; // px, fits 8 on most screens
export const TILE_GAP = 2;

export const MAX_LIVES = 5;
export const LIFE_REGEN_MS = 30 * 60 * 1000; // 30 minutes

export const MATCH_SCORE = {
  3: 60,
  4: 120,
  5: 200,
  6: 300,
};

export const BOOSTER_TYPES = {
  hammer:  { id: 'hammer',  name: 'Hammer',  description: 'Remove any tile',       gemCost: 20,  coinCost: 0  },
  rocket:  { id: 'rocket',  name: 'Rocket',  description: 'Clear entire row',      gemCost: 30,  coinCost: 0  },
  bomb:    { id: 'bomb',    name: 'Bomb',    description: 'Clear 3x3 area',        gemCost: 40,  coinCost: 0  },
};

export const IAP_PACKAGES = [
  { id: 'starter_pack',  name: 'Starter Pack',   price: '$0.99',  gems: 50,   coins: 500,  lives: 3, badge: 'BEST VALUE' },
  { id: 'gem_bundle_s',  name: 'Gem Bundle',     price: '$2.99',  gems: 100,  coins: 0,    lives: 0, badge: null },
  { id: 'gem_bundle_m',  name: 'Gem Bundle',     price: '$6.99',  gems: 300,  coins: 0,    lives: 0, badge: 'POPULAR' },
  { id: 'gem_bundle_l',  name: 'Gem Bundle',     price: '$14.99', gems: 700,  coins: 0,    lives: 0, badge: null },
  { id: 'remove_ads',    name: 'Remove Ads',     price: '$2.99',  gems: 0,    coins: 0,    lives: 0, badge: null },
  { id: 'weekly_pass',   name: 'Weekly Pass',    price: '$3.99',  gems: 0,    coins: 0,    lives: 0, badge: 'SUBSCRIPTION' },
];

export const STARS = {
  1: 0.4,   // 40% of max score
  2: 0.65,
  3: 0.9,
};
