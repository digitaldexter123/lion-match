import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Pressable } from 'react-native';
import { TILE_COLORS, POWERUP_COLORS } from '../constants/colors';
import { TILE_SIZE, TILE_GAP } from '../constants/config';

const SIZE = TILE_SIZE;

export default function Tile({ tile, selected, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(tile?.isNew ? 0 : 1)).current;

  useEffect(() => {
    if (tile?.isNew) {
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    }
  }, [tile?.id]);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.15 : 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  }, [selected]);

  if (!tile) return null;

  const isPowerup = !!tile.powerup;
  const colorConfig = isPowerup
    ? POWERUP_COLORS[tile.powerup] || POWERUP_COLORS.bomb
    : TILE_COLORS[tile.type] || TILE_COLORS.ruby;

  const obstacleEmoji = getObstacleEmoji(tile.obstacle);
  const powerupEmoji = getPowerupEmoji(tile.powerup);
  const tileEmoji = isPowerup ? powerupEmoji : TILE_COLORS[tile.type]?.emoji || '💎';

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.tile,
          { backgroundColor: colorConfig.bg, borderColor: selected ? '#FFFFFF' : colorConfig.border },
          selected && styles.selected,
          isPowerup && styles.powerupTile,
        ]}
      >
        <Text style={styles.emoji}>{tileEmoji}</Text>
        {obstacleEmoji ? (
          <Text style={styles.obstacleEmoji}>{obstacleEmoji}</Text>
        ) : null}
        {tile.obstacle?.type === 'chain' && tile.obstacle.hp === 2 && (
          <Text style={styles.hpDot}>⛓</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getObstacleEmoji(obstacle) {
  if (!obstacle) return null;
  if (obstacle.type === 'ice') return '🧊';
  if (obstacle.type === 'chain') return null; // drawn as overlay
  if (obstacle.type === 'locked') return '🔒';
  return null;
}

function getPowerupEmoji(powerup) {
  if (powerup === 'line_h') return '➡️';
  if (powerup === 'line_v') return '⬆️';
  if (powerup === 'bomb') return '💣';
  if (powerup === 'color_bomb') return '🌈';
  return '💎';
}

const styles = StyleSheet.create({
  tile: {
    width: SIZE,
    height: SIZE,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: TILE_GAP / 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowOpacity: 0.6,
  },
  powerupTile: {
    borderWidth: 3,
  },
  emoji: {
    fontSize: SIZE * 0.48,
    lineHeight: SIZE * 0.6,
  },
  obstacleEmoji: {
    position: 'absolute',
    fontSize: SIZE * 0.48,
    opacity: 0.85,
  },
  hpDot: {
    position: 'absolute',
    fontSize: SIZE * 0.3,
    top: 1,
    right: 1,
    opacity: 0.9,
  },
});
