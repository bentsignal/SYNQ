import type { ImageStorageDependencies } from "./image-storage-dependencies-service";

export const assertImageDirectoryExistsWithDependencies = async (
  dependencies: Pick<
    ImageStorageDependencies,
    "createDirectory" | "imageDirectory"
  >,
) => {
  if (!dependencies.imageDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  await dependencies.createDirectory(dependencies.imageDirectory, {
    intermediates: true,
  });
};
