import {
  getImagePathFromDirectory,
  getImageStorageVariants,
  splitImageData,
} from "./image-storage-step-service";
import { assertImageDirectoryExistsWithDependencies } from "./image-storage-directory-service";
import type {
  ImageStorageDependencies,
} from "./image-storage-dependencies-service";

export type {
  ImageStorageDependencies,
} from "./image-storage-dependencies-service";
export type {
  ImageStoragePaths,
  ImageStorageVariant,
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

export async function saveCoverImageWithDependencies(
  base64Image: string | null | undefined,
  dependencies: ImageStorageDependencies,
) {
  if (!base64Image) {
    return null;
  }

  await assertImageDirectoryExistsWithDependencies(dependencies);

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
