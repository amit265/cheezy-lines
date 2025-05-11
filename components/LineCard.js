import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LineCard({ lines }) {
  if (!lines) return null;

  

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.leftComma}>❝</Text>
        <Text style={styles.text}>{lines.text}</Text>
        <Text style={styles.rightComma}>❞</Text>
      </View>

      <View style={styles.buttonRow}>
        <IconButton icon="heart-outline" onPress={() => {}} />
        <IconButton icon="copy-outline" onPress={() => {}} />
        <IconButton icon="send-o" onPress={() => {}} />
      </View>
    </View>
  );
}

function IconButton({ icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      {icon === "send-o" ? (
        <FontAwesome name={icon} size={26} color="#000" />
      ) : (
        <Ionicons name={icon} size={26} color="#000" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 26,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  textContainer: {
    backgroundColor: "#fff",
    padding: 16,
    minHeight: 250,
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 20,
    marginTop: -30,
  },
  iconButton: {
    padding: 8,
  },
  leftComma: {
    fontSize: 30,
    color: "#000",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  rightComma: {
    fontSize: 30,
    color: "#000",
    fontFamily: "Poppins-Regular",
    textAlign: "right",
  },
});
