import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { EMOTIONS, Emotion, getCalmnessLabel } from '@/constants/emotions';
import { useAudio } from '@/hooks/useAudio';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

// --- Helper Components ---

const ProgressIndicator = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.progressBar}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.progressDot,
          i + 1 <= current && styles.progressDotActive,
          i + 1 === current && styles.progressDotCurrent,
        ]}
      />
    ))}
  </View>
);

// --- Main Screen ---

export default function ReleaseSessionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Session State
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [timerLeft, setTimerLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [releasedText, setReleasedText] = useState('');
  const [beforeScore, setBeforeScore] = useState(5);
  const [afterScore, setAfterScore] = useState(5);
  const [reflectionIndex, setReflectionIndex] = useState(0);

  useEffect(() => {
    // Randomize reflection on mount
    setReflectionIndex(Math.floor(Math.random() * 2));
  }, []);

  // Breathing State (Step 1)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathLabel, setBreathLabel] = useState('Tarik napas lewat hidung');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycle, setBreathCycle] = useState(0);

  // Audio
  const { loadSound, toggleSound, isPlaying } = useAudio();

  useEffect(() => {
    // Defer audio loading for a smooth transition.
    // Using local bundled asset from assets/audio/calm.mp3
    const audioTimeout = setTimeout(() => {
      loadSound(require('@/assets/audio/calm.mp3'));
    }, 800);
    return () => clearTimeout(audioTimeout);
  }, []);

  // Animations
  const pulseValue = useSharedValue(1);
  const dissolveOpacity = useSharedValue(1);
  const dissolveScale = useSharedValue(1);
  const breathingPulse = useSharedValue(1);

  // Timer Management
  useEffect(() => {
    if (isTimerRunning && timerLeft > 0) {
      const interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timerLeft === 0) {
      setIsTimerRunning(false);
    }
  }, [isTimerRunning, timerLeft]);

  const startPulse = () => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  };

  const handleDissolve = () => {
    dissolveOpacity.value = withTiming(0, { duration: 2000 });
    dissolveScale.value = withTiming(1.5, { duration: 2000 }, () => {
      runOnJS(setStep)(5);
    });
  };

  useEffect(() => {
    let interval: any;
    let animTimeout: any;

    if ((step === 1 || step === 3 || step === 5) && isBreathingActive) {
      // Defer breathing animation initialization
      animTimeout = setTimeout(() => {
        // Pulse animation (4s inhale / 6s exhale)
        breathingPulse.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
            withTiming(1, { duration: 6000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
          ),
          -1
        );
      }, 400);

      // Countdown logic
      interval = setInterval(() => {
        setBreathTimer((t) => {
          if (t > 1) return t - 1;

          // Toggle label and reset timer based on current phase
          setBreathLabel((prev) => {
            const isFinishedInhale = prev.includes('Tarik');
            if (isFinishedInhale) {
              setBreathTimer(6);
              return 'Buang napas lewat mulut';
            } else {
              setBreathTimer(4);
              setBreathCycle((c) => c + 1);
              return 'Tarik napas lewat hidung';
            }
          });
          return 0; // Temp placeholder during label switch
        });
      }, 1000);

      return () => {
        clearTimeout(animTimeout);
        clearInterval(interval);
      };
    } else if (step === 4) {
      setIsTimerRunning(true);
      startPulse();
    } else {
      setIsTimerRunning(false);
      pulseValue.value = 1;
      breathingPulse.value = 1;
    }
  }, [step, isBreathingActive]);

  // Animated Styles
  const animatedBreathing = useAnimatedStyle(() => ({
    transform: [{ scale: breathingPulse.value }],
    opacity: 0.3 + (breathingPulse.value - 1) * 0.8,
  }));

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: 0.5 + (pulseValue.value - 1) * 2,
  }));

  const animatedDissolve = useAnimatedStyle(() => ({
    opacity: dissolveOpacity.value,
    transform: [{ scale: dissolveScale.value }],
  }));

  const saveSession = async () => {
    if (!user || !selectedEmotion) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('release_sessions').insert({
        user_id: user.id,
        emotion_id: selectedEmotion.id,
        released_text: releasedText,
        before_score: beforeScore,
        after_score: afterScore,
        duration: sessionDuration,
      });

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Gagal menyimpan sesi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);

  // --- Render Steps ---

  // Step 1: Introduction & Breathing 4-6
  const renderStep1 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <View style={styles.therapyBadgeContainer}>
        <Text style={styles.therapyBadge}>Letting Flow Therapy</Text>
      </View>

      {!isBreathingActive ? (
        <>
          <Text style={styles.instructionText}>
            Mari kita mulai dengan mengatur pernapasan agar rileks
          </Text>
          <View style={styles.breathingGuideBox}>
            <View style={styles.guideItem}>
              <Ionicons name="caret-up-circle" size={24} color="#6366F1" />
              <Text style={styles.guideText}>Tarik napas lewat <Text style={styles.boldText}>hidung</Text> (4 detik)</Text>
            </View>
            <View style={styles.guideItem}>
              <Ionicons name="caret-down-circle" size={24} color="#EF4444" />
              <Text style={styles.guideText}>Buang napas lewat <Text style={styles.boldText}>mulut</Text> (6 detik)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsBreathingActive(true)}>
            <Text style={styles.buttonText}>Mulai Bernapas</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.breathingCircle, animatedBreathing]} />
            <View style={styles.breathingInner}>
              <Text style={styles.breathCountdown}>{breathTimer}</Text>
              <Text style={styles.breathingLabel}>{breathLabel}</Text>
              <Text style={styles.cycleText}>Siklus Selesai: {breathCycle}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
            <Text style={styles.buttonText}>
              {breathCycle >= 1 ? 'Lanjutkan' : 'Lewati & Mulai'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );

  // Step 2: Letting Come (Hadir)
  const renderStep2 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>1. Letting Come (Hadir)</Text>
      <Text style={styles.subtitle}>
        Izinkan perasaan ini hadir. Jangan ditolak, jangan ditekan. Apa yang kamu rasakan saat ini?
      </Text>
      <View style={styles.emotionGrid}>
        {EMOTIONS.slice(0, 6).map((emp) => (
          <TouchableOpacity
            key={emp.id}
            style={[
              styles.emotionItem,
              selectedEmotion?.id === emp.id && { backgroundColor: emp.color + '40', borderColor: emp.color }
            ]}
            onPress={() => setSelectedEmotion(emp)}
          >
            <Text style={styles.emotionEmoji}>{emp.emoji}</Text>
            <Text style={styles.emotionLabel}>{emp.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, !selectedEmotion && styles.buttonDisabled]}
        onPress={nextStep}
        disabled={!selectedEmotion}
      >
        <Text style={styles.buttonText}>Lanjutkan</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Step 3: Letting Stay (Amati)
  const renderStep3 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>2. Letting Stay (Amati)</Text>
      <Text style={styles.subtitle}>Saksikan & Amati perasaan ini... Biarkan ia mengalir sambil menjaga ritme napasmu.</Text>

      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.breathingCircle, animatedBreathing]} />
        <View style={styles.breathingInner}>
          <Text style={styles.breathCountdown}>{breathTimer}</Text>
          <Text style={styles.breathingLabel}>{breathLabel}</Text>
        </View>
      </View>

      <View style={styles.timerMiniBox}>
        <Ionicons name="time-outline" size={16} color="#94A3B8" />
        <Text style={styles.timerMiniText}>{timerLeft}s</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
        <Text style={styles.buttonText}>Berikutnya</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Step 4: Letting Go (Merelakan)
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>3. Letting Go (Merelakan)</Text>
      <Text style={styles.subtitle}>Tuangkan apa yang ingin kamu lepaskan. Merelakan adalah membebaskan diri.</Text>

      <Animated.View style={[styles.inputWrapper, animatedDissolve]}>
        <TextInput
          style={styles.textArea}
          placeholder="Tuliskan di sini..."
          placeholderTextColor="#64748B"
          multiline
          value={releasedText}
          onChangeText={setReleasedText}
        />
      </Animated.View>

      <TouchableOpacity
        style={[styles.releaseButton, !releasedText && styles.buttonDisabled]}
        onPress={handleDissolve}
        disabled={!releasedText}
      >
        <Text style={styles.buttonText}>Lepaskan</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 5: Post-Release Breathing
  const renderStep5 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>Menstabilkan</Text>
      <Text style={styles.subtitle}>Bagus. Sekarang mari stabilkan kembali perasaanmu dengan napas sejenak.</Text>
      
      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.breathingCircle, animatedBreathing]} />
        <View style={styles.breathingInner}>
          <Text style={styles.breathCountdown}>{breathTimer}</Text>
          <Text style={styles.breathingLabel}>{breathLabel}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
        <Text style={styles.buttonText}>Lanjutkan ke Refleksi</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Step 6: Letting God (Reflection)
  const renderStep6 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>4. Letting God (Menyerahkan)</Text>
      <Ionicons name="sparkles" size={64} color="#FACC15" style={{ marginBottom: 24 }} />
      
      <View style={styles.reflectionBox}>
        {reflectionIndex === 0 ? (
          <>
            <Text style={styles.reflectionText}>
              Perasaan kita valid.{"\n"}
              Ia hadir bukan untuk dilawan, tapi untuk dipahami.
            </Text>
            <Text style={styles.reflectionTextSecondary}>
              Karena pada akhirnya, apa pun yang Allah titipkan, ambil, atau gantikan...{"\n\n"}
              Semuannya selalu yang terbaik, meski hati butuh waktu untuk mengerti.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.reflectionText}>
              Segala rasa yang hadir, boleh jadi adalah bentuk kebaikan dari Allah.
            </Text>
            <Text style={styles.reflectionTextSecondary}>
              Meski di awal terasa berat, perlahan kita akan melihat maknanya.{"\n\n"}
              Dia sebaik-baiknya perancang skenario kehidupan.
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
        <Text style={styles.buttonText}>Lanjutkan</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Step 7: Final Score
  const renderStep7 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.pillarTitle}>Selesai</Text>
      <View style={styles.iconCircleLarge}>
        <Ionicons name="leaf" size={48} color="#10B981" />
      </View>

      <View style={styles.sliderSection}>
        <Text style={styles.sliderValueText}>{afterScore} ({getCalmnessLabel(afterScore)})</Text>
        <Text style={styles.sliderLabel}>Seberapa tenang perasaanmu sekarang? (1-10)</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={afterScore}
          onValueChange={setAfterScore}
          minimumTrackTintColor="#4F46E5"
          maximumTrackTintColor="#1E293B"
          thumbTintColor="#4F46E5"
        />
        <View style={styles.sliderTicks}>
          <Text style={styles.tickText}>Masih Berat</Text>
          <Text style={styles.tickText}>Sangat Tenang</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={saveSession} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan & Selesai</Text>}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#94A3B8" />
        </TouchableOpacity>
        <ProgressIndicator current={step} total={7} />
        <TouchableOpacity onPress={toggleSound} style={styles.audioBtn}>
          <Ionicons name={isPlaying ? "volume-high" : "volume-mute"} size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeBtn: { padding: 8 },
  audioBtn: { padding: 8 },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
  },
  progressDotActive: {
    backgroundColor: '#4F46E5',
  },
  progressDotCurrent: {
    width: 12,
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  therapyBadgeContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  therapyBadge: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 22,
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '600',
    marginBottom: 40,
  },
  breathingContainer: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  breathingCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366F1',
  },
  breathingInner: {
    alignItems: 'center',
  },
  breathCountdown: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  breathingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  cycleText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  emotionItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionEmoji: { fontSize: 32, marginBottom: 4 },
  emotionLabel: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },
  timerContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366F1',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 40,
  },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    height: 180,
    color: '#F8FAFC',
    fontSize: 18,
    textAlignVertical: 'top',
  },
  releaseButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 24,
    elevation: 8,
  },
  sliderSection: {
    width: '100%',
    marginVertical: 40,
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 8,
    textAlign: 'center',
  },
  sliderLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  tickText: {
    color: '#64748B',
    fontSize: 12,
  },
  breathingGuideBox: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  boldText: {
    fontWeight: '800',
    color: '#fff',
  },
  reflectionBox: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 32,
    width: '100%',
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  reflectionText: {
    color: '#F8FAFC',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  reflectionTextSecondary: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  iconCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerMiniBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  timerMiniText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
});
