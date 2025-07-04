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

  const screenWidth = Dimensions.get("window").width;
  const itemMargin = 10;
  const itemWidth = (screenWidth - itemMargin * 3) / 2;

  const renderItem = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: item?.color,
            width: itemWidth,
            marginRight: isLeftColumn ? itemMargin / 2 : 0,
            marginLeft: isLeftColumn ? 0 : itemMargin / 2,
          },
        ]}
        activeOpacity={0.8}
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
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  content: {
    paddingVertical: 10,
  },
  itemContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#5D4037",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
});
