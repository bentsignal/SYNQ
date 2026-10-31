import { View } from "react-native";
import { router, Stack } from "expo-router";

import type { ArtistDetail, ArtistListItem } from "@synq/db";
import { getArtistDetail } from "@synq/db";

import { ScreenList } from "~/components/screen-list";
import { playSongs } from "~/features/player/actions";
import { confirmDeleteArtist } from "../actions";
import {
  AlbumCards,
  CollectionHeader,
  DetailTitle,
  HeaderLine,
  SectionTitle,
  useHeaderTitle,
} from "../collection-header";
import { albumCount, dotted, songCount } from "../format";
import { useIdParam } from "../params";
import { PlayShuffleButtons } from "../play-shuffle-buttons";
import { useLibraryQuery } from "../queries";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";

function ArtistMenu({ artist }: { artist: ArtistListItem }) {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="More">
        <Stack.Toolbar.MenuAction
          icon="pencil"
          onPress={() =>
            router.push({
              params: { id: String(artist.id) },
              pathname: "/edit-artist/[id]",
            })
          }
        >
          Edit
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="trash"
          destructive
          onPress={() => confirmDeleteArtist(artist, () => router.back())}
        >
          Delete Artist
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function ArtistHeader({
  detail,
  songIds,
}: {
  detail: ArtistDetail;
  songIds: () => readonly number[];
}) {
  const { albums, artist, songs } = detail;
  return (
    <CollectionHeader
      artwork={artist.artwork}
      placeholder="artist"
      name={artist.name}
      lines={
        <HeaderLine>
          {dotted(
            albums.length > 0 ? albumCount(albums.length) : null,
            songCount(songs.length),
          )}
        </HeaderLine>
      }
    >
      {songs.length > 0 && (
        <PlayShuffleButtons
          songIds={songIds}
          source={{ id: artist.id, kind: "artist" }}
        />
      )}
      {albums.length > 0 && (
        <View>
          <SectionTitle title="Albums" />
          <AlbumCards albums={albums} />
        </View>
      )}
      {songs.length > 0 && <SectionTitle title="Songs" />}
    </CollectionHeader>
  );
}

function Artist({ detail }: { detail: ArtistDetail }) {
  const { artist, songs } = detail;
  const header = useHeaderTitle(artist.name, "artist");
  const source = { id: artist.id, kind: "artist" } as const;
  function ids() {
    return songs.map((song) => song.id);
  }
  return (
    <>
      <DetailTitle title={header.title} />
      <ArtistMenu artist={artist} />
      <ScreenList
        data={songs}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        scrollEventThrottle={32}
        onScroll={header.onScroll}
        ListHeaderComponent={<ArtistHeader detail={detail} songIds={ids} />}
        ListFooterComponent={<View className="h-6" />}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            place={{ artistId: artist.id }}
            onPress={() => playSongs(ids(), { source, startIndex: index })}
          />
        )}
      />
    </>
  );
}

/** An artist: header, their albums as cards, then their songs. */
export default function ArtistScreen() {
  const id = useIdParam();
  const detail = useLibraryQuery({
    key: ["artist", id],
    read: (db) => getArtistDetail(db, id),
    select: (found) => found,
  });
  if (detail === null) return null;
  return <Artist detail={detail} />;
}
