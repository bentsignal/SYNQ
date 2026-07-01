import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useImportSession } from "../hooks/use-import-session";

export function ImportFailureScreen() {
  const { state } = useImportSession();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Import stopped</Text>
        <Text style={styles.title}>Failure</Text>
        <Text style={styles.subtitle}>
          {state.error ?? "The import session could not continue."}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Phase</Text>
        <Text style={styles.panelText}>{state.phase}</Text>
      </View>

      <Link href="/import/files" style={styles.backLink}>
        Back to files
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    color: "#29322e",
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
