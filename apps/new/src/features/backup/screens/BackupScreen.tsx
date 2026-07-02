import { Link } from "expo-router";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useEffect, useRef } from "react";
import { useImportSession } from "@/src/features/import/hooks/use-import-session";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
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
import {
  backupActionCards,
  getBackupActionState,
  getBackupConfirmationState,
  getBackupStatusState,
} from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";

export function BackupScreen() {
  const { reset, runOperation, state } = useBackupSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { resetSession } = useImportSession();
  const { resetPlaybackSession } = usePlaybackSession();
  const { state: premiumState } = usePremiumEntitlement();
  const previousPhaseRef = useRef(state.phase);
  const statusState = getBackupStatusState(state);

  useEffect(() => {
    if (previousPhaseRef.current !== state.phase) {
      if (state.phase === "success") {
        sendHaptic("success");

        if (
          state.lastOperation === "erase" ||
          state.lastOperation === "restore"
        ) {
          resetSession();
          resetPlaybackSession();
        }
      }

      if (state.phase === "failure") {
        sendHaptic("error");
      }
    }

    previousPhaseRef.current = state.phase;
  }, [
    resetPlaybackSession,
    resetSession,
    sendHaptic,
    state.lastOperation,
    state.phase,
  ]);

  const runBackupOperation = (operation: BackupOperation) => {
    sendHaptic(operation === "erase" ? "medium" : "light");

    if (operation === "backup") {
      void runOperation(operation);
      return;
    }

    const confirmation = getBackupConfirmationState(operation);
    if (!confirmation) {
      return;
    }

    Alert.alert(
      confirmation.title,
      confirmation.body,
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
          text: confirmation.confirmLabel,
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
        {backupActionCards.map((action) => {
          const actionState = getBackupActionState({
            operation: action.operation,
            premiumActive: premiumState.active,
            state,
          });

          return (
            <View
              key={action.operation}
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardText}>
                <View style={styles.cardTitleRow}>
                  <Text
                    style={[styles.cardTitle, { color: theme.primaryText }]}
                  >
                    {action.title}
                  </Text>
                  {actionState.showPremiumBadge ? (
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
                disabled={actionState.isDisabled}
                onPress={() => runBackupOperation(action.operation)}
                style={[
                  actionState.isDanger
                    ? styles.dangerButton
                    : styles.primaryButton,
                  {
                    backgroundColor: actionState.isDanger
                      ? theme.danger
                      : theme.accent,
                  },
                  actionState.isDisabled ? styles.disabled : null,
                ]}
              >
                <Text style={[styles.buttonText, { color: theme.onAccent }]}>
                  {actionState.buttonLabel}
                </Text>
              </Pressable>
            </View>
          );
        })}
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
            statusState.isFailure ? styles.errorText : styles.panelText,
            {
              color: statusState.isFailure ? theme.danger : theme.primaryText,
            },
          ]}
        >
          {statusState.message}
        </Text>
        {statusState.canReset ? (
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

      <Link href="/(tabs)/settings" style={[styles.backLink, { color: theme.accent }]}>
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
