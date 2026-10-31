import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";
import { Button, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  resizable,
} from "@expo/ui/swift-ui/modifiers";

import type { SongListItem } from "@synq/db";

import { artistLine, artworkFileUri } from "./tracks";

const ARTWORK = 44;
const artworkFrame = [frame({ height: ARTWORK, width: ARTWORK })];
const title = [
  font({ textStyle: "body" }),
  lineLimit(1),
  foregroundStyle("primary"),
];
const subtitle = [
  font({ textStyle: "subheadline" }),
  lineLimit(1),
  foregroundStyle({ style: "secondary", type: "hierarchical" }),
];

/**
 * A song in the queue's SwiftUI list: artwork, title, artist. A tap plays
 * it; the list adds drag to reorder and swipe to remove.
 */
export function QueueRow({
  song,
  modifiers,
  onPress,
}: {
  song: SongListItem;
  modifiers?: ModifierConfig[];
  onPress?: () => void;
}) {
  const artwork = artworkFileUri(song.artwork, "small");
  return (
    <Button modifiers={modifiers} onPress={onPress}>
      <HStack spacing={12}>
        {artwork === undefined ? (
          <Image
            systemName="music.note"
            size={18}
            color="rgba(235, 235, 245, 0.3)"
            modifiers={[
              ...artworkFrame,
              background("rgba(118, 118, 128, 0.24)"),
              clipShape("roundedRectangle", 6),
            ]}
          />
        ) : (
          <Image
            uiImage={artwork}
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fill" }),
              ...artworkFrame,
              clipShape("roundedRectangle", 6),
            ]}
          />
        )}
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={title}>{song.title}</Text>
          <Text modifiers={subtitle}>{artistLine(song)}</Text>
        </VStack>
        <Spacer />
      </HStack>
    </Button>
  );
}
