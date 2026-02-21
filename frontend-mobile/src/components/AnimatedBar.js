import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

export default function AnimatedBar({ label, value, color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value,
      duration:        900,
      useNativeDriver: false,   // width animation can't use native driver
    }).start();
  }, [value]);

  const width = anim.interpolate({
    inputRange:  [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.pct, { color }]}>{value.toFixed(1)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color, width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  labelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label:     { fontSize: 13, color: '#666' },
  pct:       { fontSize: 13, fontWeight: 'bold' },
  track:     { height: 8, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 10 },
});