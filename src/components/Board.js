import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { GRID_SIZE, TILE_SIZE, TILE_GAP } from '../constants/config';

export default function Board({ board, selected, onTilePress, disabled, exploding }) {
  const renderTile = useCallback((tile, r, c) => {
    const isSelected = selected?.r === r && selected?.c === c;
    const isExploding = exploding?.has(`${r},${c}`);
    return (
      <Tile
        key={tile ? tile.id : `empty-${r}-${c}`}
        tile={tile}
        selected={isSelected}
        exploding={isExploding}
        onPress={() => onTilePress(r, c)}
        disabled={disabled || !tile}
      />
    );
  }, [selected, disabled, exploding]);

  return (
    <View style={styles.board}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((tile, c) => renderTile(tile, r, c))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: TILE_GAP,
  },
  row: {
    flexDirection: 'row',
  },
});
