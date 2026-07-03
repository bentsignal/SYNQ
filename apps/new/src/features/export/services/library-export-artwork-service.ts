export type LibraryExportArtworkTag = {
  description: "Album Cover";
  imageBuffer: string;
  mime: "image/jpeg";
};

export type LibraryExportArtworkDependencies = {
  getImagePathFromHash: (hash: string) => { pathToFullImage: string };
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  readAsString: (
    path: string,
    options: { encoding: "base64" },
  ) => Promise<string>;
};

export const loadArtworkTagWithDependencies = async (
  coverImage: string | null,
  dependencies: LibraryExportArtworkDependencies,
): Promise<LibraryExportArtworkTag | null> => {
  if (!coverImage) {
    return null;
  }

  const { pathToFullImage } = dependencies.getImagePathFromHash(coverImage);
  const fileInfo = await dependencies.getInfo(pathToFullImage);

  if (!fileInfo.exists) {
    return null;
  }

  return {
    description: "Album Cover",
    imageBuffer: await dependencies.readAsString(pathToFullImage, {
      encoding: "base64",
    }),
    mime: "image/jpeg",
  };
};
