export type ImageStoragePaths = {
  pathToFullImage: string;
  pathToSmallImage: string;
};

export type ImageStorageVariant = {
  base64: string;
  compress: number;
  path: string;
  width: number;
};

export const splitImageData = (image: string) => {
  const [metadata, buffer] = image.split(",");
  const mime = metadata?.match(/^data:(.*);base64$/)?.[1] ?? "";

  return {
    buffer,
    mime,
  };
};

export const getImagePathFromDirectory = ({
  hash,
  imageDirectory,
}: {
  hash: string;
  imageDirectory: string;
}): ImageStoragePaths => ({
  pathToFullImage: `${imageDirectory}/${hash}-full.jpg`,
  pathToSmallImage: `${imageDirectory}/${hash}-small.jpg`,
});

export const getImageStorageVariants = ({
  base64,
  paths,
}: {
  base64: string;
  paths: ImageStoragePaths;
}): ImageStorageVariant[] => [
  {
    base64,
    compress: 1,
    path: paths.pathToFullImage,
    width: 1500,
  },
  {
    base64,
    compress: 0.5,
    path: paths.pathToSmallImage,
    width: 200,
  },
];
