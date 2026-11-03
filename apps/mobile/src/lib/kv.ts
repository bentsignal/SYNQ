import { SQLiteStorage } from "expo-sqlite/kv-store";

/**
 * Small values that must be ready before the first render (preferences,
 * the playback session), read and written synchronously. Its own SQLite
 * file next to the library database, so a library restore or erase never
 * touches it by accident.
 */
const storage = new SQLiteStorage("preferences.db");

/**
 * The value stored at `key`, checked by `decode` (which gets `undefined`
 * when the key is missing or its JSON is unreadable).
 */
export function readJson<Value>(
  key: string,
  decode: (stored: unknown) => Value,
) {
  try {
    const raw = storage.getItemSync(key);
    return decode(raw === null ? undefined : JSON.parse(raw));
  } catch {
    return decode(undefined);
  }
}

export function writeJson(key: string, value: unknown) {
  storage.setItemSync(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  storage.removeItemSync(key);
}
