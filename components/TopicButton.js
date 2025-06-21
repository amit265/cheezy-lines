import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TopicButton({ data }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  if (!data) return null;
  const { width } = Dimensions.get("screen");

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: item?.color, width: width * 0.85 }]}
      onPress={() => {
        router.push({
          pathname: `/topics/${item?.id}`,
          params: {
            dataParams: JSON.stringify(item),
          },
        });
        setClickCount((prev) => prev + 1);
      }}
    >
      <Text style={styles.buttonText}>{item?.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        showsVerticalScrollIndicator = {false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  button: {

    paddingVertical: 25,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#5D4037",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    textAlign: "left"
  },
});
