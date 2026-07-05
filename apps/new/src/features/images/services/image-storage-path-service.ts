const imageDirectoryName = "images";

export const getImageDirectoryWithDependencies = ({
  documentDirectory,
}: {
  documentDirectory: string | null;
}) => {
  if (!documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${documentDirectory}${imageDirectoryName}`;
};
