import type { ImportItem } from "./session";
import { PENDING } from "./session";

function songs(n: number) {
  return `${String(n)} ${n === 1 ? "Song" : "Songs"}`;
}

/** "Importing 3 of 12", "12 Songs Imported", "1 Song Imported · 4 Need Premium". */
export function progressLine(items: readonly ImportItem[]) {
  const imported = items.filter((item) => item.status === "imported").length;
  const locked = items.filter((item) => item.status === "locked").length;
  const failed = items.filter((item) => item.status === "failed").length;
  const pending = items.some((item) => PENDING.has(item.status));
  if (pending) {
    const total = items.length - failed - locked;
    return `Importing ${String(Math.min(imported + 1, total))} of ${String(total)}`;
  }
  return [
    imported > 0 ? `${songs(imported)} Imported` : null,
    locked > 0 ? `${String(locked)} Need Premium` : null,
    failed > 0 ? `${String(failed)} Couldn't Import` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
