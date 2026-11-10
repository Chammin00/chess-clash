import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  isVip: boolean;
  onReviveWithAd: () => void;
  onInstantVipRevive: () => void;
  onAcceptDefeat: () => void;
}

export const SpireReviveModal: React.FC<Props> = ({
  visible,
  isVip,
  onReviveWithAd,
  onInstantVipRevive,
  onAcceptDefeat,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.skullIcon}>⚠️</Text>
          <Text style={styles.title}>CRITICAL VITALITY FAILURE</Text>
          <Text style={styles.subtitle}>
            Your Vanguard chassis has sustained lethal damage. Activate your 1-per-run Emergency Phoenix Defibrillator to continue the ascent!
          </Text>

          {/* Revive Perks */}
          <View style={styles.perksList}>
            <Text style={styles.perkItem}>• Restores 35% Max Vitality immediately</Text>
            <Text style={styles.perkItem}>• Deploys +10 Emergency Aegis Barrier</Text>
            <Text style={styles.perkItem}>• Recharges Full Reactor Energy for next turn</Text>
          </View>

          {/* Action Buttons */}
          {isVip ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.vipReviveBtn}
              onPress={onInstantVipRevive}
            >
              <Text style={styles.vipReviveBtnText}>⚡ ACTIVATE FOUNDER PHOENIX SURGE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.adReviveBtn}
              onPress={onReviveWithAd}
            >
              <Text style={styles.adReviveBtnText}>⚡ TRIGGER EMERGENCY SECOND WIND (1x / RUN)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.defeatBtn} onPress={onAcceptDefeat}>
            <Text style={styles.defeatBtnText}>Accept Defeat & Log Expedition</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#0D1117',
    borderRadius: 14,
    padding: 22,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F85149',
  },
  skullIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  title: {
    color: '#FF7B72',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  subtitle: {
    color: '#8B949E',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 16,
  },
  perksList: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  perkItem: {
    color: '#58A6FF',
    fontSize: 11,
    fontWeight: '700',
  },
  vipReviveBtn: {
    backgroundColor: '#D29922',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  vipReviveBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adReviveBtn: {
    backgroundColor: '#238636',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3FB950',
  },
  adReviveBtnText: {
    color: '#F0F6FC',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  defeatBtn: {
    paddingVertical: 10,
  },
  defeatBtnText: {
    color: '#8B949E',
    fontSize: 11,
    fontWeight: '700',
  },
});
