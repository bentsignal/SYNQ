import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>SYNQ rewrite</Text>
        <Text style={styles.title}>A fresh Expo Router app is running.</Text>
        <Text style={styles.body}>
          Start feature work under src/features and add routes as the rewrite
          grows.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f5ef",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
  },
  kicker: {
    color: "#1f7a8c",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#171717",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 38,
  },
  body: {
    color: "#4a4a4a",
    fontSize: 16,
    lineHeight: 24,
  },
});
