import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type DatabaseStateScreenProps = {
  title: string;
  detail: string;
  showSpinner?: boolean;
};

export function DatabaseStateScreen({
  detail,
  showSpinner = false,
  title,
}: DatabaseStateScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        {showSpinner ? <ActivityIndicator color="#0f766e" /> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#f4f7f5",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: 360,
    padding: 20,
  },
  title: {
    color: "#121417",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 23,
    textAlign: "center",
  },
  detail: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
