import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LineCard from "../../components/LineCard";
import colors from "../../constants/colors";
import { BannerAdComponent } from "../../services/AdManager";
export default function Topic() {
  const { dataParams } = useLocalSearchParams();
  const router = useRouter();
  const data = JSON.parse(dataParams);
  const lines = data?.lines;

  const renderItem = ({ item }) => (
    <View>
      <LineCard lines={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-sharp" size={36} color="black" />
        </Pressable>
        <Text style={styles.headerText}>{data?.title}</Text>
      </View>

      <FlatList
        data={lines}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
      />
      <View style={styles.bannerContainer}>
        <BannerAdComponent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    alignItems: "center",
    paddingBottom: 40
  },
  headerContainer: {
    paddingVertical: 10,
    backgroundColor: colors.BACKGROUND,
    display: "flex",
    flexDirection: "row",
    gap: 15,
    width: "90%",
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#000",
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    backgroundColor: colors.BACKGROUND,
  },
});
