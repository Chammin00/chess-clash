import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  rewardType: string;
  rewardAmount: number;
  onRewardClaimed: () => void;
  onClose: () => void;
  isInterstitial?: boolean;
}

export const RewardedAdModal: React.FC<Props> = ({
  visible,
  rewardType,
  rewardAmount,
  onRewardClaimed,
  onClose,
  isInterstitial = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(isInterstitial ? 3 : 5);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSecondsLeft(isInterstitial ? 3 : 5);
      setCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, isInterstitial]);

  const handleClaim = () => {
    onRewardClaimed();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.adContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.adTag}>
              <Text style={styles.adTagText}>
                {isInterstitial ? 'SPONSORED' : 'REWARDED VIDEO'}
              </Text>
            </View>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                {completed ? 'Complete' : `Reward in ${secondsLeft}s`}
              </Text>
            </View>
          </View>

          {/* Ad Creative Simulator */}
          <View style={styles.creativeArea}>
            <Text style={styles.gameArt}>🎮</Text>
            <Text style={styles.gameTitle}>Cyber Raiders: 2099</Text>
            <Text style={styles.gameTagline}>
              Build your cybernetic squad & dominate the neon battlefield!
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.ratingCount}>4.8 (120K reviews)</Text>
            </View>
          </View>

          {/* Bottom Action Area */}
          <View style={styles.bottomBar}>
            {completed ? (
              <TouchableOpacity style={styles.claimBtn} onPress={handleClaim}>
                <Text style={styles.claimBtnText}>
                  {isInterstitial ? 'CONTINUE TO GAME ➔' : `CLAIM +${rewardAmount} ${rewardType.toUpperCase()} 🎉`}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingBtn}>
                <Text style={styles.waitingBtnText}>
                  Please watch for {secondsLeft}s to earn reward
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  adContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#171923',
    alignItems: 'center',
  },
  adTag: {
    backgroundColor: '#ECC94B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adTagText: {
    color: '#1A202C',
    fontSize: 9,
    fontWeight: '900',
  },
  timerBadge: {
    backgroundColor: '#2D3748',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timerText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  creativeArea: {
    padding: 24,
    alignItems: 'center',
  },
  gameArt: {
    fontSize: 64,
    marginBottom: 12,
  },
  gameTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  gameTagline: {
    color: '#A0AEC0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  stars: {
    fontSize: 12,
    marginRight: 6,
  },
  ratingCount: {
    color: '#718096',
    fontSize: 10,
  },
  bottomBar: {
    padding: 12,
    backgroundColor: '#171923',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  claimBtn: {
    backgroundColor: '#38A169',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waitingBtn: {
    backgroundColor: '#2D3748',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  waitingBtnText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '600',
  },
});
