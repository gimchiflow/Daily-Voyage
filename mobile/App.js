import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import TodayScreen from './src/screens/TodayScreen';
import ProfileScreen from './src/screens/ProfileScreen';

function MainApp() {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [tab, setTab] = useState('today');

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🧭</Text>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (!user && !guestMode) {
    return <AuthScreen onGuest={() => setGuestMode(true)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <View style={styles.tabBar}>
        {[
          { id: 'today', icon: '📅', label: 'Today' },
          { id: 'profile', icon: '👤', label: 'Profile' },
        ].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={styles.tabItem}>
            <Text style={[styles.tabIcon, tab === t.id && styles.tabIconActive]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 24, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  tabLabelActive: { color: '#3b82f6', fontWeight: '700' },
});
