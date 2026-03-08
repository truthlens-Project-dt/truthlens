import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { colors } from '../theme/colors';

export default function ShareButton({ result }) {
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    setSharing(true);
    try {
      const verdictEmoji = {
        AUTHENTIC: '✅', FAKE: '❌', SUSPICIOUS: '⚠️',
        NO_FACES: '👤', DEMO_MODE: '🔧'
      }[result.verdict] || '❓';

      const text = [
        `${verdictEmoji} TruthLens Deepfake Detection`,
        ``,
        `File:       ${result.filename}`,
        `Verdict:    ${result.verdict}`,
        `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        `Fake Prob:  ${(result.fake_probability * 100).toFixed(1)}%`,
        `Frames:     ${result.frames_analyzed} / ${result.total_frames}`,
        `Time:       ${result.processing_time_sec}s`,
        ``,
        `Analyzed by TruthLens AI`
      ].join('\n');

      // Write to temp file so we can share as text
      const path = FileSystem.cacheDirectory + 'truthlens_result.txt';
      await FileSystem.writeAsStringAsync(path, text);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'text/plain',
          dialogTitle: 'Share TruthLens Result'
        });
      } else {
        Alert.alert('Share not available on this device');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={share} disabled={sharing}>
      <Text style={styles.text}>{sharing ? 'Sharing...' : '📤 Share Result'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:  {
    marginTop: 10, borderWidth: 1, borderColor: colors.primary,
    borderRadius: 50, paddingVertical: 12, alignItems: 'center'
  },
  text: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
});