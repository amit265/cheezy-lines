import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Colors from "../constants/colors";

const SplashScreenComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
        {/* <Image
          source={require("../assets/images/splash_text.png")}
          style={styles.textImage}
          resizeMode="contain"
        /> */}
      </View>

      {/* Optional loading animation */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  iconImage: {
    width: 200,
    height: 200,
    marginTop: -50
  },
  textImage: {
    width: 400,
    height: 200,
    marginTop: -100,
  },
});

export default SplashScreenComponent;
