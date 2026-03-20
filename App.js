import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { TILE_COLORS, TILE_TYPES } from './src/constants/colors';
import { GRID_SIZE, TILE_SIZE } from './src/constants/config';
import { buildBoard, findMatches, resolveMatches, applyGravity, fillBoard } from './src/game/matchEngine';

const GEM_TYPES = TILE_TYPES;

// Simple board creator for starting games
function createBoard() {
  const basicLevel = { colors: 6 };
  return buildBoard(basicLevel);
}

// Simple in-app game without navigation for web preview
export default function App() {
  const [screen, setScreen] = useState('menu');
  const [board, setBoard] = useState(() => createBoard());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(100);
  const [lives, setLives] = useState(5);
  const [processing, setProcessing] = useState(false);

  const processMatches = useCallback(async (currentBoard) => {
    setProcessing(true);
    let b = currentBoard;
    let totalScore = 0;
    let found = true;

    while (found) {
      const matches = findMatches(b);
      if (matches.size === 0) {
        found = false;
        break;
      }
      const { board: removed, scoreGain } = resolveMatches(b, matches);
      totalScore += scoreGain;
      b = applyGravity(removed);
      b = fillBoard(b);
      await new Promise(r => setTimeout(r, 150));
      setBoard(b.map(row => [...row]));
    }

    setScore(s => s + totalScore);
    setProcessing(false);
    return totalScore;
  }, []);

  const handleTilePress = useCallback(async (r, c) => {
    if (processing || moves <= 0) return;

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    const dr = Math.abs(selected.r - r);
    const dc = Math.abs(selected.c - c);
    const isAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);

    if (!isAdjacent) {
      setSelected({ r, c });
      return;
    }

    // Swap tiles
    const newBoard = board.map(row => [...row]);
    const temp = newBoard[selected.r][selected.c];
    newBoard[selected.r][selected.c] = newBoard[r][c];
    newBoard[r][c] = temp;

    setSelected(null);
    setMoves(m => m - 1);

    const matches = findMatches(newBoard);
    if (matches.size === 0) {
      // Swap back - invalid move
      const revert = newBoard.map(row => [...row]);
      const t = revert[selected.r][selected.c];
      revert[selected.r][selected.c] = revert[r][c];
      revert[r][c] = t;
      setBoard(revert);
      setMoves(m => m + 1);
      return;
    }

    setBoard(newBoard);
    await processMatches(newBoard);
  }, [board, selected, processing, moves, processMatches]);

  const resetGame = () => {
    setBoard(createBoard());
    setScore(0);
    setMoves(20);
    setSelected(null);
    setProcessing(false);
  };

  const GEM_COLORS = Object.values(TILE_COLORS).map(t => t.bg);
  const GEM_LABELS = Object.values(TILE_COLORS).map(t => t.emoji);

  if (screen === 'menu') {
    return (
      <View style={styles.menuContainer}>
        <View style={styles.menuCard}>
          <Text style={styles.lionEmoji}>🦁</Text>
          <Text style={styles.title}>Lion Match</Text>
          <Text style={styles.subtitle}>Match-3 Puzzle Adventure</Text>
          <Text style={styles.tagline}>Swipe gems. Beat levels. Roar!</Text>

          <TouchableOpacity style={styles.playButton} onPress={() => { resetGame(); setScreen('game'); }}>
            <Text style={styles.playButtonText}>▶ PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shopButton} onPress={() => setScreen('shop')}>
            <Text style={styles.shopButtonText}>🪙 Shop — {coins} Coins</Text>
          </TouchableOpacity>

          <View style={styles.livesRow}>
            <Text style={styles.livesText}>❤️ Lives: {lives}/5</Text>
          </View>

          <Text style={styles.versionText}>Level {level} • Free to Play</Text>
        </View>
      </View>
    );
  }

  if (screen === 'shop') {
    return (
      <View style={styles.menuContainer}>
        <View style={styles.menuCard}>
          <Text style={styles.shopTitle}>🪙 Shop</Text>
          <Text style={styles.coinsDisplay}>Your Coins: {coins}</Text>

          {[
            { label: '100 Coins', price: '$0.99', coins: 100 },
            { label: '500 Coins', price: '$2.99', coins: 500 },
            { label: '1200 Coins', price: '$9.99', coins: 1200 },
            { label: '2500 Coins', price: '$19.99', coins: 2500 },
          ].map(pkg => (
            <TouchableOpacity key={pkg.label} style={styles.shopItem}
              onPress={() => Alert.alert('Purchase', `${pkg.label} for ${pkg.price}`, [
                { text: 'Cancel' },
                { text: 'Buy', onPress: () => { setCoins(c => c + pkg.coins); Alert.alert('✅', 'Coins added!'); } }
              ])}>
              <Text style={styles.shopItemText}>🪙 {pkg.label}</Text>
              <Text style={styles.shopItemPrice}>{pkg.price}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.shopItem}
            onPress={() => Alert.alert('Buy Lives', '3 extra lives for 50 coins?', [
              { text: 'Cancel' },
              { text: 'Buy (50 🪙)', onPress: () => { if (coins >= 50) { setCoins(c => c - 50); setLives(l => Math.min(l + 3, 8)); } else Alert.alert('Not enough coins!'); } }
            ])}>
            <Text style={styles.shopItemText}>❤️ +3 Lives</Text>
            <Text style={styles.shopItemPrice}>50 🪙</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('menu')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Game screen
  return (
    <SafeAreaView style={styles.gameContainer}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <TouchableOpacity onPress={() => setScreen('menu')}>
          <Text style={styles.hudLion}>🦁</Text>
        </TouchableOpacity>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>MOVES</Text>
          <Text style={[styles.hudValue, moves <= 5 && styles.hudValueDanger]}>{moves}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((tile, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const gemIndex = tile ? GEM_TYPES.indexOf(tile.type) : -1;
              return (
                <TouchableOpacity
                  key={`${r}-${c}-${tile?.id}`}
                  style={[
                    styles.tile,
                    { backgroundColor: tile ? GEM_COLORS[gemIndex] || '#888' : '#1a1a2e' },
                    isSelected && styles.tileSelected,
                  ]}
                  onPress={() => handleTilePress(r, c)}
                  disabled={processing}
                >
                  <Text style={styles.tileEmoji}>
                    {tile ? GEM_LABELS[gemIndex] || '❓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.bottomBar}>
        {moves <= 0 ? (
          <View style={styles.gameOverBar}>
            <Text style={styles.gameOverText}>Out of moves! Score: {score}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
              <Text style={styles.retryText}>🔄 Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.retryButton, {backgroundColor:'#FDD835'}]}
              onPress={() => { if (coins >= 50) { setCoins(c=>c-50); setMoves(5); } else Alert.alert('Need 50 coins for +5 moves!'); }}>
              <Text style={[styles.retryText,{color:'#222'}]}>🪙 +5 Moves (50 coins)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.hintText}>
            {selected ? '✨ Now tap an adjacent gem' : 'Tap a gem to select it'}
          </Text>
        )}
        <Text style={styles.coinsBar}>🪙 {coins} coins</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuContainer: { flex: 1, backgroundColor: '#1a0a4e', justifyContent: 'center', alignItems: 'center', padding: 20 },
  menuCard: { backgroundColor: '#2d1b69', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20 },
  lionEmoji: { fontSize: 80, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: '900', color: '#F7DC6F', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#b39ddb', marginTop: 4 },
  tagline: { fontSize: 14, color: '#9e9e9e', marginTop: 8, marginBottom: 24, fontStyle: 'italic' },
  playButton: { backgroundColor: '#F7DC6F', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 60, marginBottom: 12, width: '100%', alignItems: 'center' },
  playButtonText: { fontSize: 22, fontWeight: '900', color: '#1a0a4e', letterSpacing: 3 },
  shopButton: { backgroundColor: '#3d2b8a', borderRadius: 50, paddingVertical: 12, paddingHorizontal: 40, marginBottom: 16, width: '100%', alignItems: 'center' },
  shopButtonText: { fontSize: 16, color: '#F7DC6F', fontWeight: '700' },
  livesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  livesText: { fontSize: 18, color: '#ef5350' },
  versionText: { fontSize: 12, color: '#666', marginTop: 8 },
  shopTitle: { fontSize: 28, fontWeight: '900', color: '#F7DC6F', marginBottom: 8 },
  coinsDisplay: { fontSize: 18, color: '#b39ddb', marginBottom: 20 },
  shopItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3d2b8a', borderRadius: 12, padding: 16, marginBottom: 10, width: '100%' },
  shopItemText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  shopItemPrice: { fontSize: 16, color: '#F7DC6F', fontWeight: '700' },
  backButton: { marginTop: 16, padding: 12 },
  backButtonText: { color: '#b39ddb', fontSize: 16 },
  gameContainer: { flex: 1, backgroundColor: '#1a0a4e' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  hudItem: { alignItems: 'center', minWidth: 80 },
  hudLabel: { fontSize: 11, color: '#7c6ba8', fontWeight: '700', letterSpacing: 1 },
  hudValue: { fontSize: 24, color: '#F7DC6F', fontWeight: '900' },
  hudValueDanger: { color: '#ef5350' },
  hudLion: { fontSize: 40 },
  boardContainer: { alignSelf: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
  row: { flexDirection: 'row' },
  tile: { width: TILE_SIZE, height: TILE_SIZE, margin: 2, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tileSelected: { borderWidth: 3, borderColor: '#F7DC6F', transform: [{ scale: 1.1 }] },
  tileEmoji: { fontSize: TILE_SIZE * 0.5 },
  bottomBar: { padding: 16, alignItems: 'center' },
  hintText: { color: '#b39ddb', fontSize: 14, marginBottom: 4 },
  coinsBar: { color: '#F7DC6F', fontSize: 16, fontWeight: '700' },
  gameOverBar: { alignItems: 'center', gap: 8, marginBottom: 8 },
  gameOverText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  retryButton: { backgroundColor: '#ef5350', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
