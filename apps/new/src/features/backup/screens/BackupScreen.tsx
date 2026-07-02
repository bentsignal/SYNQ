import { Link } from "expo-router";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useEffect, useRef } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
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
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { state: premiumState } = usePremiumEntitlement();
  const previousPhaseRef = useRef(state.phase);
  const isRunning = state.phase === "running";

  useEffect(() => {
    if (previousPhaseRef.current !== state.phase) {
      if (state.phase === "success") {
        sendHaptic("success");
      }

      if (state.phase === "failure") {
        sendHaptic("error");
      }
    }

    previousPhaseRef.current = state.phase;
  }, [sendHaptic, state.phase]);

  const runBackupOperation = (operation: BackupOperation) => {
    sendHaptic(operation === "erase" ? "medium" : "light");

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
          onPress: () => {
            sendHaptic(operation === "erase" ? "heavy" : "medium");
            void runOperation(operation);
          },
          style: "destructive",
          text: isRestore ? "Restore" : "Erase",
        },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Library Safety
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Backup & Restore
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Save a copy of your local library, restore from an archive, or clear
          this device.
        </Text>
      </View>

      <View style={styles.list}>
        {actionCards.map((action) => (
          <View
            key={action.operation}
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardText}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: theme.primaryText }]}>
                  {action.title}
                </Text>
                {state.requiresPremium && !premiumState.active ? (
                  <Text
                    style={[
                      styles.premiumPill,
                      { borderColor: theme.border, color: theme.accent },
                    ]}
                  >
                    Premium
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.cardBody, { color: theme.secondaryText }]}>
                {action.body}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isRunning}
              onPress={() => runBackupOperation(action.operation)}
              style={[
                action.operation === "erase"
                  ? styles.dangerButton
                  : styles.primaryButton,
                {
                  backgroundColor:
                    action.operation === "erase" ? theme.danger : theme.accent,
                },
                isRunning ? styles.disabled : null,
              ]}
            >
              <Text style={[styles.buttonText, { color: theme.onAccent }]}>
                {operationLabels[action.operation]}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Status
        </Text>
        <Text
          style={[
            state.phase === "failure" ? styles.errorText : styles.panelText,
            {
              color:
                state.phase === "failure" ? theme.danger : theme.primaryText,
            },
          ]}
        >
          {state.error ??
            state.message ??
            (state.lastOperation
              ? `${operationLabels[state.lastOperation]} ${state.phase}`
              : "No backup operation has run.")}
        </Text>
        {state.phase === "failure" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              sendHaptic("light");
              reset();
            }}
            style={[styles.resetButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.resetButtonText, { color: theme.accent }]}>
              Reset status
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Link href="/settings" style={[styles.backLink, { color: theme.accent }]}>
        Back to Settings
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  list: {
    gap: 12,
  },
  card: {
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
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  premiumPill: {
    backgroundColor: "#e8f3ef",
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  resetButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
