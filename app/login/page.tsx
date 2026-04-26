'use client'

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Masukkan email dan password terlebih dahulu');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const { error: signInError, data } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else if (data.session) {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      setError('Masukkan email dan password terlebih dahulu');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const { error: signUpError, data } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
    } else if (!data.session) {
      setMessage('Cek email kamu untuk link konfirmasi!');
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[34px] font-extrabold text-[#1E293B] mb-2 tracking-tight">
            Jurnal Emosi
          </h1>
          <p className="text-base text-[#64748B] leading-6">
            Catat perasaanmu, temukan dirimu.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1 shadow-sm">
            <button
              className={[
                'flex-1 h-10 rounded-xl text-sm font-bold transition-colors',
                mode === 'login'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]',
              ].join(' ')}
              onClick={() => {
                setMode('login');
                setError('');
                setMessage('');
              }}
              disabled={loading}
            >
              Masuk
            </button>
            <button
              className={[
                'flex-1 h-10 rounded-xl text-sm font-bold transition-colors',
                mode === 'register'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]',
              ].join(' ')}
              onClick={() => {
                setMode('register');
                setError('');
                setMessage('');
              }}
              disabled={loading}
            >
              Daftar
            </button>
          </div>

          {error && (
            <div className="bg-[#FEE2E2] p-3 rounded-lg">
              <p className="text-[#DC2626] text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-[#DCFCE7] p-3 rounded-lg">
              <p className="text-[#16A34A] text-sm">{message}</p>
            </div>
          )}

          <div className="flex items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm">
            <svg className="w-5 h-5 text-[#666] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <input
              type="email"
              className="flex-1 text-base text-[#1E293B] bg-transparent outline-none h-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
            />
          </div>

          <div className="flex items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm">
            <svg className="w-5 h-5 text-[#666] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input
              type="password"
              className="flex-1 text-base text-[#1E293B] bg-transparent outline-none h-full"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="flex items-center justify-center h-[60px] bg-[#4F46E5] rounded-2xl mt-3 shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA] transition-colors disabled:opacity-60"
            onClick={mode === 'login' ? handleEmailSignIn : handleEmailSignUp}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <svg className="w-5 h-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span className="text-white text-base font-bold">
                  {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
                </span>
              </>
            )}
          </button>

          {mode === 'login' ? (
            <button
              className="h-12 text-[#4F46E5] font-semibold text-[15px] hover:underline"
              onClick={() => {
                setMode('register');
                setError('');
                setMessage('');
              }}
              disabled={loading}
            >
              Daftar Akun Baru
            </button>
          ) : (
            <button
              className="h-12 text-[#4F46E5] font-semibold text-[15px] hover:underline"
              onClick={() => {
                setMode('login');
                setError('');
                setMessage('');
              }}
              disabled={loading}
            >
              Sudah punya akun? Masuk
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="mx-4 text-xs text-[#94A3B8] font-semibold">ATAU</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Google */}
          <button
            className="flex items-center justify-center h-[60px] bg-white rounded-2xl shadow-sm hover:bg-[#F8FAFC] transition-colors"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-base text-[#1E293B] font-semibold">Lanjutkan dengan Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
