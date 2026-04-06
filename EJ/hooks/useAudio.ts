import { useState, useEffect } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadSound = async (source: AVPlaybackSource) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: false, isLooping: true, volume }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound', error);
    }
  };

  const toggleSound = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const updateVolume = async (newVolume: number) => {
    setVolume(newVolume);
    if (sound) {
      await sound.setVolumeAsync(newVolume);
    }
  };

  return { loadSound, toggleSound, isPlaying, volume, updateVolume };
};
