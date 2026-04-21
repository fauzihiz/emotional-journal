'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { EMOTIONS, Emotion, getCalmnessLabel } from '@/constants/emotions';

// --- Helper Components ---

function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i + 1 <= current
              ? i + 1 === current
                ? 'w-3 bg-[#6366F1]'
                : 'w-1.5 bg-[#4F46E5]'
              : 'w-1.5 bg-[#1E293B]'
          }`}
        />
      ))}
    </div>
  );
}

function BreathingCircle({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute w-[140px] h-[140px] rounded-full bg-[#6366F1] transition-transform duration-[4000ms] ease-in-out ${
        active ? 'animate-breathe' : ''
      }`}
    />
  );
}

// --- Main Screen ---

export default function ReleaseSessionScreen() {
  const router = useRouter();
  const supabase = createClient();
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
    setReflectionIndex(Math.floor(Math.random() * 2));
  }, []);

  // Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathLabel, setBreathLabel] = useState('Tarik napas lewat hidung');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycle, setBreathCycle] = useState(0);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio('/audio/calm.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Dissolve state
  const [isDissolving, setIsDissolving] = useState(false);

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

  // Breathing logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if ((step === 1 || step === 3 || step === 4 || step === 6) && isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((t) => {
          if (t > 1) return t - 1;

          setBreathLabel((prev) => {
            if (prev.includes('Tarik')) {
              setBreathTimer(1);
              return 'Tahan napas';
            } else if (prev.includes('Tahan')) {
              setBreathTimer(6);
              return 'Buang napas lewat mulut';
            } else {
              setBreathTimer(4);
              setBreathCycle((c) => c + 1);
              return 'Tarik napas lewat hidung';
            }
          });
          return 0;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (step === 5) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [step, isBreathingActive]);

  const handleDissolve = () => {
    setIsDissolving(true);
    setTimeout(() => {
      setStep(6);
      setIsDissolving(false);
    }, 2000);
  };

  const saveSession = async () => {
    if (!selectedEmotion) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('release_sessions').insert({
        user_id: user.id,
        emotion_id: selectedEmotion.id,
        released_text: releasedText,
        before_score: beforeScore,
        after_score: afterScore,
        duration: sessionDuration,
      });

      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Gagal menyimpan sesi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <div className="bg-[#1E293B] px-4 py-1.5 rounded-[20px] mb-5">
        <span className="text-[#6366F1] text-xs font-bold uppercase tracking-[1px]">
          Sesi Release Emosi
        </span>
      </div>

      {!isBreathingActive ? (
        <>
          <p className="text-[22px] text-[#F8FAFC] text-center leading-9 font-semibold mb-10">
            Mari kita mulai dengan mengatur pernapasan agar rileks.{'\n'}
            Silakan posisikan diri senyaman mungkin, sadari napas, dan ikuti panduan berikut.
          </p>
          <div className="bg-[#1E293B] p-6 rounded-3xl w-full mb-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-[#F8FAFC] text-base">Tarik napas lewat <strong className="text-white">hidung</strong> (4 detik)</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-[#F8FAFC] text-base">Tahan napas (1 detik)</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-[#F8FAFC] text-base">Buang napas lewat <strong className="text-white">mulut</strong> (6 detik)</span>
            </div>
          </div>
          <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={() => setIsBreathingActive(true)}>
            <span className="text-white text-base font-bold">Mulai Bernapas</span>
          </button>
        </>
      ) : (
        <>
          <div className="w-[260px] h-[260px] flex items-center justify-center relative mb-[50px]">
            <BreathingCircle active={isBreathingActive} />
            <div className="flex flex-col items-center z-10">
              <span className="text-[56px] font-black text-white mb-2.5">{breathTimer}</span>
              <span className="text-lg font-bold text-white text-center">{breathLabel}</span>
              <span className="text-sm text-[#94A3B8] mt-3">Siklus Selesai: {breathCycle}</span>
            </div>
          </div>
          <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={nextStep}>
            <span className="text-white text-base font-bold">
              {breathCycle >= 1 ? 'Lanjutkan' : 'Lewati & Mulai'}
            </span>
          </button>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">1. Sadari perasaan yang datang</h2>
      <p className="text-base text-[#94A3B8] text-center mb-8 leading-6">
        Hadirkan kesadaran penuh. Rasakan apa yang sedang bergejolak di dalam dirimu saat ini.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {EMOTIONS.slice(0, 6).map((emp) => (
          <button
            key={emp.id}
            className="w-[30%] aspect-square bg-[#1E293B] rounded-[20px] flex flex-col items-center justify-center border-2 transition-all"
            style={{
              borderColor: selectedEmotion?.id === emp.id ? emp.color : 'transparent',
              backgroundColor: selectedEmotion?.id === emp.id ? emp.color + '40' : '#1E293B',
            }}
            onClick={() => setSelectedEmotion(emp)}
          >
            <span className="text-[32px] mb-1">{emp.emoji}</span>
            <span className="text-[#F8FAFC] text-[11px] font-semibold">{emp.label}</span>
          </button>
        ))}
      </div>
      <button
        className={`px-10 py-[18px] rounded-[20px] ${selectedEmotion ? 'bg-[#4F46E5] shadow-lg shadow-[#4F46E5]/30' : 'bg-[#1E293B]'}`}
        onClick={nextStep}
        disabled={!selectedEmotion}
      >
        <span className="text-white text-base font-bold">Lanjutkan</span>
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">2. Izinkan perasaan itu ada</h2>
      <p className="text-base text-[#94A3B8] text-center mb-8 leading-6">
        Jangan ditolak, jangan ditekan. Amati saja keberadaannya sambil terus bernapas tenang.
      </p>
      <div className="w-[260px] h-[260px] flex items-center justify-center relative mb-[50px]">
        <BreathingCircle active={isBreathingActive} />
        <div className="flex flex-col items-center z-10">
          <span className="text-[56px] font-black text-white mb-2.5">{breathTimer}</span>
          <span className="text-lg font-bold text-white text-center">{breathLabel}</span>
        </div>
      </div>
      <div className="flex items-center bg-[#1E293B] px-4 py-2 rounded-xl gap-2 mb-10">
        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-sm text-[#94A3B8] font-bold">{timerLeft}s</span>
      </div>
      <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={nextStep}>
        <span className="text-white text-base font-bold">Berikutnya</span>
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">3. Rasakan, jangan dilawan</h2>
      <p className="text-base text-[#94A3B8] text-center mb-8 leading-6">
        Biarkan ia mengalir sepenuhnya. Rasakan sensasinya di tubuhmu tanpa memberikan perlawanan.
      </p>
      <div className="w-[260px] h-[260px] flex items-center justify-center relative mb-[50px]">
        <BreathingCircle active={isBreathingActive} />
        <div className="flex flex-col items-center z-10">
          <span className="text-[56px] font-black text-white mb-2.5">{breathTimer}</span>
          <span className="text-lg font-bold text-white text-center">{breathLabel}</span>
        </div>
      </div>
      <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={nextStep}>
        <span className="text-white text-base font-bold">Lanjutkan</span>
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">4. Lepaskan, biarkan mengalir</h2>
      <p className="text-base text-[#94A3B8] text-center mb-8 leading-6">
        Tuliskan apa yang ingin kamu lepaskan. Biarkan ia mengalir keluar bersama tulisanmu.
      </p>
      <div className={`w-full mb-10 transition-all duration-[2000ms] ${isDissolving ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}>
        <textarea
          className="w-full bg-[#1E293B] rounded-3xl p-6 h-[180px] text-[#F8FAFC] text-lg resize-none outline-none"
          placeholder="Tuliskan di sini..."
          value={releasedText}
          onChange={(e) => setReleasedText(e.target.value)}
        />
      </div>
      <button
        className={`px-10 py-5 rounded-3xl ${releasedText ? 'bg-[#EF4444]' : 'bg-[#1E293B]'}`}
        onClick={handleDissolve}
        disabled={!releasedText || isDissolving}
      >
        <span className="text-white text-base font-bold">
          {isDissolving ? 'Melepaskan...' : 'Lepaskan'}
        </span>
      </button>
    </div>
  );

  const renderStep6 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">Ikhlas Seperti Napas</h2>
      <p className="text-lg text-[#F8FAFC] text-center mb-8 leading-relaxed font-semibold">
        "Ya Allah mudahkan ikhlasku semudah nafasku"
      </p>
      <div className="w-[260px] h-[260px] flex items-center justify-center relative mb-[50px]">
        <BreathingCircle active={isBreathingActive} />
        <div className="flex flex-col items-center z-10">
          <span className="text-[56px] font-black text-white mb-2.5">{breathTimer}</span>
          <span className="text-lg font-bold text-white text-center">{breathLabel}</span>
        </div>
      </div>
      <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={nextStep}>
        <span className="text-white text-base font-bold">Lanjutkan</span>
      </button>
    </div>
  );

  const renderStep7 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">5. Serahkan pada Allah</h2>
      <span className="text-[64px] mb-6">✨</span>

      <div className="bg-[#1E293B] p-8 rounded-[32px] w-full mb-10 border-l-4 border-l-[#6366F1]">
        {reflectionIndex === 0 ? (
          <>
            <p className="text-[#F8FAFC] text-lg leading-7 font-semibold mb-5 italic">
              Perasaan kita valid.{'\n'}
              Ia hadir bukan untuk dilawan, tapi untuk dipahami.
            </p>
            <p className="text-[#94A3B8] text-[15px] leading-6 font-medium">
              Karena pada akhirnya, apa pun yang Allah titipkan, ambil, atau gantikan...
              {'\n\n'}
              Semuannya selalu yang terbaik, meski hati butuh waktu untuk mengerti.
            </p>
          </>
        ) : (
          <>
            <p className="text-[#F8FAFC] text-lg leading-7 font-semibold mb-5 italic">
              Segala rasa yang hadir, boleh jadi adalah bentuk kebaikan dari Allah.
            </p>
            <p className="text-[#94A3B8] text-[15px] leading-6 font-medium">
              Meski di awal terasa berat, perlahan kita akan melihat maknanya.
              {'\n\n'}
              Allah sebaik-baiknya perancang skenario kehidupan.
            </p>
          </>
        )}
      </div>

      <button className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30" onClick={nextStep}>
        <span className="text-white text-base font-bold">Lanjutkan</span>
      </button>
    </div>
  );

  const renderStep8 = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in">
      <h2 className="text-[22px] font-extrabold text-[#6366F1] mb-4 text-center">Selesai</h2>
      <div className="w-[100px] h-[100px] rounded-full bg-[#10B98120] flex items-center justify-center mb-10">
        <svg className="w-12 h-12 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
      </div>

      <div className="w-full my-10 flex flex-col items-center">
        <p className="text-[32px] font-black text-[#4F46E5] mb-2 text-center">
          {afterScore} ({getCalmnessLabel(afterScore)})
        </p>
        <p className="text-sm text-[#94A3B8] font-semibold mb-5 text-center">
          Seberapa tenang perasaanmu sekarang? (1-10)
        </p>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={afterScore}
          onChange={(e) => setAfterScore(Number(e.target.value))}
          className="w-full h-2 bg-[#1E293B] rounded-full appearance-none cursor-pointer accent-[#4F46E5]"
        />
        <div className="flex justify-between w-full px-2 mt-2">
          <span className="text-xs text-[#64748B]">Masih Berat</span>
          <span className="text-xs text-[#64748B]">Sangat Tenang</span>
        </div>
      </div>

      <button
        className="bg-[#4F46E5] px-10 py-[18px] rounded-[20px] shadow-lg shadow-[#4F46E5]/30 disabled:opacity-60"
        onClick={saveSession}
        disabled={loading}
      >
        {loading ? (
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <span className="text-white text-base font-bold">Simpan & Selesai</span>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#0F172A] flex flex-col">
      {/* Nav Header */}
      <div className="flex items-center justify-between px-5 pt-2.5 shrink-0">
        <button className="p-2" onClick={() => router.back()}>
          <svg className="w-7 h-7 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <ProgressIndicator current={step} total={8} />
        <button className="p-2" onClick={toggleSound}>
          {isPlaying ? (
            <svg className="w-6 h-6 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.3-3.1A1 1 0 0112 6.5v11a1 1 0 01-1.2.8L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z" /></svg>
          ) : (
            <svg className="w-6 h-6 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-md w-full">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
          {step === 8 && renderStep8()}
        </div>
      </div>
    </div>
  );
}
