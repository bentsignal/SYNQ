import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { SongAddToPlaylistStatusState } from "../../services/song-add-to-playlist-status-state-service";

type SongAddToPlaylistStatusProps = {
  statusState: SongAddToPlaylistStatusState;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistStatus({
  statusState,
  theme,
}: SongAddToPlaylistStatusProps) {
  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${statusState.hasError ? "font-bold" : ""}`}
        style={{
          color: statusState.hasError ? theme.danger : theme.secondaryText,
        }}
      >
        {statusState.label}
      </Text>
    </View>
  );
}

