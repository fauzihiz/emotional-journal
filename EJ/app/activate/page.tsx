'use client'

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function ActivatePage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const LYNK_ID_URL = 'https://lynk.id/';

  const handleActivate = async () => {
    setMessage(null);

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Silakan masukkan kode aktivasi Anda.' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setMessage({ type: 'error', text: 'Koneksi lambat. Silakan muat ulang halaman (F5).' });
    }, 10000);

    try {
      const cleanCode = code.trim().toUpperCase();

      const { data, error: findError } = await supabase
        .from('activation_codes')
        .select('id, is_used')
        .eq('code', cleanCode);

      clearTimeout(timeoutId);

      if (findError) {
        setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
        return;
      }

      const codeData = data && data.length > 0 ? data[0] : null;

      if (!codeData) {
        setMessage({ type: 'error', text: 'Kode tidak valid. Cek EJ- dan hurufnya.' });
        return;
      }

      if (codeData.is_used) {
        setMessage({ type: 'error', text: 'Kode ini sudah digunakan orang lain.' });
        return;
      }

      const { error: updateError } = await supabase
        .from('activation_codes')
        .update({
          is_used: true,
          used_by_user_id: user.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id)
        .select();

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Aktivasi Berhasil! Membuka Ruang Jurnal Anda...' });

      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal mengaktivasi. Cek koneksi internet Anda.' });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    queryClient.clear();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center p-6 relative">
      {/* Back/Ganti Akun */}
      <button
        className="absolute top-[60px] left-6 flex items-center gap-2 z-10"
        onClick={handleLogout}
      >
        <svg className="w-6 h-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        <span className="text-sm text-[#64748B] font-semibold">Ganti Akun</span>
      </button>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Top Section */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#1E293B] mb-3">
            Satu Langkah Lagi!
          </h1>
          <p className="text-[15px] text-[#64748B] leading-6 px-5">
            Masukkan Kode Aktivasi yang Anda terima melalui email setelah pembelian untuk membuka akses.
          </p>
        </div>

        {/* Form */}
        <div className="w-full">
          {message && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl mb-4 border ${
                message.type === 'error'
                  ? 'bg-[#FEF2F2] border-[#FECACA]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0]'
              }`}
            >
              {message.type === 'error' ? (
                <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <p className={`text-sm font-medium leading-5 ${
                message.type === 'error' ? 'text-[#DC2626]' : 'text-[#059669]'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <div className="flex items-center bg-white border border-[#E2E8F0] rounded-2xl px-4 h-14 mb-4">
            <svg className="w-5 h-5 text-[#94A3B8] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            <input
              type="text"
              className="flex-1 text-base text-[#1E293B] font-semibold tracking-[2px] bg-transparent outline-none"
              placeholder="Contoh: EJ-X9K2P"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (message) setMessage(null);
              }}
              style={{ textTransform: 'uppercase' }}
              disabled={loading}
            />
          </div>

          <button
            className={`w-full h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA] transition-all ${loading ? 'opacity-70' : ''}`}
            onClick={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <span className="text-white text-base font-bold">Aktivasi Akun</span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#94A3B8] mb-2">Belum punya kode aktivasi?</p>
          <a
            href={LYNK_ID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-[#4F46E5] font-bold hover:underline"
          >
            Beli Akses di Lynk.id
          </a>
        </div>
      </div>
    </div>
  );
}
