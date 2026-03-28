import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔍',
    title: 'Detect Deepfakes',
    desc:  'Upload any video and our AI will analyze every frame for signs of manipulation.'
  },
  {
    emoji: '⚡',
    title: 'Results in Seconds',
    desc:  'EfficientNet AI processes your video in under 10 seconds with 85%+ accuracy.'
  },
  {
    emoji: '🔒',
    title: 'Your Data is Safe',
    desc:  'Videos are deleted immediately after analysis. We never store your footage.'
  },
];

export default function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        {!isLast && (
          <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => isLast ? onDone() : setIndex(i => i + 1)}
          style={styles.nextBtn}
        >
          <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 32 },
  slide:     { alignItems: 'center', marginBottom: 60 },
  emoji:     { fontSize: 80, marginBottom: 24 },
  title:     { fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 16 },
  desc:      { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
  dots:      { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceLight },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  btnRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn:   { padding: 14 },
  skipText:  { color: colors.textMuted, fontSize: 15 },
  nextBtn:   { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 36, borderRadius: 50 },
  nextText:  { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});