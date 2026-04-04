import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EMOTIONS, Emotion } from '@/constants/emotions';

interface Props {
  selected: number | null;
  onSelect: (emotion: Emotion) => void;
}

export default function EmotionPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {EMOTIONS.map((emotion) => {
        const isSelected = selected === emotion.id;
        return (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.item,
              { borderColor: emotion.color },
              isSelected && { backgroundColor: emotion.color },
            ]}
            onPress={() => onSelect(emotion)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text
              style={[
                styles.label,
                isSelected && styles.selectedLabel,
              ]}
            >
              {emotion.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 20, // squircle form
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    minWidth: 68,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emoji: {
    fontSize: 28, // slight increase
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#ffffff',
  },
});
