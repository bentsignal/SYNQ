import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate, useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "./migrations/migrations";

const openSynqDatabase = () => {
  const expo = openDatabaseSync("synq.db", { enableChangeListener: true });
  expo.execSync("PRAGMA foreign_keys = ON");
  return expo;
};

let expo = openSynqDatabase();
export let db = drizzle(expo);

export const resetDatabaseConnection = async () => {
  try {
    await db.$client.closeAsync();
  } catch (error) {
    console.log("Error closing database before reset:", error);
  }

  expo = openSynqDatabase();
  db = drizzle(expo);
  await migrate(db, migrations);
};

export const useInitDB = () => {
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio(expo);

  return { success, error };
};
