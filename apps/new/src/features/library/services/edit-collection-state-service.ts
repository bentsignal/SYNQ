import { buildEditAlbumCollectionState } from "./edit-album-collection-state-service";
import { buildEditArtistCollectionState } from "./edit-artist-collection-state-service";
import { buildEditPlaylistCollectionState } from "./edit-playlist-collection-state-service";

export type EditCollectionKind = "album" | "artist" | "playlist";

export type EditCollectionAlbumRow = {
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export type EditCollectionAlbumArtistRow = {
  id: number;
  name: string | null;
};

export type EditCollectionArtistRow = {
  name: string | null;
  profileImage: string | null;
};

export type EditCollectionPlaylistRow = {
  coverImage: string | null;
  name: string | null;
};

export type EditCollectionState = {
  artistNames: string;
  imagePath: string | null;
  isMissing: boolean;
  name: string;
  year: string;
};

export const buildEditCollectionState = ({
  albumArtistRows = [],
  albumRow,
  artistRow,
  getImagePath,
  hasLoaded,
  kind,
  playlistRow,
}: {
  albumArtistRows?: EditCollectionAlbumArtistRow[];
  albumRow?: EditCollectionAlbumRow;
  artistRow?: EditCollectionArtistRow;
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
  kind: EditCollectionKind;
  playlistRow?: EditCollectionPlaylistRow;
}): EditCollectionState => {
  if (kind === "album") {
    return buildEditAlbumCollectionState({
      albumArtistRows,
      albumRow,
      getImagePath,
      hasLoaded,
    });
  }

  if (kind === "artist") {
    return buildEditArtistCollectionState({
      artistRow,
      getImagePath,
      hasLoaded,
    });
  }

  return buildEditPlaylistCollectionState({
    getImagePath,
    hasLoaded,
    playlistRow,
  });
};
