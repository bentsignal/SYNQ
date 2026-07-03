import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  LibrarySongDetail,
} from "../services/library-song-detail-service";
import type { LibrarySongDetailStatusState } from "../services/library-song-detail-state-service";

type LibrarySongSourcePanelProps = {
  detail: LibrarySongDetail;
};

export function LibrarySongSourcePanel({ detail }: LibrarySongSourcePanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Source
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
        {detail.originalFileName}
      </Text>
      <Text className="text-xs leading-[18px]" style={{ color: theme.mutedText }}>
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
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${statusState.isError ? "font-bold" : ""}`}
        style={{
          color: statusState.isError ? theme.danger : theme.secondaryText,
        }}
      >
        {statusState.statusLabel}
      </Text>
    </View>
  );
}
