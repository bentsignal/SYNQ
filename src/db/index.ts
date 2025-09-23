import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "./migrations/migrations";

const expo = openDatabaseSync("synq.db", { enableChangeListener: true });
expo.execSync("PRAGMA foreign_keys = ON");
export const db = drizzle(expo);

export const useInitDB = () => {
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio(expo);

  return { success, error };
};
