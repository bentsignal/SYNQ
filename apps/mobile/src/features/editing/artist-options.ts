import { listArtists } from "@synq/db";

import { useLibraryQuery } from "~/features/library/queries";

/** Every artist, for choosing an album's or a song's. */
export function useArtistOptions() {
  return useLibraryQuery({
    key: ["artists", "name", "asc"],
    read: (db) => listArtists(db, { order: "asc", sort: "name" }),
    select: (artists) => artists,
  });
}
