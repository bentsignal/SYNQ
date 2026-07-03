import {
  assertLibrarySongTitle,
  getLibrarySongCoverUpdateTarget,
  normalizeLibrarySongTitle,
} from "./song-metadata-update-step-repository";

export { assertLibrarySongTitle, normalizeLibrarySongTitle };

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

  const target = getLibrarySongCoverUpdateTarget({
    albumIds,
    coverImage: await dependencies.saveCoverImage(coverImageDataUrl),
    songId: id,
  });

  if (!target) {
    return;
  }

  if (target.kind === "album") {
    await dependencies.updateAlbumCover({
      albumId: target.albumId,
      coverImage: target.coverImage,
    });
    return;
  }

  await dependencies.updateSongCover({
    coverImage: target.coverImage,
    songId: target.songId,
  });
}
