import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function ActivateScreen() {
  const router = useRouter();
  const { user, setActivated, signOut } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const LYNK_ID_URL = 'https://lynk.id/'; // Tanti ganti dengan URL produk asli klien

  const handleActivate = async () => {
    setMessage(null);

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Silakan masukkan kode aktivasi Anda.' });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const cleanCode = code.trim().toUpperCase();
      console.log('1. Memeriksa kode di database...', cleanCode);

      const { data: codeData, error: findError } = await supabase
        .from('activation_codes')
        .select('id, is_used')
        .eq('code', cleanCode)
        .single();

      if (findError || !codeData) {
        console.error('Find Error:', findError);
        setMessage({ type: 'error', text: 'Kode tidak valid. Pastikan pengetikan Anda benar.' });
        return;
      }

      if (codeData.is_used) {
        setMessage({ type: 'error', text: 'Kode ini kedaluwarsa atau sudah diklaim pengguna lain.' });
        return;
      }

      console.log('2. Mulai klaim kode (Update RLS)...');
      const { error: updateError } = await supabase
        .from('activation_codes')
        .update({
          is_used: true,
          used_by_user_id: user.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      console.log('3. Klaim berhasil!');
      setMessage({ type: 'success', text: 'Aktivasi Berhasil! Membuka Ruang Jurnal Anda...' });

      // Beri jeda 1.5 detik agar kustomer sempat membaca pesan sukes sebelum dilempar
      setTimeout(() => {
        setActivated(true);
      }, 1500);

    } catch (error: any) {
      console.error('Activation try-catch error:', error);
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Gagal signout Supabase, tetap paksa keluar lokal:', e);
    } finally {
      signOut();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
          <Text style={styles.logoutText}>Ganti Akun</Text>
        </TouchableOpacity>

        <View style={styles.topSection}>
          <View style={styles.iconWrapper}>
            <Ionicons name="key-outline" size={48} color="#4F46E5" />
          </View>
          <Text style={styles.title}>Satu Langkah Lagi!</Text>
          <Text style={styles.subtitle}>
            Masukkan Kode Aktivasi yang Anda terima melalui email setelah pembelian untuk membuka akses.
          </Text>
        </View>

        <View style={styles.formSection}>
          {message && (
            <View style={[styles.messageBox, message.type === 'error' ? styles.messageBoxError : styles.messageBoxSuccess]}>
              <Ionicons
                name={message.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={20}
                color={message.type === 'error' ? '#EF4444' : '#10B981'}
              />
              <Text style={[styles.messageText, message.type === 'error' ? styles.messageTextError : styles.messageTextSuccess]}>
                {message.text}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="barcode-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: EJ-X9K2P"
              placeholderTextColor="#94A3B8"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (message) setMessage(null); // Sembunyikan notifikasi saat user mulai mengetik ulang
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Aktivasi Akun</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Belum punya kode aktivasi?</Text>
          <TouchableOpacity onPress={() => Linking.openURL(LYNK_ID_URL)}>
            <Text style={styles.footerLink}>Beli Akses di Lynk.id</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoutBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    letterSpacing: 2,
  },
  button: {
    height: 56,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  messageBoxError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  messageBoxSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  messageTextError: {
    color: '#DC2626',
  },
  messageTextSuccess: {
    color: '#059669',
  },
});
