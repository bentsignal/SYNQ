export type LibrarySongCoverUpdateTarget =
  | {
      albumId: number;
      coverImage: string;
      kind: "album";
    }
  | {
      coverImage: string;
      kind: "song";
      songId: number;
    };

export const normalizeLibrarySongTitle = (title: string) => title.trim();

export const assertLibrarySongTitle = (title: string) => {
  const cleanTitle = normalizeLibrarySongTitle(title);

  if (!cleanTitle) {
    throw new Error("Song title is required.");
  }

  return cleanTitle;
};

export const getLibrarySongCoverUpdateTarget = ({
  albumIds,
  coverImage,
  songId,
}: {
  albumIds: number[];
  coverImage: string | null;
  songId: number;
}): LibrarySongCoverUpdateTarget | null => {
  if (!coverImage) {
    return null;
  }

  const firstAlbumId = albumIds[0];

  if (firstAlbumId) {
    return {
      albumId: firstAlbumId,
      coverImage,
      kind: "album",
    };
  }

  return {
    coverImage,
    kind: "song",
    songId,
  };
};
