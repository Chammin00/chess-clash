import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Move } from '../types';

interface ChessMoveLogProps {
  moves: Move[];
}

export const ChessMoveLog: React.FC<ChessMoveLogProps> = ({ moves }) => {
  // Group moves into pairs (White move, Black move)
  const pairedMoves: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    pairedMoves.push({
      num: moveNum,
      white: moves[i]?.san || '',
      black: moves[i + 1]?.san,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>MOVE HISTORY</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pairedMoves.length === 0 ? (
          <Text style={styles.emptyText}>Game starting... Make your first move!</Text>
        ) : (
          pairedMoves.map((pair) => (
            <View key={`move_${pair.num}`} style={styles.pairBadge}>
              <Text style={styles.moveNumText}>{pair.num}.</Text>
              <Text style={styles.whiteMoveText}>{pair.white}</Text>
              {pair.black && (
                <Text style={styles.blackMoveText}>{pair.black}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  headerTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 11,
    fontStyle: 'italic',
  },
  pairBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  moveNumText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  whiteMoveText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  blackMoveText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
});
