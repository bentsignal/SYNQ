import {
  createAlbumWithDependencies,
  type AlbumCreateDependencies,
} from "./album-create-executor-repository";
import {
  createArtistWithDependencies,
  type ArtistCreateDependencies,
} from "./artist-create-executor-repository";
import {
  assertCreatedCollectionId,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
} from "./collection-create-step-repository";

export type CollectionCreateDependencies = AlbumCreateDependencies &
  ArtistCreateDependencies & {
  assertUniqueCollectionName: (params: {
    kind: "album" | "artist" | "playlist";
    name: string;
  }) => Promise<void>;
  insertPlaylistRow: (params: {
    coverImage: string | null;
    name: string;
  }) => Promise<number | null>;
};

export async function createPlaylistWithDependencies(
  {
    coverImage,
    name,
  }: {
    coverImage?: string | null;
    name: string;
  },
  dependencies: CollectionCreateDependencies,
) {
  const cleanName = await getUniqueCollectionCreateName({
    dependencies,
    kind: "playlist",
    name,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertPlaylistRow({
      coverImage: await getRequiredCollectionCoverCreate({
        coverImage,
        dependencies,
      }),
      name: cleanName,
    }),
    kind: "Playlist",
  });

  return {
    id,
    name: cleanName,
  };
}

export {
  createAlbumWithDependencies,
  type AlbumCreateDependencies,
  createArtistWithDependencies,
  type ArtistCreateDependencies,
};
