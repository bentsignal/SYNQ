const settingsDirectoryName = "settings";

export const getSettingsDirectoryWithDependencies = ({
  documentDirectory,
}: {
  documentDirectory: string | null;
}) => {
  if (!documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  return `${documentDirectory}${settingsDirectoryName}`;
};

export const getSettingsFileWithDependencies = ({
  documentDirectory,
  fileName,
}: {
  documentDirectory: string | null;
  fileName: string;
}) => `${getSettingsDirectoryWithDependencies({ documentDirectory })}/${fileName}`;
