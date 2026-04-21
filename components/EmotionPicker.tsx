'use client'

import { EMOTIONS, Emotion } from '@/constants/emotions';

interface Props {
  selected: number | null;
  onSelect: (emotion: Emotion) => void;
}

export default function EmotionPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {EMOTIONS.map((emotion) => {
        const isSelected = selected === emotion.id;
        return (
          <button
            key={emotion.id}
            type="button"
            className="w-[22%] min-w-[68px] aspect-square rounded-[20px] flex flex-col items-center justify-center border transition-all shadow-sm"
            style={{
              borderColor: emotion.color,
              backgroundColor: isSelected ? emotion.color : '#ffffff',
            }}
            onClick={() => onSelect(emotion)}
          >
            <span className="text-[28px] mb-1">{emotion.emoji}</span>
            <span
              className="text-[11px] font-bold text-center"
              style={{ color: isSelected ? '#ffffff' : '#475569' }}
            >
              {emotion.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
