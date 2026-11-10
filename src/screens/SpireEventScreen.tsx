import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SpireEvent, SpireEventOption } from '../data/spireEvents';
import { SpireHero } from '../types/spire';

interface Props {
  event: SpireEvent;
  hero: SpireHero;
  onSelectOption: (option: SpireEventOption) => void;
}

export const SpireEventScreen: React.FC<Props> = ({ event, hero, onSelectOption }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{event.icon}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subBadge}>RIFT ANOMALY DETECTED</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.optionsList}>
          {event.options.map((opt, idx) => {
            const hasEnoughGold = !opt.requiresGold || hero.gold >= opt.requiresGold;
            return (
              <TouchableOpacity
                key={idx}
                disabled={!hasEnoughGold}
                style={[styles.optionBtn, !hasEnoughGold && styles.optionDisabled]}
                onPress={() => onSelectOption(opt)}
              >
                <Text style={styles.optionText}>{opt.text}</Text>
                <Text style={styles.effectText}>{opt.effectDescription}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 22,
    borderWidth: 2,
    borderColor: '#00F0FF',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#00F0FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subBadge: {
    color: '#00F0FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  description: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: 16,
  },
  optionsList: {
    width: '100%',
    gap: 12,
  },
  optionBtn: {
    backgroundColor: '#070A13',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  optionDisabled: {
    opacity: 0.35,
    borderColor: '#334155',
  },
  optionText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '900',
  },
  effectText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});
