import type { ArtworkRef } from "@synq/db";
import { View } from "react-native";
import { Paths } from "expo-file-system";
import { Image } from "expo-image";
import { artworkUri } from "@synq/db";

/**
 * Behind the whole player: the artwork, blurred and darkened, crossfading
 * when the song changes. A small cover blurs as well as a big one and
 * decodes faster.
 */
export function PlayerBackdrop({ artwork }: { artwork: ArtworkRef | null }) {
  return (
    <View className="bg-background absolute inset-0" pointerEvents="none">
      {artwork !== null && (
        <Image
          source={{ uri: artworkUri(Paths.document.uri, artwork, "small") }}
          placeholder={{ uri: artworkUri(Paths.document.uri, artwork, "full") }}
          blurRadius={40}
          contentFit="cover"
          transition={400}
          style={{ height: "100%", width: "100%" }}
          accessibilityIgnoresInvertColors
        />
      )}
      <View className="absolute inset-0 bg-black/55" />
    </View>
  );
}
