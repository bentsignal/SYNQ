import type { PlayerState } from "./store";
import { getPlayerState, subscribePlayer } from "./store";

import "./startup";

import { useSyncExternalStore } from "react";

/**
 * Part of the player's state. Re-renders only when `select`'s result
 * changes, so return primitives or parts of the state as they are.
 */
export function usePlayer<Selected>(select: (state: PlayerState) => Selected) {
  return useSyncExternalStore(subscribePlayer, () => select(getPlayerState()));
}
