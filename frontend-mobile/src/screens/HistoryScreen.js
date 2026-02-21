import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { colors } from '../theme/colors';

const API_BASE = 'http://localhost:8000';

const VERDICT_COLORS = {
  AUTHENTIC:  colors.authentic,
  FAKE:       colors.fake,
  SUSPICIOUS: colors.suspicious,
  NO_FACES:   colors.neutral,
  DEMO_MODE:  colors.primary,
};

const VERDICT_EMOJI = {
  AUTHENTIC:  '✅',
  FAKE:       '❌',
  SUSPICIOUS: '⚠️',
  NO_FACES:   '👤',
  DEMO_MODE:  '🔧',
};

export default function HistoryScreen() {
  const [history,     setHistory]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  const fetchData = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/history?limit=20`),
        axios.get(`${API_BASE}/api/v1/stats`),
      ]);
      setHistory(histRes.data.results || []);
      setStats(statsRes.data);
      setError(null);
    } catch (e) {
      setError('Could not load history. Is the backend running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={() => (
        <>
          <Text style={styles.title}>📋 History</Text>
          {stats && stats.total_detections > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>This Session</Text>
              <View style={styles.statsRow}>
                <StatPill label="Total"   value={stats.total_detections} color={colors.primary} />
                <StatPill label="Avg Time" value={`${stats.avg_processing_time}s`} color={colors.secondary} />
              </View>
              {stats.verdict_breakdown && (
                <View style={styles.statsRow}>
                  {Object.entries(stats.verdict_breakdown).map(([k, v]) => (
                    <StatPill key={k} label={k} value={v} color={VERDICT_COLORS[k] || colors.neutral} />
                  ))}
                </View>
              )}
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          {history.length === 0 && !error && (
            <Text style={styles.empty}>No detections yet. Upload a video to get started.</Text>
          )}
        </>
      )}
      data={history}
      keyExtractor={(item) => item.request_id || item.timestamp}
      renderItem={({ item }) => (
        <View style={[styles.historyItem, { borderLeftColor: VERDICT_COLORS[item.verdict] || colors.neutral }]}>
          <View style={styles.historyRow}>
            <Text style={styles.historyEmoji}>{VERDICT_EMOJI[item.verdict] || '❓'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyFile} numberOfLines={1}>{item.filename}</Text>
              <Text style={styles.historyMeta}>
                {item.verdict} • {(item.confidence * 100).toFixed(0)}% confidence
              </Text>
            </View>
            <Text style={styles.historyTime}>{item.processing_time_sec}s</Text>
          </View>
        </View>
      )}
    />
  );
}

function StatPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list:         { flex: 1, backgroundColor: colors.background },
  container:    { padding: 20, paddingBottom: 40 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title:        { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  statsCard:    { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  statsTitle:   { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  statsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  pill:         { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  pillValue:    { fontWeight: 'bold', fontSize: 16 },
  pillLabel:    { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase' },
  error:        { color: colors.error, textAlign: 'center', marginBottom: 16 },
  empty:        { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  historyItem:  {
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 10, borderLeftWidth: 4
  },
  historyRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyEmoji: { fontSize: 22 },
  historyFile:  { color: colors.text, fontSize: 14, fontWeight: '600' },
  historyMeta:  { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  historyTime:  { color: colors.textMuted, fontSize: 12 },
});