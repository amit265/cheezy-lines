import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAnalytics from '../services/useAnalytics';

const FALLBACK_APPS = [
  {
    slug: "spin-the-wheel",
    name: "Spin the Wheel : Pick for me",
    description: "Spin the wheel to decide fun topics, games, meals, or challenges!",
    icon: "https://destyastudio.com/apps/spin-the-wheel/icon.png",
    androidUrl: "https://destyastudio.com/products/spin-the-wheel",
    iosUrl: "https://destyastudio.com/products/spin-the-wheel",
  },
  {
    slug: "code-respite",
    name: "CodeRespite: Refresh Your Tech Skills",
    description: "Boost your programming skills with interactive quizzes.",
    icon: "https://destyastudio.com/apps/code-respite/icon.png",
    androidUrl: "https://destyastudio.com/products/code-respite",
    iosUrl: "https://destyastudio.com/products/code-respite",
  },
  {
    slug: "question-games",
    name: "AI Icebreaker: Question Games",
    description: "Never run out of things to talk about.",
    icon: "https://destyastudio.com/apps/question-games/icon.png",
    androidUrl: "https://destyastudio.com/products/question-games",
    iosUrl: "https://destyastudio.com/products/question-games",
  },
  {
    slug: "trivia-quest-ai",
    name: "Trivia Quest AI: Fun Quiz Game",
    description: "Test your knowledge against AI-generated trivia.",
    icon: "https://destyastudio.com/apps/trivia-quest-ai/icon.png",
    androidUrl: "https://destyastudio.com/products/trivia-quest-ai",
    iosUrl: "https://destyastudio.com/products/trivia-quest-ai",
  }
];

export default function CrossPromoHub() {
  const [apps] = useState(FALLBACK_APPS);
  const { logEvent } = useAnalytics();

  const handleAppPress = async (app) => {
    try {
      const url = Platform.OS === 'ios' ? app.iosUrl : app.androidUrl;
      await Linking.openURL(url);
      
      // Reward tracking
      const storageKey = `ds_cross_promo_${app.slug}_clicked`;
      const alreadyClicked = await AsyncStorage.getItem(storageKey);
      
      if (!alreadyClicked) {
        await AsyncStorage.setItem(storageKey, "true");
        logEvent('cross_promo_clicked', { app_slug: app.slug, app_name: app.name });
        // TODO: Give user some in-app reward, like an alert
        console.log(`Rewarded user for clicking ${app.name}`);
      }
    } catch (err) {
      console.log("Failed to open cross promo link", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More from Destya Studio</Text>
      {apps.map((app, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.card} 
          onPress={() => handleAppPress(app)}
        >
          <Image source={{ uri: app.icon }} style={styles.icon} />
          <View style={styles.info}>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appDesc}>{app.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
    marginVertical: 10,
  },
  title: {
    color: '#333',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  appName: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  appDesc: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  }
});
