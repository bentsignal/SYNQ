import { StyleSheet, Text, View } from "react-native";

type PlaceholderScreenProps = {
  title: string;
  boundary: string;
  reference: string;
  nextMilestone: string;
};

export function PlaceholderScreen({
  boundary,
  nextMilestone,
  reference,
  title,
}: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{boundary}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>Next milestone</Text>
        <Text style={styles.body}>{nextMilestone}</Text>
        <Text style={styles.reference}>{reference}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  label: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  body: {
    color: "#29322e",
    fontSize: 15,
    lineHeight: 22,
  },
  reference: {
    color: "#6f7a75",
    fontSize: 12,
    lineHeight: 17,
  },
});
