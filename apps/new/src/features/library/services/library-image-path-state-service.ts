type ImagePathSet = {
  pathToSmallImage: string;
};

export type LibraryImagePathResolver = (imageHash: string) => ImagePathSet;

export const getLibrarySmallImagePathWithResolver = ({
  getImagePath,
  imageHash,
}: {
  getImagePath: LibraryImagePathResolver;
  imageHash: string;
}) => getImagePath(imageHash).pathToSmallImage;
