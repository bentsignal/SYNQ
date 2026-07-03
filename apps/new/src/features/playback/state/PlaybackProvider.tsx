import type { ReactNode } from "react";
import { createStore } from "rostra";
import {
  usePlaybackSessionStore,
  type PlaybackSessionValue,
} from "../hooks/use-playback-session-store";

const { Store, useStore } = createStore<object, PlaybackSessionValue>(
  usePlaybackSessionStore,
);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  return <Store>{children}</Store>;
}

export function usePlaybackSessionSelector<SelectedValue>(
  selector: (store: PlaybackSessionValue) => SelectedValue,
) {
  return useStore(selector);
}
