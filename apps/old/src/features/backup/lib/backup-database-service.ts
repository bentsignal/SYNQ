import Model from "@/src/models/Model";

export const resetBackupDatabaseConnection = async () => {
  await Model.reconnect();
  await Model.createTables();
};
