import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/SongRowParts";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongEditHref } from "../services/import-song-edit-navigation-service";
import type { ImportSongDraft } from "../types/import-session";

type ImportSongPreviewRowProps = {
  canEditSongs: boolean;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  song: ImportSongDraft;
};

export function ImportSongPreviewRow({
  canEditSongs,
  onRemoveSong,
  song,
}: ImportSongPreviewRowProps) {
  const theme = useCustomizationTheme();
  const showActions = canEditSongs || onRemoveSong !== undefined;
  const editHref = getImportSongEditHref({ songId: song.id });

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
            <Link asChild href={editHref}>
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
