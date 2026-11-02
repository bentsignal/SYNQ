import { Alert } from "react-native";

import { isSongLiked, setSongLiked } from "@synq/db";

import { useLibraryQuery, writeLibrary } from "~/features/library/queries";
import { queryClient } from "~/lib/query-client";
import { IconButton } from "./icon-button";
import { PLAYER_CIRCLE } from "./player-layout";

function likedKey(songId: number) {
  return ["player", "liked", songId] as const;
}

/**
 * The player's heart: adds the song to Liked Songs, or takes it out. White
 * either way, filled when liked, since the theme's accent can clash with the
 * song's own colors around it.
 */
export function LikeButton({ songId }: { songId: number }) {
  const liked = useLibraryQuery({
    key: likedKey(songId),
    read: (db) => isSongLiked(db, songId),
    select: (value) => value,
  });

  function toggle() {
    const next = !liked;
    queryClient.setQueryData(["library", ...likedKey(songId)], next);
    try {
      writeLibrary((db) => setSongLiked(db, songId, next));
    } catch {
      queryClient.setQueryData(["library", ...likedKey(songId)], liked);
      Alert.alert("Couldn't Update Liked Songs", "Try again.");
    }
  }

  return (
    <IconButton
      label={liked ? "Remove from Liked Songs" : "Love"}
      symbol={liked ? "heart.fill" : "heart"}
      size={16}
      box={PLAYER_CIRCLE}
      circle={PLAYER_CIRCLE}
      tint="accent-foreground"
      selected={liked}
      onPress={toggle}
    />
  );
}
