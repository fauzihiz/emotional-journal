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
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minWidth: 72,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#fff',
  },
});
