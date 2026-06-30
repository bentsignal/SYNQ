import { resetDatabaseConnection } from "@synq/db";

export const resetBackupDatabaseConnection = async () => {
  await resetDatabaseConnection();
};
