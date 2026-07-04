import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/SongRowParts";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongPreviewRowState } from "../services/import-song-preview-state-service";

type ImportSongPreviewRowProps = {
  canEditSongs: boolean;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  row: ImportSongPreviewRowState;
};

export function ImportSongPreviewRow({
  canEditSongs,
  onRemoveSong,
  row,
}: ImportSongPreviewRowProps) {
  const theme = useCustomizationTheme();
  const { song } = row;
  const showActions = canEditSongs || onRemoveSong !== undefined;

  return (
    <SongRowShell minHeight={76} theme={theme}>
      <SongRowTextStack
        meta={`${song.artist} / ${song.album}`}
        title={song.title}
        theme={theme}
      >
        <Text
          numberOfLines={1}
          className="text-xs leading-4"
          style={{ color: theme.mutedText }}
        >
          {song.fileName}
        </Text>
      </SongRowTextStack>
      <SongRowDuration duration={song.duration} theme={theme} />
      {showActions ? (
        <View className="max-w-[168px] flex-row flex-wrap justify-end gap-2">
          {canEditSongs ? (
            <Link asChild href={row.editHref}>
              <Pressable
                accessibilityRole="button"
                className="min-h-9 min-w-[58px] items-center justify-center rounded-lg border px-2.5"
                style={{ borderColor: theme.border }}
              >
                <Text
                  className="text-xs font-extrabold uppercase"
                  style={{ color: theme.accent }}
                >
                  Edit
                </Text>
              </Pressable>
            </Link>
          ) : null}
          {onRemoveSong ? (
            <SongRowActionButton
              backgroundColor={theme.surface}
              borderColor={theme.border}
              label="Remove"
              minWidth={76}
              onPress={() => onRemoveSong(song.id)}
              textColor={theme.danger}
            />
          ) : null}
        </View>
      ) : null}
    </SongRowShell>
  );
}
