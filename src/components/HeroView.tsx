import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  name: string;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  isCurrentTurn: boolean;
  onPress?: () => void;
  canTarget?: boolean;
}

export const HeroView: React.FC<Props> = ({
  name,
  hp,
  maxHp,
  isPlayer,
  isCurrentTurn,
  onPress,
  canTarget = false,
}) => {
  const hpPercent = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));

  const getHpBarColor = () => {
    if (hpPercent > 50) return '#48BB78';
    if (hpPercent > 25) return '#ECC94B';
    return '#E53E3E';
  };

  return (
    <TouchableOpacity
      activeOpacity={canTarget ? 0.7 : 1}
      onPress={canTarget ? onPress : undefined}
      style={[
        styles.container,
        isCurrentTurn && styles.turnActive,
        canTarget && styles.targetableGlow,
      ]}
    >
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, isPlayer ? styles.playerAvatar : styles.oppAvatar]}>
          <Text style={styles.avatarEmoji}>{isPlayer ? '🧙‍♂️' : '👾'}</Text>
        </View>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.nameText}>{name}</Text>
            {isCurrentTurn && (
              <View style={styles.turnBadge}>
                <Text style={styles.turnBadgeText}>TURN</Text>
              </View>
            )}
          </View>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${hpPercent}%`, backgroundColor: getHpBarColor() }]} />
          </View>
          <Text style={styles.hpNumbers}>{hp} / {maxHp} HP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 32, 44, 0.9)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#4A5568',
    minWidth: 170,
  },
  turnActive: {
    borderColor: '#ECC94B',
    borderWidth: 2,
  },
  targetableGlow: {
    borderColor: '#E53E3E',
    borderWidth: 2.5,
    backgroundColor: 'rgba(229, 62, 62, 0.15)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playerAvatar: {
    backgroundColor: '#2B6CB0',
  },
  oppAvatar: {
    backgroundColor: '#9B2C2C',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 90,
  },
  turnBadge: {
    backgroundColor: '#D69E2E',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  turnBadgeText: {
    color: '#1A202C',
    fontSize: 7.5,
    fontWeight: '900',
  },
  hpTrack: {
    height: 6,
    backgroundColor: '#2D3748',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  hpFill: {
    height: '100%',
    borderRadius: 3,
  },
  hpNumbers: {
    color: '#CBD5E0',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'right',
  },
});
