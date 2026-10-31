/**
 * The free tier's import rules, 2.5.2's: one song per batch (each Files
 * pick, each Wi-Fi Transfer visit), after an 18-second wait shown as an
 * ad. Premium imports everything at once.
 */

/** 2.5.2's `importAdLength`. */
export const IMPORT_WAIT_MS = 18_000;

export type ImportGate = "import" | "wait-then-import" | "lock";

/** What happens to the next song a batch has read, in batch order. */
export function importGate({
  premium,
  freeSongUsed,
}: {
  premium: boolean;
  freeSongUsed: boolean;
}) {
  if (premium) return "import" satisfies ImportGate;
  return (freeSongUsed ? "lock" : "wait-then-import") satisfies ImportGate;
}
