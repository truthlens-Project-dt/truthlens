import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, Easing
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

export default function AnimatedBar({ label, value, color, delay = 0 }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(value, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.pct, { color }]}>{value.toFixed(1)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { marginBottom: 14 },
  labelRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label:      { fontSize: 13, color: '#666' },
  pct:        { fontSize: 13, fontWeight: 'bold' },
  track:      { height: 8, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 10 },
});