import { ScrollView, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { listPlaylists } from "@synq/db";

import { addToPlaylist } from "~/features/library/actions";
import { CollectionRow } from "~/features/library/collection-row";
import { songCount } from "~/features/library/format";
import { songIdsParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";

/**
 * Adds songs (`songs`, comma-separated ids) to a playlist: Liked Songs
 * first, New Playlist at the top. A tap adds them and closes at once.
 */
export default function AddToPlaylistScreen() {
  const { songs } = useLocalSearchParams<{ songs?: string }>();
  const songIds = songIdsParam(songs);
  const playlists = useLibraryQuery({
    key: ["playlists", "name", "asc"],
    read: (db) => listPlaylists(db, { order: "asc", sort: "name" }),
    select: (items) => items,
  });
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Cancel"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <ScrollView
        className="bg-background flex-1"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pt-2 pb-8">
          <CollectionRow
            artwork={null}
            placeholder="playlist"
            name="New Playlist…"
            chevron={false}
            onPress={() =>
              router.push({ params: { songs }, pathname: "/new-playlist" })
            }
          />
          {playlists.map((playlist) => (
            <CollectionRow
              key={playlist.id}
              artwork={playlist.artwork}
              placeholder={playlist.kind === "liked" ? "liked" : "playlist"}
              name={playlist.name}
              detail={songCount(playlist.songCount)}
              chevron={false}
              onPress={() => {
                addToPlaylist(playlist.id, songIds);
                router.back();
              }}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}
