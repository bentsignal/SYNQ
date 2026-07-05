import { assertImageDirectoryExistsWithDependencies } from "./image-storage-directory-service";
import type {
  ImageStorageDependencies,
} from "./image-storage-dependencies-service";
import {
  checkStoredImageExistsWithDependencies,
  writeImageToFileSystemWithDependencies,
} from "./image-storage-file-service";

export type {
  ImageStorageDependencies,
} from "./image-storage-dependencies-service";
export {
  checkStoredImageExistsWithDependencies,
  getImagePathFromHashWithDependencies,
  writeImageToFileSystemWithDependencies,
} from "./image-storage-file-service";
export type {
  ImageStoragePaths,
  ImageStorageVariant,
} from "./image-storage-step-service";

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
