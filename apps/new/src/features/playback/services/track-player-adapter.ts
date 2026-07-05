import {
  makePlaybackCommandRuntime,
  NativeModulePlayerLayer,
  type PlaybackEvent,
  type PlaybackState as SynqPlaybackState,
  type PlaybackTrack,
} from "@synq/native-audio";
import { Asset } from "expo-asset";
import { ManagedRuntime } from "effect";

import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  configurePlaybackAudio,
  getSynqNativePlaybackTrack,
  playbackAdAudio,
} from "./playback-native-audio-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

export type TrackPlayerAdapter = {
  destroy: () => Promise<void>;
  pause: () => Promise<void>;
  play: (song: PlaybackQueueItem) => Promise<void>;
  playAd: () => Promise<void>;
  restore: (state: PlaybackState) => Promise<void>;
  resume: () => Promise<void>;
  resumeLibrary: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setStatusListener: (
    listener: ((status: TrackPlayerStatusSnapshot) => void) | null,
  ) => void;
  stop: () => Promise<void>;
};

export const createUnavailableTrackPlayerAdapter = (): TrackPlayerAdapter => ({
  destroy: () => Promise.resolve(),
  pause: () => Promise.resolve(),
  play: () => Promise.resolve(),
  playAd: () => Promise.resolve(),
  restore: () => Promise.resolve(),
  resume: () => Promise.resolve(),
  resumeLibrary: () => Promise.resolve(),
  seekTo: () => Promise.resolve(),
  setStatusListener: () => {},
  stop: () => Promise.resolve(),
});

const playbackRuntime = makePlaybackCommandRuntime(
  ManagedRuntime.make(NativeModulePlayerLayer),
);

const getAdPlaybackTrack = async (): Promise<PlaybackTrack> => {
  const asset = Asset.fromModule(playbackAdAudio);
  await asset.downloadAsync();

  return {
    id: "synq-ad-break",
    title: "Advertisement",
    uri: asset.localUri ?? asset.uri,
  };
};

const getSnapshotFromState = ({
  source,
  state,
}: {
  source: "ad" | "library" | null;
  state: SynqPlaybackState;
}): TrackPlayerStatusSnapshot => ({
  didJustFinish: state.status === "ended",
  duration: state.durationMs || null,
  isLoaded: Boolean(state.activeTrack),
  isPlaying: state.status === "playing" || state.status === "buffering",
  position: state.positionMs,
  songId:
    source === "library" && state.activeTrack
      ? Number(state.activeTrack.id)
      : null,
  source,
});

const shouldEmitState = (event: PlaybackEvent): event is Extract<
  PlaybackEvent,
  { _tag: "StateChanged" }
> => event._tag === "StateChanged";

export const createExpoAudioTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let activeSource: "ad" | "library" | null = null;
  let activeLibraryTrack: PlaybackQueueItem | null = null;
  let statusListener: ((status: TrackPlayerStatusSnapshot) => void) | null =
    null;
  let eventSubscription: { remove: () => void } | null = null;

  const emitState = (state: SynqPlaybackState) => {
    statusListener?.(
      getSnapshotFromState({
        source: activeSource,
        state,
      }),
    );
  };

  const ensureEventSubscription = () => {
    if (eventSubscription) {
      return;
    }

    eventSubscription = playbackRuntime.addEventListener((event) => {
      if (shouldEmitState(event)) {
        emitState(event.state);
      }
    });
  };

  const configureNativePlayback = async () => {
    await configurePlaybackAudio();
    await playbackRuntime.runCommand({
      _tag: "Configure",
      options: {
        androidNotificationChannelId: "synq-playback",
        androidNotificationChannelName: "Playback",
        iosCategory: "playback",
        playsInBackground: true,
      },
    });
    ensureEventSubscription();
  };

  const playSong = async (song: PlaybackQueueItem) => {
    await configureNativePlayback();
    activeSource = "library";
    activeLibraryTrack = song;

    const track = getSynqNativePlaybackTrack(song);
    const state = await playbackRuntime.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: track.id,
        tracks: [track],
      },
    });
    emitState(state);
    emitState(await playbackRuntime.runCommand({ _tag: "Play", trackId: track.id }));
  };

  const playAd = async () => {
    await configureNativePlayback();
    activeSource = "ad";

    const track = await getAdPlaybackTrack();
    const state = await playbackRuntime.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: track.id,
        tracks: [track],
      },
    });
    emitState(state);
    emitState(await playbackRuntime.runCommand({ _tag: "Play", trackId: track.id }));
  };

  return {
    destroy: async () => {
      eventSubscription?.remove();
      eventSubscription = null;
      activeSource = null;
      activeLibraryTrack = null;
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
    pause: async () => {
      emitState(await playbackRuntime.runCommand({ _tag: "Pause" }));
    },
    play: playSong,
    playAd,
    restore: async (state) => {
      const activeSong =
        state.activeQueueIndex === null
          ? null
          : state.queue[state.activeQueueIndex] ?? null;

      if (activeSong && state.isPlaying) {
        await playSong(activeSong);
      }
    },
    resume: async () => {
      emitState(await playbackRuntime.runCommand({ _tag: "Play" }));
    },
    resumeLibrary: async () => {
      if (activeLibraryTrack) {
        await playSong(activeLibraryTrack);
        return;
      }

      activeSource = "library";
      emitState(await playbackRuntime.runCommand({ _tag: "Play" }));
    },
    seekTo: async (position) => {
      emitState(
        await playbackRuntime.runCommand({ _tag: "SeekTo", positionMs: position }),
      );
    },
    setStatusListener: (listener) => {
      statusListener = listener;
      if (listener) {
        ensureEventSubscription();
        void playbackRuntime.getState().then(emitState);
      }
    },
    stop: async () => {
      activeSource = null;
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
  };
};
