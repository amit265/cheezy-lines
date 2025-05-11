import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LineCard from "../../components/LineCard";
import colors from "../../constants/colors";
import { favoritesContext } from "../../context/AppContext";
import { BannerAdComponent } from "../../services/AdManager";

export default function Index() {
  const router = useRouter();
  const { favorites, setFavorites } = useContext(favoritesContext);

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
        <Text style={styles.headerText}>Favorites</Text>
      </View>

      {favorites?.length === 0 ? (
        <TouchableOpacity
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.push("/")}
        >
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: 25,
                position: "absolute",
                top: 200,
                alignSelf: "center",
              },
            ]}
          >
            No Favorites yet
          </Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item?.id}-${index}`}
        />
      )}
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
    paddingBottom: 60,
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
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
});
