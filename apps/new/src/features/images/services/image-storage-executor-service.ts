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

export type ImageStorageDependencies = {
  createDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  digestImageSample: (sample: string) => Promise<string>;
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  hasStoredImageHash: (hash: string) => Promise<boolean>;
  imageDirectory: string | null;
  insertStoredImageHash: (hash: string) => Promise<void>;
  writeImageVariant: (variant: ImageStorageVariant) => Promise<void>;
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

export const getImagePathFromHashWithDependencies = (
  hash: string,
  dependencies: Pick<ImageStorageDependencies, "imageDirectory">,
) => {
  if (!dependencies.imageDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return getImagePathFromDirectory({
    hash,
    imageDirectory: dependencies.imageDirectory,
  });
};

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

const assertImageDirectoryExists = async (
  dependencies: ImageStorageDependencies,
) => {
  if (!dependencies.imageDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  await dependencies.createDirectory(dependencies.imageDirectory, {
    intermediates: true,
  });
};

export const checkStoredImageExistsWithDependencies = async (
  hash: string,
  dependencies: ImageStorageDependencies,
) => {
  const { pathToFullImage, pathToSmallImage } =
    getImagePathFromHashWithDependencies(hash, dependencies);
  const [fullImageFile, smallImageFile] = await Promise.all([
    dependencies.getInfo(pathToFullImage),
    dependencies.getInfo(pathToSmallImage),
  ]);
  const hasImageRow = await dependencies.hasStoredImageHash(hash);

  return fullImageFile.exists && smallImageFile.exists && hasImageRow;
};

export const writeImageToFileSystemWithDependencies = async ({
  base64Image,
  dependencies,
  hash,
}: {
  base64Image: string;
  dependencies: ImageStorageDependencies;
  hash: string;
}) => {
  const { buffer, mime } = splitImageData(base64Image);

  if (!buffer || (mime !== "image/jpeg" && mime !== "image/png")) {
    throw new Error(`Invalid image format: ${mime || "unknown"}`);
  }

  const paths = getImagePathFromHashWithDependencies(hash, dependencies);

  await Promise.all(
    getImageStorageVariants({ base64: buffer, paths }).map((variant) =>
      dependencies.writeImageVariant(variant),
    ),
  );
};

export async function saveCoverImageWithDependencies(
  base64Image: string | null | undefined,
  dependencies: ImageStorageDependencies,
) {
  if (!base64Image) {
    return null;
  }

  await assertImageDirectoryExists(dependencies);

  const hash = await dependencies.digestImageSample(base64Image.slice(0, 100));

  if (await checkStoredImageExistsWithDependencies(hash, dependencies)) {
    return hash;
  }

  await writeImageToFileSystemWithDependencies({
    base64Image,
    dependencies,
    hash,
  });
  await dependencies.insertStoredImageHash(hash);

  return hash;
}
