// A screenful of the song picker's rows and a selection change, which must
// re-render only the row it touched (the selection lives outside React).
import { fireEvent, screen } from "@testing-library/react-native";
import { measureRenders } from "reassure";

import type { SongListItem } from "@synq/db";

import { PickerRow } from "~/features/editing/song-picker";
import { createSongSelection } from "~/features/editing/song-selection";

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

test("choosing a song in the picker", async () => {
  const selection = createSongSelection<SongListItem>();
  await measureRenders(
    <>
      {SONGS.map((item) => (
        <PickerRow
          key={item.id}
          song={item}
          added={false}
          selection={selection}
        />
      ))}
    </>,
    {
      scenario: async () => {
        await Promise.resolve();
        await fireEvent.press(
          screen.getByLabelText("Song 3, Mara Lind · Northbound"),
        );
      },
    },
  );
});
