import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useImportSession } from "../hooks/use-import-session";

export function ImportHomeScreen() {
  const { state } = useImportSession();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/import</Text>
        <Text style={styles.title}>Import</Text>
        <Text style={styles.subtitle}>
          Bring songs into SYNQ with a review step before saving.
        </Text>
      </View>

      <View style={styles.list}>
        <Link asChild href="/import/files">
          <Pressable style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Files</Text>
              <Text style={styles.rowDescription}>
                Select local audio and review staged songs.
              </Text>
            </View>
            <Text style={styles.rowMeta}>{state.songs.length} staged</Text>
          </Pressable>
        </Link>
        <Link asChild href="/import/wifi">
          <Pressable style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Wi-Fi</Text>
              <Text style={styles.rowDescription}>
                Receive audio from a browser on the same network.
              </Text>
            </View>
            <Text style={styles.rowMeta}>
              {state.source === "wifi" ? state.progress.current : "Local"}
            </Text>
          </Pressable>
        </Link>
        <Link asChild href="/import/save">
          <Pressable style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Save</Text>
              <Text style={styles.rowDescription}>
                Finish or discard the current import session.
              </Text>
            </View>
            <Text style={styles.rowMeta}>{state.phase}</Text>
          </Pressable>
        </Link>
      </View>
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
    color: "#0f766e",
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
  list: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  rowTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowDescription: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 19,
  },
  rowMeta: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "right",
    textTransform: "uppercase",
  },
});
