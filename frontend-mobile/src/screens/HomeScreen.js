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
  FAKE:       { emoji: '❌', color: colors.fake, label: 'Deepfake Detected' },
  SUSPICIOUS: { emoji: '⚠️', color: colors.suspicious, label: 'Suspicious' },
  NO_FACES:   { emoji: '👤', color: colors.neutral, label: 'No Faces Found' },
  DEMO_MODE:  { emoji: '🔧', color: colors.primary, label: 'Demo Mode' },
};

export default function HomeScreen() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Register push notifications ONCE
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
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setResult(res.data);

      // 🔔 Notification AFTER success
      sendLocalNotification(
        'Analysis Complete',
        `${res.data.verdict} — ${(res.data.confidence * 100).toFixed(0)}% confidence`
      );

    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Could not reach server. Check your connection and API_BASE.');
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
        <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
          <Text style={styles.uploadIcon}>{file ? '📹' : '📤'}</Text>
          <Text style={styles.uploadText}>
            {file ? file.name : 'Tap to select video'}
          </Text>

          {file?.size && (
            <Text style={styles.fileSize}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.formats}>
        Supports: MP4, AVI, MOV — Max 100 MB
      </Text>

      {file && !uploading && !result && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeVideo}>
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
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && cfg && (
        <View style={[styles.resultCard, { borderTopColor: cfg.color }]}>
          <Text style={styles.resultEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.resultVerdict, { color: cfg.color }]}>
            {cfg.label}
          </Text>

          <AnimatedBar
            label="Confidence"
            value={result.confidence * 100}
            color={cfg.color}
          />

          <AnimatedBar
            label="Fake Probability"
            value={result.fake_probability * 100}
            color={
              result.fake_probability > 0.5
                ? colors.fake
                : colors.authentic
            }
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