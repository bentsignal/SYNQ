export const getLibrarySongDirectoryPath = ({
  documentDirectory,
  songId,
}: {
  documentDirectory: string;
  songId: number;
}) => `${documentDirectory}library/${songId}`;
