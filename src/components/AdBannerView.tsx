import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AD_CONFIG } from '../config/ads';

interface Props {
  hasNoAds?: boolean;
}

export const AdBannerView: React.FC<Props> = ({ hasNoAds = false }) => {
  if (hasNoAds) return null;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Ad</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sponsorTitle}>⚔️ Forge of Legends: Season 4</Text>
        <Text style={styles.sponsorSub}>Play now & claim 100 free summons!</Text>
      </View>
      <View style={styles.installBtn}>
        <Text style={styles.installText}>INSTALL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    width: '100%',
    backgroundColor: '#171923',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#ECC94B',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 8,
  },
  badgeText: {
    color: '#1A202C',
    fontSize: 8,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  sponsorTitle: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sponsorSub: {
    color: '#A0AEC0',
    fontSize: 8,
  },
  installBtn: {
    backgroundColor: '#3182CE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  installText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
