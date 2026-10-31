import { Pressable, Text, View } from "react-native";

import type { ArtworkRef } from "@synq/db";

import type { ArtworkPlaceholder } from "~/components/artwork";
import { Artwork } from "~/components/artwork";
import { SymbolIcon } from "~/components/symbol-icon";

/** Every collection row's height, for the list's layout. */
export const COLLECTION_ROW_HEIGHT = 72;

const ARTWORK_SIZE = 56;

/**
 * A playlist, album, or artist in a list (docs/ui.md → Collection row):
 * artwork, name over a muted detail (`12 songs`, `Kestrel · 2021`), and a
 * chevron. Artists' artwork is round.
 */
export function CollectionRow({
  artwork,
  placeholder,
  name,
  detail,
  chevron = true,
  onPress,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  name: string;
  detail?: string;
  chevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail === undefined ? name : `${name}, ${detail}`}
      className="active:bg-fill flex-row items-center pl-4"
      style={{ height: COLLECTION_ROW_HEIGHT }}
      onPress={onPress}
    >
      <Artwork artwork={artwork} placeholder={placeholder} size={ARTWORK_SIZE} />
      <View className="border-b-hairline border-separator ml-3 h-full flex-1 flex-row items-center pr-4">
        <View className="flex-1 justify-center">
          <Text numberOfLines={1} className="text-body text-foreground">
            {name}
          </Text>
          {detail !== undefined && detail !== "" && (
            <Text numberOfLines={1} className="text-subhead text-muted">
              {detail}
            </Text>
          )}
        </View>
        {chevron && (
          <SymbolIcon
            name="chevron.right"
            size={13}
            weight="semibold"
            tintColorClassName="accent-subtle"
          />
        )}
      </View>
    </Pressable>
  );
}
