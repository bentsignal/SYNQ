import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { insertAlbumRow } from "./album-create-repository";
import { insertArtistRow } from "./artist-create-repository";
import {
  createAlbumWithDependencies,
  createArtistWithDependencies,
  createPlaylistWithDependencies,
} from "./collection-create-executor-repository";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";
import { insertPlaylistRow } from "./playlist-create-repository";

const collectionCreateDependencies = {
  assertUniqueCollectionName,
  insertAlbumRow,
  insertArtistRow,
  insertPlaylistRow,
  saveCoverImage,
};

export async function createAlbum({
  coverImage,
  name,
  year,
}: {
  coverImage?: string | null;
  name: string;
  year?: number;
}) {
  return createAlbumWithDependencies(
    {
      coverImage,
      name,
      year,
    },
    collectionCreateDependencies,
  );
}

export async function createArtist(name: string) {
  return createArtistWithDependencies({ name }, collectionCreateDependencies);
}

export async function createArtistWithImage({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string | null;
}) {
  return createArtistWithDependencies(
    {
      name,
      profileImage,
    },
    collectionCreateDependencies,
  );
}

export async function createPlaylist({
  coverImage,
  name,
}: {
  coverImage?: string | null;
  name: string;
}) {
  return createPlaylistWithDependencies(
    {
      coverImage,
      name,
    },
    collectionCreateDependencies,
  );
}
