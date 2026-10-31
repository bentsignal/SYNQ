// A screenful of song rows, the library's most repeated view: each is a
// native row with the song menu, a liked lookup, and the now-playing mark.
import { QueryClientProvider } from "@tanstack/react-query";
import { measureRenders } from "reassure";

import type { SongListItem } from "@synq/db";

import { SongRow } from "~/features/library/song-row";
import { queryClient } from "~/lib/query-client";

function song(id: number) {
  return {
    addedAt: id,
    albums: [{ artworkVersion: null, id: 1, name: "Northbound", track: id }],
    artists: [{ id: 1, name: "Mara Lind" }],
    artwork: null,
    durationMs: 200_000,
    filePath: `library/${id}/song.m4a`,
    id,
    mimeType: "audio/mp4",
    modifiedSinceExport: false,
    title: `Song ${id}`,
  } satisfies SongListItem;
}

// Rows read the library through the query cache, seeded below; the
// database itself is native.
jest.mock("~/features/library/database", () => ({
  libraryDb: () => {
    throw new Error("Seed the query cache instead.");
  },
}));
jest.mock("@synq/db/expo", () => ({ documentFile: jest.fn() }));
jest.mock("expo-file-system", () => ({}));
jest.mock("expo-image-manipulator", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("~/lib/kv", () => ({
  readJson: (_key: string, decode: (stored: unknown) => unknown) =>
    decode(undefined),
  writeJson: jest.fn(),
}));

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
