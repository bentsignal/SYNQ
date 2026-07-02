import { Link } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBackupSession } from "../hooks/use-backup-session";
import type { BackupOperation } from "../types/backup-session";

type BackupActionCard = {
  body: string;
  operation: BackupOperation;
  title: string;
};

const actionCards: BackupActionCard[] = [
  {
    body: "Create a shareable archive of the local library database and media.",
    operation: "backup",
    title: "Backup your library",
  },
  {
    body: "Pick a saved archive and replace the current local library.",
    operation: "restore",
    title: "Restore your library",
  },
  {
    body: "Remove local songs, collections, metadata, and runtime library state.",
    operation: "erase",
    title: "Erase your library",
  },
];

const operationLabels = {
  backup: "Backup",
  erase: "Erase",
  restore: "Restore",
} satisfies Record<BackupOperation, string>;

export function BackupScreen() {
  const { reset, runOperation, state } = useBackupSession();
  const isRunning = state.phase === "running";
  const runBackupOperation = (operation: BackupOperation) => {
    if (operation === "backup") {
      void runOperation(operation);
      return;
    }

    const isRestore = operation === "restore";

    Alert.alert(
      isRestore ? "Restore library" : "Erase library",
      isRestore
        ? "This replaces the current local library with the selected backup archive."
        : "This removes local songs, collections, metadata, and library files from this device.",
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          onPress: () => void runOperation(operation),
          style: "destructive",
          text: isRestore ? "Restore" : "Erase",
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/backup</Text>
        <Text style={styles.title}>Backup & Restore</Text>
        <Text style={styles.subtitle}>
          Backup operations now have a feature-owned command boundary.
        </Text>
      </View>

      <View style={styles.list}>
        {actionCards.map((action) => (
          <View key={action.operation} style={styles.card}>
            <View style={styles.cardText}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{action.title}</Text>
                {state.requiresPremium ? (
                  <Text style={styles.premiumPill}>Premium</Text>
                ) : null}
              </View>
              <Text style={styles.cardBody}>{action.body}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isRunning}
              onPress={() => runBackupOperation(action.operation)}
              style={[
                action.operation === "erase"
                  ? styles.dangerButton
                  : styles.primaryButton,
                isRunning ? styles.disabled : null,
              ]}
            >
              <Text style={styles.buttonText}>
                {operationLabels[action.operation]}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Status</Text>
        <Text style={state.phase === "failure" ? styles.errorText : styles.panelText}>
          {state.error ??
            state.message ??
            (state.lastOperation
              ? `${operationLabels[state.lastOperation]} ${state.phase}`
              : "No backup operation has run.")}
        </Text>
        {state.phase === "failure" ? (
          <Pressable
            accessibilityRole="button"
            onPress={reset}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Reset status</Text>
          </Pressable>
        ) : null}
      </View>

      <Link href="/settings" style={styles.backLink}>
        Back to Settings
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
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cardText: {
    gap: 8,
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardTitle: {
    color: "#121417",
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  premiumPill: {
    backgroundColor: "#e8f3ef",
    borderColor: "#b9d6cc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  cardBody: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#b42318",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
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
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  resetButton: {
    alignItems: "center",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
