import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionSongRowActionState } from "../services/library-collection-song-mutation-service";

type LibraryCollectionSongRowActionsProps = {
  onMoveSong?: (direction: "down" | "up") => void;
  onRemoveSong?: () => void;
  rowState: CollectionSongRowActionState;
  songTitle: string;
};

export function LibraryCollectionSongRowActions({
  onMoveSong,
  onRemoveSong,
  rowState,
  songTitle,
}: LibraryCollectionSongRowActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      {onMoveSong ? (
        <View className="flex-row gap-1.5">
          <Pressable
            accessibilityLabel={`Move ${songTitle} up`}
            accessibilityRole="button"
            className={`min-h-[34px] min-w-[54px] items-center justify-center rounded-lg border px-2 ${
              rowState.canMoveUp ? "" : "opacity-[0.55]"
            }`}
            disabled={!rowState.canMoveUp}
            onPress={() => onMoveSong("up")}
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-[11px] font-extrabold uppercase"
              style={{ color: theme.accent }}
            >
              {rowState.upLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Move ${songTitle} down`}
            accessibilityRole="button"
            className={`min-h-[34px] min-w-[54px] items-center justify-center rounded-lg border px-2 ${
              rowState.canMoveDown ? "" : "opacity-[0.55]"
            }`}
            disabled={!rowState.canMoveDown}
            onPress={() => onMoveSong("down")}
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-[11px] font-extrabold uppercase"
              style={{ color: theme.accent }}
            >
              {rowState.downLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {onRemoveSong ? (
        <Pressable
          accessibilityRole="button"
          className={`min-h-[34px] min-w-[76px] items-center justify-center rounded-lg border px-2.5 ${
            rowState.canRemove ? "" : "opacity-[0.55]"
          }`}
          disabled={!rowState.canRemove}
          onPress={onRemoveSong}
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-[11px] font-extrabold uppercase"
            style={{ color: theme.danger }}
          >
            {rowState.removeLabel}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}
