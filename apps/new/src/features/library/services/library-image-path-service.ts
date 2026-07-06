import { getImagePathFromHash } from "../../images/services/image-storage-service";
import { getLibrarySmallImagePathWithResolver } from "./library-image-path-state-service";

export const getLibrarySmallImagePath = (imageHash: string) =>
  getLibrarySmallImagePathWithResolver({
    getImagePath: getImagePathFromHash,
    imageHash,
  });
