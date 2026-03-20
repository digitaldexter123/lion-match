import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_LIVES, LIFE_REGEN_MS } from '../constants/config';

const STORAGE_KEY = '@royal_match_save';

const initialState = {
  gems: 50,
  coins: 500,
  lives: MAX_LIVES,
  lastLifeTime: null,
  levelProgress: {}, // { levelId: { stars, bestScore } }
  highestUnlocked: 1,
  boosters: { hammer: 3, rocket: 1, bomb: 1 },
  hasRemovedAds: false,
  hasWeeklyPass: false,
  settings: { sfx: true, music: true, haptics: true },
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, loaded: true };

    case 'SPEND_GEM':
      return { ...state, gems: Math.max(0, state.gems - action.amount) };
    case 'EARN_GEM':
      return { ...state, gems: state.gems + action.amount };
    case 'EARN_COIN':
      return { ...state, coins: state.coins + action.amount };
    case 'SPEND_COIN':
      return { ...state, coins: Math.max(0, state.coins - action.amount) };

    case 'SPEND_LIFE':
      return { ...state, lives: Math.max(0, state.lives - 1), lastLifeTime: Date.now() };
    case 'ADD_LIVES':
      return { ...state, lives: Math.min(MAX_LIVES, state.lives + action.amount) };
    case 'REGEN_LIFE':
      return { ...state, lives: Math.min(MAX_LIVES, state.lives + 1), lastLifeTime: state.lives + 1 >= MAX_LIVES ? null : Date.now() };

    case 'COMPLETE_LEVEL': {
      const { levelId, stars, score } = action;
      const prev = state.levelProgress[levelId] || { stars: 0, bestScore: 0 };
      const updated = {
        stars: Math.max(prev.stars, stars),
        bestScore: Math.max(prev.bestScore, score),
      };
      return {
        ...state,
        levelProgress: { ...state.levelProgress, [levelId]: updated },
        highestUnlocked: Math.max(state.highestUnlocked, levelId + 1),
        coins: state.coins + (stars * 50),
      };
    }

    case 'USE_BOOSTER': {
      const count = state.boosters[action.booster] || 0;
      if (count <= 0) return state;
      return { ...state, boosters: { ...state.boosters, [action.booster]: count - 1 } };
    }
    case 'ADD_BOOSTER':
      return { ...state, boosters: { ...state.boosters, [action.booster]: (state.boosters[action.booster] || 0) + action.amount } };

    case 'PURCHASE_PACK': {
      const { gems = 0, coins = 0, lives = 0 } = action.pack;
      return {
        ...state,
        gems: state.gems + gems,
        coins: state.coins + coins,
        lives: Math.min(MAX_LIVES, state.lives + lives),
      };
    }
    case 'REMOVE_ADS':
      return { ...state, hasRemovedAds: true };
    case 'WEEKLY_PASS':
      return { ...state, hasWeeklyPass: true };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load save
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch({ type: 'LOAD', payload: { ...saved, loaded: true } });
        } else {
          dispatch({ type: 'LOAD', payload: { loaded: true } });
        }
      } catch {
        dispatch({ type: 'LOAD', payload: { loaded: true } });
      }
    })();
  }, []);

  // Auto-save
  useEffect(() => {
    if (!state.loaded) return;
    const { loaded, ...toSave } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [state]);

  // Life regen timer
  useEffect(() => {
    if (state.lives >= MAX_LIVES || !state.lastLifeTime) return;
    const elapsed = Date.now() - state.lastLifeTime;
    const remaining = LIFE_REGEN_MS - elapsed;
    if (remaining <= 0) {
      dispatch({ type: 'REGEN_LIFE' });
      return;
    }
    const t = setTimeout(() => dispatch({ type: 'REGEN_LIFE' }), remaining);
    return () => clearTimeout(t);
  }, [state.lives, state.lastLifeTime]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}

// Helpers
export function lifeRegenCountdown(lastLifeTime) {
  if (!lastLifeTime) return null;
  const remaining = LIFE_REGEN_MS - (Date.now() - lastLifeTime);
  if (remaining <= 0) return '0:00';
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
