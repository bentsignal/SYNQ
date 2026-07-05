import { getEditCollectionImagePath } from "./edit-collection-image-service";
import type {
  EditCollectionAlbumArtistRow,
  EditCollectionAlbumRow,
  EditCollectionState,
} from "./edit-collection-state-service";

export const buildEditAlbumCollectionState = ({
  albumArtistRows = [],
  albumRow,
  getImagePath,
  hasLoaded,
}: {
  albumArtistRows?: EditCollectionAlbumArtistRow[];
  albumRow?: EditCollectionAlbumRow;
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
}): EditCollectionState => {
  const artistNames = albumArtistRows
    .flatMap((artist) => (artist.name ? [artist.name] : []))
    .sort((first, second) => first.localeCompare(second))
    .join(", ");

  return {
    artistNames,
    imagePath: getEditCollectionImagePath({
      getImagePath,
      imageHash: albumRow?.coverImage,
    }),
    isMissing: hasLoaded && !albumRow,
    name: albumRow?.name ?? "",
    year: albumRow?.year?.toString() ?? "",
  };
};
