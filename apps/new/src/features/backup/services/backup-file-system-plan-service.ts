export type BackupFileMovePlan = {
  from: string;
  to: string;
};

export const getBackupDocumentDirectoryDeletePaths = ({
  documentDirectory,
  items,
}: {
  documentDirectory: string;
  items: string[];
}) => items.map((item) => `${documentDirectory}${item}`);

export const assertBackupRestoreStagedItems = (stagedItems: string[]) => {
  if (stagedItems.length === 0) {
    throw new Error("Backup archive did not contain any library files.");
  }

  return stagedItems;
};

export const getBackupRestoreStagedItemMoves = ({
  documentDirectory,
  stagedItems,
  stagingDirectory,
}: {
  documentDirectory: string;
  stagedItems: string[];
  stagingDirectory: string;
}): BackupFileMovePlan[] =>
  stagedItems.map((item) => ({
    from: `${stagingDirectory}${item}`,
    to: `${documentDirectory}${item}`,
  }));
