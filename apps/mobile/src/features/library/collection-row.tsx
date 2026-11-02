import { Pressable, Text, View } from "react-native";

import type { ArtworkRef } from "@synq/db";

import type { ArtworkPlaceholder } from "~/components/artwork";
import type { MenuGroups } from "~/components/menu";
import { Artwork } from "~/components/artwork";
import { NativeRow } from "~/components/native-row";
import { SymbolIcon } from "~/components/symbol-icon";

/** Every collection row's height, for the list's layout. */
export const COLLECTION_ROW_HEIGHT = 72;

const ARTWORK_SIZE = 56;
const LEADING = 16;
const GAP = 12;

function RowText({
  name,
  detail,
  chevron,
}: {
  name: string;
  detail: string | undefined;
  chevron: boolean;
}) {
  return (
    <>
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
    </>
  );
}

/**
 * A playlist, album, or artist in a list (docs/ui.md → Collection row):
 * artwork, name over a muted detail (`12 songs`, `Kestrel · 2021`), and a
 * chevron. Artists' artwork is round. `menu` is what a long press offers
 * (collection-menu.ts); a row that picks something in a sheet has none.
 */
export function CollectionRow({
  artwork,
  placeholder,
  name,
  detail,
  chevron = true,
  menu,
  onPress,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  name: string;
  detail?: string;
  chevron?: boolean;
  menu?: MenuGroups;
  onPress: () => void;
}) {
  const label = detail === undefined ? name : `${name}, ${detail}`;
  if (menu !== undefined) {
    return (
      <NativeRow
        height={COLLECTION_ROW_HEIGHT}
        label={label}
        menu={menu}
        menuButton={false}
        separatorInset={LEADING + ARTWORK_SIZE + GAP}
        onPress={onPress}
      >
        <View style={{ width: LEADING }} />
        <Artwork
          artwork={artwork}
          placeholder={placeholder}
          size={ARTWORK_SIZE}
        />
        <View
          className="h-full flex-1 flex-row items-center pr-4"
          style={{ marginLeft: GAP }}
        >
          <RowText name={name} detail={detail} chevron={chevron} />
        </View>
      </NativeRow>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="active:bg-fill flex-row items-center"
      style={{ height: COLLECTION_ROW_HEIGHT, paddingLeft: LEADING }}
      onPress={onPress}
    >
      <Artwork
        artwork={artwork}
        placeholder={placeholder}
        size={ARTWORK_SIZE}
      />
      <View
        className="border-b-hairline border-separator h-full flex-1 flex-row items-center pr-4"
        style={{ marginLeft: GAP }}
      >
        <RowText name={name} detail={detail} chevron={chevron} />
      </View>
    </Pressable>
  );
}
