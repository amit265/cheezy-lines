import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useThemeColors } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const EasUpdateModal = () => {
  const colors = useThemeColors();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  const styles = React.useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dimmer overlay
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 380,
      padding: 24,
      borderRadius: 24,
      alignItems: 'center',
      elevation: 16,
      shadowColor: colors.SHADOW,
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: 'Poppins-Bold',
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    button: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
      color: '#FFF',
    },
  }), [colors]);

  useEffect(() => {
    if (__DEV__ || Platform.OS === 'web') return; // Skip in dev or web mode

    async function checkEasUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true);
        }
      } catch (error) {
        // Silently catch network or dev server update check failures
        console.log('[EAS Updates] Check error:', error);
      }
    }

    checkEasUpdate();
  }, []);

  const handleApplyUpdate = async () => {
    try {
      setUpdating(true);
      await Updates.reloadAsync();
    } catch (error) {
      console.warn('[EAS Updates] Reload error:', error);
      setUpdating(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <Modal visible={updateAvailable} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.CARD_BG, borderColor: colors.CARD_BORDER, borderWidth: 1 }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.BRAND_ORANGE + '20' }]}>
            <MaterialCommunityIcons name="update" color={colors.BRAND_ORANGE} size={32} />
          </View>

          <Text style={[styles.title, { color: colors.TEXT }]}>
            App Update Ready!
          </Text>
          <Text style={[styles.description, { color: colors.MUTED }]}>
            A new version with performance improvements and feature updates has been downloaded. Restart now to apply!
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.BRAND_ORANGE }]}
            onPress={handleApplyUpdate}
            disabled={updating}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {updating ? "Restarting..." : "🚀 Restart & Update Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

