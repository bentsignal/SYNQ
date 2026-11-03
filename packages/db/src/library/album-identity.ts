/**
 * Which album a song belongs to. An album is its name and its artists: two
 * "Greatest Hits" by different artists are two albums, told apart by the
 * artist shown beside them. The rule, and why, is in docs/rewrite.md →
 * Same-named albums. 2.5.2 libraries aren't touched by this; it only decides
 * where newly imported songs go.
 */

import { nameKey } from "./text.ts";

/** Who a compilation's album is by, when its files don't name anyone. */
export const VARIOUS_ARTISTS = "Various Artists";

export interface AlbumCandidate {
  id: number;
  /** Credit order. */
  artistIds: readonly number[];
  /** The track numbers already on it. */
  tracks: readonly (number | null)[];
  /** Created in this batch by a song with no album artist. */
  open: boolean;
  /** Its name is spelled exactly as the song's is, case included. */
  exactName: boolean;
}

export interface SongOnAlbum {
  /** From the album artist tag (or a compilation's Various Artists); else empty. */
  albumArtistIds: readonly number[];
  artistIds: readonly number[];
  track: number | null;
}

function shared(a: readonly number[], b: readonly number[]) {
  return a.filter((id) => b.includes(id)).length;
}

function sameArtists(a: readonly number[], b: readonly number[]) {
  return a.length === b.length && shared(a, b) === a.length;
}

/** The best of `candidates` sharing `artistIds`: the same set, then the most in common, then the name's exact spelling, then the oldest. */
function bestSharing(
  candidates: readonly AlbumCandidate[],
  artistIds: readonly number[],
) {
  return candidates
    .filter((album) => shared(album.artistIds, artistIds) > 0)
    .map((album) => ({
      album,
      common: shared(album.artistIds, artistIds),
      same: sameArtists(album.artistIds, artistIds),
    }))
    .sort(
      (a, b) =>
        Number(b.same) - Number(a.same) ||
        b.common - a.common ||
        Number(b.album.exactName) - Number(a.album.exactName) ||
        a.album.id - b.album.id,
    )[0]?.album;
}

function preferExact(candidates: readonly AlbumCandidate[]) {
  return [...candidates].sort(
    (a, b) => Number(b.exactName) - Number(a.exactName) || a.id - b.id,
  )[0];
}

function hasNoArtists(album: AlbumCandidate) {
  return album.artistIds.length === 0;
}

/** A track number already taken says this song belongs to a different album. */
function trackIsFree(album: AlbumCandidate, track: number | null) {
  return track === null || !album.tracks.includes(track);
}

export interface AlbumChoice {
  album: AlbumCandidate;
  /** Whether the song's artists join the album's credits. */
  credit: boolean;
}

function chooseByAlbumArtist(
  candidates: readonly AlbumCandidate[],
  song: SongOnAlbum,
) {
  const matched =
    bestSharing(candidates, song.albumArtistIds) ??
    preferExact(candidates.filter(hasNoArtists));
  if (matched !== undefined) {
    return { album: matched, credit: true } satisfies AlbumChoice;
  }
  // A 2.5.2 album credits every track's artist, whatever its tags said, so a
  // compilation there shows as several artists including this song's.
  const legacy = bestSharing(
    candidates.filter((album) => album.artistIds.length >= 2),
    song.artistIds,
  );
  return legacy === undefined
    ? null
    : ({ album: legacy, credit: false } satisfies AlbumChoice);
}

function chooseByTrackArtists(
  candidates: readonly AlbumCandidate[],
  song: SongOnAlbum,
) {
  if (song.artistIds.length === 0) {
    return (
      preferExact(candidates.filter(hasNoArtists)) ??
      preferExact(candidates.filter((album) => album.open)) ??
      preferExact(candidates)
    );
  }
  return (
    bestSharing(candidates, song.artistIds) ??
    preferExact(candidates.filter(hasNoArtists)) ??
    // Nobody in common, and no tag to say: within a batch, a compilation with
    // no flag looks like this. It's one album unless a track is already taken.
    preferExact(
      candidates.filter(
        (album) => album.open && trackIsFree(album, song.track),
      ),
    )
  );
}

/** The album a same-named song joins, or null when it needs a new one. */
export function chooseAlbum(
  candidates: readonly AlbumCandidate[],
  song: SongOnAlbum,
) {
  if (song.albumArtistIds.length > 0) {
    return chooseByAlbumArtist(candidates, song);
  }
  const album = chooseByTrackArtists(candidates, song);
  return album === undefined
    ? null
    : ({ album, credit: true } satisfies AlbumChoice);
}

/**
 * The album a song's edit means by a typed name. Unlike an import, there's no
 * guessing at compilations here: it's an album these artists are on, one with
 * nobody on it, or (the album picker offers it) a new one.
 */
export function chooseAlbumForEdit(
  candidates: readonly AlbumCandidate[],
  artistIds: readonly number[],
) {
  return (
    bestSharing(candidates, artistIds) ??
    preferExact(candidates.filter(hasNoArtists)) ??
    null
  );
}

/**
 * Whether a new or edited album would be one that's already there, having its
 * name: artists in common, or no artists on one side to tell them apart.
 * Creating or renaming an album refuses this, and only this.
 */
export function isSameAlbumIdentity(
  a: readonly number[],
  b: readonly number[],
) {
  return a.length === 0 || b.length === 0 || shared(a, b) > 0;
}

/**
 * Whether the album picker can offer a typed name as a new album: not when
 * that would be one that's already listed (by these artists, or with nobody
 * to tell them apart). A same-named album by someone else doesn't stop it.
 */
export function canAddAlbumNamed(
  name: string,
  albums: readonly {
    name: string;
    artists: readonly { name: string }[];
  }[],
  artistNames: readonly string[],
) {
  const key = nameKey(name);
  const mine = new Set(artistNames.map(nameKey));
  return !albums.some(
    (album) =>
      nameKey(album.name) === key &&
      (mine.size === 0 ||
        album.artists.length === 0 ||
        album.artists.some((artist) => mine.has(nameKey(artist.name)))),
  );
}
