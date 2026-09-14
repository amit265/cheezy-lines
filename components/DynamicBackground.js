import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function DynamicBackground({ children }) {
  const orb1X = useSharedValue(-width * 0.2);
  const orb1Y = useSharedValue(-height * 0.1);
  const orb2X = useSharedValue(width * 0.8);
  const orb2Y = useSharedValue(height * 0.6);
  const orb3X = useSharedValue(width * 0.3);
  const orb3Y = useSharedValue(height * 0.8);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(width * 0.5, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-width * 0.2, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(height * 0.4, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-height * 0.1, { duration: 9000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    orb2X.value = withRepeat(
      withSequence(
        withTiming(width * 0.1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.8, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(-height * 0.2, { duration: 11000, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.6, { duration: 11000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    orb3X.value = withRepeat(
      withSequence(
        withTiming(width * 0.9, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.3, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb3Y.value = withRepeat(
      withSequence(
        withTiming(height * 0.2, { duration: 13000, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.8, { duration: 13000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb3X.value }, { translateY: orb3Y.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
        <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
        <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />
      </View>
      <BlurView intensity={80} tint="dark" style={styles.blurLayer} />
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14', // Deepest space blue
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#FF007F', // Neon Pink
    opacity: 0.4,
  },
  orb2: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#00F0FF', // Electric Cyan
    opacity: 0.3,
  },
  orb3: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#FFA500', // Brand Orange
    opacity: 0.35,
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  contentLayer: {
    flex: 1,
    zIndex: 10,
  },
});
