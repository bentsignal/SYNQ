// A screenful of song rows, the library's most repeated view: each is a
// native row with the song menu, a liked lookup, and the now-playing mark.
import { QueryClientProvider } from "@tanstack/react-query";
import { act } from "@testing-library/react-native";
import { measureRenders } from "reassure";

import type { SongListItem } from "@synq/db";

import { SongRow } from "~/features/library/song-row";
import { setPlayerState } from "~/features/player/store";
import { queryClient } from "~/lib/query-client";

function song(id: number) {
  return {
    addedAt: id,
    albums: [{ artworkVersion: null, id: 1, name: "Northbound", track: id }],
    artists: [{ id: 1, name: "Mara Lind" }],
    artwork: null,
    ownArtwork: null,
    useAlbumArtwork: true,
    durationMs: 200_000,
    filePath: `library/${id}/song.m4a`,
    id,
    mimeType: "audio/mp4",
    modifiedSinceExport: false,
    pinnedAt: null,
    title: `Song ${id}`,
  } satisfies SongListItem;
}

const SONGS = Array.from({ length: 14 }, (_, index) => song(index + 1));

test("a screenful of song rows renders", async () => {
  queryClient.setQueryData(["library", "liked-ids"], [2, 5]);
  await measureRenders(
    <QueryClientProvider client={queryClient}>
      {SONGS.map((item) => (
        <SongRow key={item.id} song={item} onPress={() => undefined} />
      ))}
    </QueryClientProvider>,
  );
});

// A skip, a pause, and back, with the rows on screen: only the rows whose
// song started or stopped should render again, not all of them.
test("a skip and a pause with song rows on screen", async () => {
  queryClient.setQueryData(["library", "liked-ids"], [2, 5]);
  const entries = SONGS.map((item) => ({
    key: `${String(item.id)}.1`,
    queued: false,
    songId: item.id,
  }));
  function queue(index: number) {
    return { currentKey: entries[index]?.key ?? null, entries, original: null };
  }
  setPlayerState({ queue: queue(0), status: "playing" });
  await measureRenders(
    <QueryClientProvider client={queryClient}>
      {SONGS.map((item) => (
        <SongRow key={item.id} song={item} onPress={() => undefined} />
      ))}
    </QueryClientProvider>,
    {
      scenario: async () => {
        await act(async () => {
          setPlayerState({ queue: queue(1) });
          await Promise.resolve();
        });
        await act(async () => {
          setPlayerState({ status: "paused" });
          await Promise.resolve();
        });
        // Back where it started, so every run measures the same changes.
        await act(async () => {
          setPlayerState({ queue: queue(0), status: "playing" });
          await Promise.resolve();
        });
      },
    },
  );
});
