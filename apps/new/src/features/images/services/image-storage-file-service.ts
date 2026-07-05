import type {
  ImageStorageDependencies,
} from "./image-storage-dependencies-service";
import {
  getImagePathFromDirectory,
  getImageStorageVariants,
  splitImageData,
} from "./image-storage-step-service";

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
