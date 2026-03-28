```jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { colors } from '../theme/colors';
import AnimatedBar from '../components/AnimatedBar';
import { API_BASE } from '../config';
import ShareButton from '../components/ShareButton';
import {
  sendLocalNotification,
  registerForPushNotifications
} from '../notifications/pushService';

const VERDICT_CONFIG = {
  AUTHENTIC:  { emoji: '✅', color: colors.authentic, label: 'Authentic Video' },
  FAKE:       { emoji: '❌', color: colors.fake,      label: 'Deepfake Detected' },
  SUSPICIOUS: { emoji: '⚠️', color: colors.suspicious, label: 'Suspicious' },
  NO_FACES:   { emoji: '👤', color: colors.neutral,   label: 'No Faces Found' },
  DEMO_MODE:  { emoji: '🔧', color: colors.primary,   label: 'Demo Mode' },
};

export default function HomeScreen() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const pickVideo = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4', 'video/x-msvideo', 'video/quicktime'],
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;

      const asset = res.assets[0];
      setFile(asset);
      setResult(null);
      setError(null);
    } catch (e) {
      Alert.alert('Error', 'Could not pick file: ' + e.message);
    }
  };

  const analyzeVideo = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'video/mp4',
    });

    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/detect/video`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setResult(res.data);

      // 🔔 Trigger notification
      sendLocalNotification(
        'Analysis Complete',
        `${res.data.verdict} — ${(res.data.confidence * 100).toFixed(0)}% confidence`
      );

    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Could not reach server. Check your connection and API_BASE URL.');
      }
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const cfg = result
    ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.DEMO_MODE)
    : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔍 TruthLens</Text>
      <Text style={styles.subtitle}>AI-Powered Deepfake Detection</Text>

      {!result && (
        <TouchableOpacity style={styles.uploadBox} onPress={pickVideo} activeOpacity={0.8}>
          <Text style={styles.uploadIcon}>{file ? '📹' : '📤'}</Text>
          <Text style={styles.uploadText}>
            {file ? file.name : 'Tap to select video'}
          </Text>
          {file && (
            <Text style={styles.fileSize}>
              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.formats}>Supports: MP4, AVI, MOV — Max 100 MB</Text>

      {file && !uploading && !result && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeVideo} activeOpacity={0.85}>
          <Text style={styles.analyzeBtnText}>🔍 Analyze Video</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing... Please wait</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && cfg && (
        <View style={[styles.resultCard, { borderTopColor: cfg.color }]}>
          <Text style={styles.resultEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.resultVerdict, { color: cfg.color }]}>{cfg.label}</Text>

          <AnimatedBar
            label="Confidence"
            value={result.confidence * 100}
            color={cfg.color}
          />
          <AnimatedBar
            label="Fake Probability"
            value={result.fake_probability * 100}
            color={result.fake_probability > 0.5 ? colors.fake : colors.authentic}
          />

          <View style={styles.statsGrid}>
            <StatBox label="Frames Analyzed" value={result.frames_analyzed} />
            <StatBox label="Total Frames" value={result.total_frames} />
            {result.processing_time_sec !== undefined && (
              <StatBox label="Process Time" value={`${result.processing_time_sec}s`} />
            )}
          </View>

          <Text style={styles.filename}>📁 {result.filename}</Text>

          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: cfg.color }]}
            onPress={reset}
          >
            <Text style={[styles.resetText, { color: cfg.color }]}>
              🔄 Try Another Video
            </Text>
          </TouchableOpacity>

          <ShareButton result={result} />
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, alignItems: 'center', paddingBottom: 60 },
  title: { fontSize: 36, fontWeight: 'bold', color: colors.text, marginTop: 40, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 30 },
  uploadBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceLight,
    borderStyle: 'dashed',
    marginBottom: 10
  },
  uploadIcon: { fontSize: 36, marginBottom: 10 },
  uploadText: { fontSize: 16, color: colors.text, textAlign: 'center' },
  fileSize: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  formats: { fontSize: 12, color: colors.textFaint, marginBottom: 20 },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    marginTop: 10
  },
  analyzeBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  loadingBox: { marginTop: 30, alignItems: 'center' },
  loadingText: { color: colors.textMuted, fontSize: 14, marginTop: 10 },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(235,51,73,0.12)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(235,51,73,0.4)'
  },
  errorTitle: { color: colors.error, fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  errorText: { color: colors.textMuted, fontSize: 13 },
  dismissBtn: { marginTop: 12 },
  dismissText: { color: colors.error, fontSize: 13 },
  resultCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    borderTopWidth: 5,
    marginTop: 10
  },
  resultEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 6 },
  resultVerdict: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    width: '47%'
  },
  statLabel: { fontSize: 11, color: '#999' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 4 },
  filename: { color: '#aaa', fontSize: 12, marginTop: 16 },
  resetBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center'
  },
  resetText: { fontWeight: 'bold', fontSize: 14 },
});
```
