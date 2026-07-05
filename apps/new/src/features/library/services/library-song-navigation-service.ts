export type LibrarySongRelationshipKind = "album" | "artist" | "playlist";

export type LibrarySongRelationshipHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export type LibrarySongDetailHref =
  | "/player"
  | "/(tabs)/library"
  | `/(tabs)/library/song/add-to-playlist/${number}`
  | `/(tabs)/library/song/${number}`
  | `/(tabs)/library/song/edit/${number}`;

export const getLibrarySongRelationshipHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibrarySongRelationshipKind;
}): LibrarySongRelationshipHref => {
  switch (kind) {
    case "album":
      return `/(tabs)/library/album/${id}`;
    case "artist":
      return `/(tabs)/library/artist/${id}`;
    case "playlist":
    default:
      return `/(tabs)/library/playlist/${id}`;
  }
};

export const getLibrarySongDetailPlayerHref = (): LibrarySongDetailHref =>
  "/player";

export const getLibrarySongDetailBackHref = (): LibrarySongDetailHref =>
  "/(tabs)/library";

export const getLibrarySongDetailHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref => `/(tabs)/library/song/${songId}`;

export const getLibrarySongEditHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref => `/(tabs)/library/song/edit/${songId}`;

export const getLibrarySongAddToPlaylistHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref =>
  `/(tabs)/library/song/add-to-playlist/${songId}`;

export const getLibrarySongDeleteSuccessHref = (): LibrarySongDetailHref =>
  getLibrarySongDetailBackHref();
