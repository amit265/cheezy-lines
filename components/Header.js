import colors from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
export default function Header() {
  const router = useRouter();
  

  return (
    <View
      style={{
        display: "flex",

        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        paddingBottom: 20,
        borderBottomWidth: 1,
      }}
    >
      <Text
        style={{ fontFamily: "Baloo2", fontSize: 24, color: colors.TEXT, fontWeight: 800 }}
      >
        Cheesy Lines
      </Text>
      <View style={{display: "flex", flexDirection: "row", gap: 10}}>
        <TouchableOpacity onPress={() => router.push("/favorites")}>
          <Ionicons name="heart" size={36} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={36} color="black" />
        </TouchableOpacity>
      </View>
     
    </View>
  );
}
