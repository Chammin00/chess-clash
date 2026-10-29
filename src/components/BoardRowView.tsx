import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BoardUnit, CombatRow } from '../types/card';
import { CardView } from './CardView';

interface Props {
  rowType: 'melee' | 'ranged' | 'siege';
  label: string;
  isOpponent?: boolean;
  units: BoardUnit[];
  hasHorn: boolean;
  hasWeather: boolean;
  rowScore: number;
  isValidTarget?: boolean;
  onRowPress?: () => void;
  onUnitPress?: (unit: BoardUnit) => void;
}

export const BoardRowView: React.FC<Props> = ({
  rowType,
  label,
  isOpponent = false,
  units,
  hasHorn,
  hasWeather,
  rowScore,
  isValidTarget = false,
  onRowPress,
  onUnitPress,
}) => {
  const getRowIcon = () => {
    switch (rowType) {
      case 'melee': return '⚔️';
      case 'ranged': return '🏹';
      case 'siege': return '🏯';
    }
  };

  const getWeatherIcon = () => {
    switch (rowType) {
      case 'melee': return '❄️';
      case 'ranged': return '🌫️';
      case 'siege': return '🌧️';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={isValidTarget ? 0.7 : 1}
      onPress={isValidTarget ? onRowPress : undefined}
      style={[
        styles.rowContainer,
        isOpponent ? styles.opponentRow : styles.playerRow,
        hasWeather && styles.weatherRowOverlay,
        isValidTarget && styles.validTargetRow,
      ]}
    >
      {/* Row Left Controls: Type Icon, Horn Indicator, Row Score */}
      <View style={styles.leftMetaContainer}>
        <View style={styles.rowTypeBadge}>
          <Text style={styles.rowTypeIcon}>{getRowIcon()}</Text>
          <Text style={styles.rowLabelText}>{label}</Text>
        </View>

        {/* Horn Indicator */}
        <View style={[styles.hornSlot, hasHorn && styles.hornSlotActive]}>
          <Text style={styles.hornSlotText}>{hasHorn ? '🥁' : '—'}</Text>
        </View>

        {/* Total Row Score */}
        <View style={[
          styles.scorePill,
          hasWeather && styles.scorePillWeather,
          hasHorn && styles.scorePillHorn,
        ]}>
          <Text style={styles.scoreText}>{rowScore}</Text>
        </View>
      </View>

      {/* Units in Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.unitsScrollContent}
        style={styles.unitsScrollView}
      >
        {units.length === 0 ? (
          <View style={styles.emptyRowPlaceholder}>
            <Text style={styles.emptyRowText}>
              {isValidTarget ? 'Tap to deploy here' : 'Empty'}
            </Text>
          </View>
        ) : (
          units.map(unit => (
            <CardView
              key={unit.instanceId}
              card={unit}
              compact
              displayPower={unit.currentPower}
              onPress={onUnitPress ? () => onUnitPress(unit) : undefined}
            />
          ))
        )}
      </ScrollView>

      {/* Weather Overlay Tag if active */}
      {hasWeather && (
        <View style={styles.weatherFloatingBadge}>
          <Text style={styles.weatherBadgeText}>{getWeatherIcon()} 1</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  playerRow: {
    backgroundColor: '#1C1917',
    borderColor: '#382F2D',
  },
  opponentRow: {
    backgroundColor: '#1E1B24',
    borderColor: '#3D344B',
  },
  weatherRowOverlay: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(14, 116, 144, 0.25)',
  },
  validTargetRow: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  leftMetaContainer: {
    width: 68,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderRightWidth: 1,
    borderRightColor: '#44403C',
    marginRight: 4,
  },
  rowTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTypeIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  rowLabelText: {
    color: '#A8A29E',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hornSlot: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534E',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  hornSlotActive: {
    backgroundColor: '#78350F',
    borderColor: '#F59E0B',
  },
  hornSlotText: {
    fontSize: 12,
    color: '#78716C',
  },
  scorePill: {
    backgroundColor: '#292524',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#78716C',
    minWidth: 32,
    alignItems: 'center',
  },
  scorePillWeather: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  scorePillHorn: {
    borderColor: '#F59E0B',
    backgroundColor: '#92400E',
  },
  scoreText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '900',
  },
  unitsScrollView: {
    flex: 1,
  },
  unitsScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  emptyRowPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyRowText: {
    color: '#57534E',
    fontSize: 11,
    fontStyle: 'italic',
  },
  weatherFloatingBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: 'rgba(2, 132, 199, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  weatherBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
