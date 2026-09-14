import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../constants/colors";

export default function CustomAlert({ visible, title, message, buttons = [], onClose }) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.CARD_BG, borderColor: colors.CARD_BORDER }]}>
          {title ? (
            <Text style={[styles.title, { color: colors.TEXT }]}>{title}</Text>
          ) : null}
          {message ? (
            <Text style={[styles.message, { color: colors.MUTED }]}>{message}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === "cancel";
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    { backgroundColor: isCancel ? "transparent" : colors.BRAND_ORANGE },
                  ]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: isCancel ? colors.MUTED : colors.BACKGROUND },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {buttons.length === 0 && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, { backgroundColor: colors.BRAND_ORANGE }]}
              >
                <Text style={[styles.buttonText, { color: colors.BACKGROUND }]}>
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
  },
});
