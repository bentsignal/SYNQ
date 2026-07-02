import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  LibrarySongDetail,
  LibrarySongDetailStatusState,
} from "../services/library-song-detail-service";

type LibrarySongSourcePanelProps = {
  detail: LibrarySongDetail;
};

export function LibrarySongSourcePanel({ detail }: LibrarySongSourcePanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Source
      </Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        {detail.originalFileName}
      </Text>
      <Text style={[styles.pathText, { color: theme.mutedText }]}>
        {detail.pathToFile ?? "No file path recorded"}
      </Text>
    </View>
  );
}

type LibrarySongStatusPanelProps = {
  statusState: LibrarySongDetailStatusState;
};

export function LibrarySongStatusPanel({
  statusState,
}: LibrarySongStatusPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[
          statusState.isError ? styles.errorText : styles.panelText,
          {
            color: statusState.isError ? theme.danger : theme.secondaryText,
          },
        ]}
      >
        {statusState.statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
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
  pathText: {
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
