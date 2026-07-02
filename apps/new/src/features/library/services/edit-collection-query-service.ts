export type EditCollectionKind = "album" | "artist" | "playlist";

export type EditCollectionAlbumRow = {
  coverImage: string | null;
  name: string | null;
  year: number | null;
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
  imagePath: string | null;
  isMissing: boolean;
  name: string;
  year: string;
};

const imagePathOrNull = ({
  getImagePath,
  imageHash,
}: {
  getImagePath: (imageHash: string) => string;
  imageHash: string | null | undefined;
}) => (imageHash ? getImagePath(imageHash) : null);

export const buildEditCollectionState = ({
  albumRow,
  artistRow,
  getImagePath,
  hasLoaded,
  kind,
  playlistRow,
}: {
  albumRow?: EditCollectionAlbumRow;
  artistRow?: EditCollectionArtistRow;
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
  kind: EditCollectionKind;
  playlistRow?: EditCollectionPlaylistRow;
}): EditCollectionState => {
  if (kind === "album") {
    return {
      imagePath: imagePathOrNull({
        getImagePath,
        imageHash: albumRow?.coverImage,
      }),
      isMissing: hasLoaded && !albumRow,
      name: albumRow?.name ?? "",
      year: albumRow?.year?.toString() ?? "",
    };
  }

  if (kind === "artist") {
    return {
      imagePath: imagePathOrNull({
        getImagePath,
        imageHash: artistRow?.profileImage,
      }),
      isMissing: hasLoaded && !artistRow,
      name: artistRow?.name ?? "",
      year: "",
    };
  }

  return {
    imagePath: imagePathOrNull({
      getImagePath,
      imageHash: playlistRow?.coverImage,
    }),
    isMissing: hasLoaded && !playlistRow,
    name: playlistRow?.name ?? "",
    year: "",
  };
};
