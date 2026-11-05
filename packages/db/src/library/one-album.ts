/**
 * A song is on one album (docs/rewrite.md → One album per song). 2.5.2, and
 * 3.0 before November 2026, could put a song on several; this picks the one
 * it keeps: the first, by `position`, whose album has a cover, so the song's
 * artwork doesn't change, else the first. The migration that collapses an
 * existing library (`drizzle/0003_one_album_per_song.sql`) applies the same
 * rule in SQL. Returns the rows themselves, in their order.
 */
export function oneAlbumEach<
  Row extends { albumId: number; songId: number; position: number },
>(rows: readonly Row[], hasCover: (albumId: number) => boolean) {
  const kept = new Map<number, Row>();
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  for (const row of sorted) {
    const current = kept.get(row.songId);
    if (
      current === undefined ||
      (!hasCover(current.albumId) && hasCover(row.albumId))
    ) {
      kept.set(row.songId, row);
    }
  }
  const keep = new Set(kept.values());
  return rows.filter((row) => keep.has(row));
}
