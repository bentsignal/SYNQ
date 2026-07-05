import {
  ensureSongMetadataAlbum,
  ensureSongMetadataAlbumArtistLinks,
  ensureSongMetadataArtist,
  type SongMetadataRelationshipDependencies,
} from "./song-metadata-relationship-step-repository";
import {
  normalizeSongMetadataRelationshipName,
  splitSongMetadataRelationshipNames,
} from "./song-metadata-relationship-name-repository";

export type { SongMetadataRelationshipDependencies };
export {
  normalizeSongMetadataRelationshipName,
  splitSongMetadataRelationshipNames,
};

export async function replaceLibrarySongMetadataRelationshipsWithDependencies(
  {
    albumNames,
    artistNames,
    songId,
  }: {
    albumNames: string;
    artistNames: string;
    songId: number;
  },
  dependencies: SongMetadataRelationshipDependencies,
) {
  const artistIds: number[] = [];
  const albumIds: number[] = [];

  await dependencies.deleteArtistSongRows(songId);
  await dependencies.deleteAlbumSongRows(songId);

  for (const artistName of splitSongMetadataRelationshipNames(artistNames)) {
    artistIds.push(await ensureSongMetadataArtist(artistName, dependencies));
  }

  for (const albumName of splitSongMetadataRelationshipNames(albumNames)) {
    albumIds.push(await ensureSongMetadataAlbum(albumName, dependencies));
  }

  if (artistIds.length > 0) {
    await dependencies.insertArtistSongRows(
      artistIds.map((artistId) => ({ artistId, songId })),
    );
  }

  if (albumIds.length > 0) {
    await dependencies.insertAlbumSongRows(
      albumIds.map((albumId) => ({ albumId, songId })),
    );
  }

  await ensureSongMetadataAlbumArtistLinks(
    { albumIds, artistIds },
    dependencies,
  );

  return {
    albumIds,
    artistIds,
  };
}
