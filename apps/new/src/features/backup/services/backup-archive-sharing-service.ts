import * as Sharing from "expo-sharing";

export const isBackupArchiveSharingAvailable = Sharing.isAvailableAsync;

export const shareBackupArchive = Sharing.shareAsync;
