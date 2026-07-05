import { getEditCollectionImagePath } from "./edit-collection-image-service";
import type {
  EditCollectionArtistRow,
  EditCollectionState,
} from "./edit-collection-state-service";

export const buildEditArtistCollectionState = ({
  artistRow,
  getImagePath,
  hasLoaded,
}: {
  artistRow?: EditCollectionArtistRow;
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
}): EditCollectionState => ({
  artistNames: "",
  imagePath: getEditCollectionImagePath({
    getImagePath,
    imageHash: artistRow?.profileImage,
  }),
  isMissing: hasLoaded && !artistRow,
  name: artistRow?.name ?? "",
  year: "",
});
