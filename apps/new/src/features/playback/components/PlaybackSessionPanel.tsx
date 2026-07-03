import { Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackState } from "../types/playback-state";

type PlaybackSessionPanelProps = {
  freeListeningRemainingMs: number;
  state: PlaybackState;
};

export function PlaybackSessionPanel({
  freeListeningRemainingMs,
  state,
}: PlaybackSessionPanelProps) {
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
        Session
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {state.queue.length} queued
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        Free listening before ad break:{" "}
        {formatDurationMs(freeListeningRemainingMs)}
      </Text>
    </View>
  );
}

export function PlaybackErrorPanel({ error }: { error: string }) {
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
        Playback Error
      </Text>
      <Text
        className="text-sm font-bold leading-5"
        style={{ color: theme.danger }}
      >
        {error}
      </Text>
    </View>
  );
}
