import { getEditCollectionImagePath } from "./edit-collection-image-service";
import type {
  EditCollectionPlaylistRow,
  EditCollectionState,
} from "./edit-collection-state-service";

export const buildEditPlaylistCollectionState = ({
  getImagePath,
  hasLoaded,
  playlistRow,
}: {
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
  playlistRow?: EditCollectionPlaylistRow;
}): EditCollectionState => ({
  artistNames: "",
  imagePath: getEditCollectionImagePath({
    getImagePath,
    imageHash: playlistRow?.coverImage,
  }),
  isMissing: hasLoaded && !playlistRow,
  name: playlistRow?.name ?? "",
  year: "",
});
