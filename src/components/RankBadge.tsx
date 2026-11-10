import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MmrEngine } from '../services/mmrEngine';

interface Props {
  mmr: number;
  size?: 'small' | 'medium' | 'large';
  showMmrText?: boolean;
}

export const RankBadge: React.FC<Props> = ({ mmr, size = 'medium', showMmrText = true }) => {
  const tierInfo = MmrEngine.getTierInfo(mmr);
  const roman = MmrEngine.getDivisionRoman(tierInfo.division);

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isSmall && styles.containerSmall, isLarge && styles.containerLarge]}>
      <View style={[styles.badgeCircle, { borderColor: tierInfo.badgeColor }]}>
        <Text style={[styles.icon, isSmall && styles.iconSmall, isLarge && styles.iconLarge]}>
          {tierInfo.badgeIcon}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.tierName, { color: tierInfo.badgeColor }, isSmall && styles.textSmall]}>
          {tierInfo.tier} {tierInfo.tier !== 'Sage' && tierInfo.tier !== 'Grandmaster' && tierInfo.tier !== 'Master' ? roman : ''}
        </Text>
        {showMmrText && (
          <Text style={[styles.mmrText, isSmall && styles.mmrTextSmall]}>
            {mmr} MMR
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 32, 44, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  badgeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171923',
    marginRight: 8,
  },
  icon: {
    fontSize: 18,
  },
  iconSmall: {
    fontSize: 14,
  },
  iconLarge: {
    fontSize: 24,
  },
  textContainer: {
    justifyContent: 'center',
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 11,
  },
  mmrText: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  mmrTextSmall: {
    fontSize: 9,
  },
});
