import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user, session, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Halo,</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.placeholderCard}>
          <Ionicons name="grid-outline" size={48} color="#94A3B8" />
          <Text style={styles.placeholderTitle}>Heatmap akan ada di sini</Text>
          <Text style={styles.placeholderSubtitle}>
            Mulai mencatat emosimu setiap hari untuk melihat pola kebahagiaanmu.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => alert('Fitur catat emosi akan segera hadir!')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcome: {
    fontSize: 16,
    color: '#64748B',
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  placeholderCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginBottom: 80,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 24,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
