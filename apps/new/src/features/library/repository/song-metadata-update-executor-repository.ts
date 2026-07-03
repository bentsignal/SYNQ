export type SongMetadataUpdateDependencies = {
  replaceRelationships: (params: {
    albumNames: string;
    artistNames: string;
    songId: number;
  }) => Promise<{ albumIds: number[] }>;
  saveCoverImage: (coverImageDataUrl?: string | null) => Promise<string | null>;
  updateAlbumCover: (params: {
    albumId: number;
    coverImage: string;
  }) => Promise<void>;
  updateSongCover: (params: {
    coverImage: string;
    songId: number;
  }) => Promise<void>;
  updateSongTitle: (params: {
    songId: number;
    title: string;
  }) => Promise<void>;
};

export const normalizeLibrarySongTitle = (title: string) => title.trim();

export const assertLibrarySongTitle = (title: string) => {
  const cleanTitle = normalizeLibrarySongTitle(title);

  if (!cleanTitle) {
    throw new Error("Song title is required.");
  }

  return cleanTitle;
};

export async function updateLibrarySongMetadataWithDependencies(
  {
    albumNames,
    artistNames,
    coverImageDataUrl,
    id,
    title,
  }: {
    albumNames: string;
    artistNames: string;
    coverImageDataUrl?: string | null;
    id: number;
    title: string;
  },
  dependencies: SongMetadataUpdateDependencies,
) {
  const cleanTitle = assertLibrarySongTitle(title);

  await dependencies.updateSongTitle({ songId: id, title: cleanTitle });

  const { albumIds } = await dependencies.replaceRelationships({
    albumNames,
    artistNames,
    songId: id,
  });

  if (coverImageDataUrl === undefined) {
    return;
  }

  const coverImage = await dependencies.saveCoverImage(coverImageDataUrl);

  if (!coverImage) {
    return;
  }

  const firstAlbumId = albumIds[0];

  if (firstAlbumId) {
    await dependencies.updateAlbumCover({ albumId: firstAlbumId, coverImage });
    return;
  }

  await dependencies.updateSongCover({ coverImage, songId: id });
}
