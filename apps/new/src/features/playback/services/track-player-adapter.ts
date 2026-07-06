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
import type { PlaybackRemoteCommand } from "./playback-remote-command-service";
import {
  configurePlaybackAudio,
  getSynqNativePlaybackTrack,
  playbackAdAudio,
} from "./playback-native-audio-service";
import { getPlaybackRemoteCommandFromNativeEvent } from "./playback-native-remote-command-service";
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
  setRemoteCommandListener: (
    listener: ((command: PlaybackRemoteCommand) => void) | null,
  ) => void;
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
  setRemoteCommandListener: () => {},
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
}): TrackPlayerStatusSnapshot => {
  const duration = Number.isFinite(state.durationMs)
    ? Math.max(0, state.durationMs)
    : (state.activeTrack?.durationMs ?? 0);
  const position = Number.isFinite(state.positionMs)
    ? Math.max(0, state.positionMs)
    : 0;

  return {
    didJustFinish: state.status === "ended",
    duration: duration || null,
    isLoaded: Boolean(state.activeTrack),
    isPlaying: state.status === "playing" || state.status === "buffering",
    position,
    songId:
      source === "library" && state.activeTrack
        ? Number(state.activeTrack.id)
        : null,
    source,
  };
};

const shouldEmitState = (event: PlaybackEvent): event is Extract<
  PlaybackEvent,
  { _tag: "StateChanged" }
> => event._tag === "StateChanged";

const shouldHandleRemoteCommand = (event: PlaybackEvent): event is Extract<
  PlaybackEvent,
  { _tag: "RemoteCommand" }
> => event._tag === "RemoteCommand";

export const createExpoAudioTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let activeSource: "ad" | "library" | null = null;
  let activeLibraryTrack: PlaybackQueueItem | null = null;
  let lastNativeState: SynqPlaybackState | null = null;
  let remoteCommandListener: ((command: PlaybackRemoteCommand) => void) | null =
    null;
  let statusListener: ((status: TrackPlayerStatusSnapshot) => void) | null =
    null;
  let eventSubscription: { remove: () => void } | null = null;
  let statePoll: ReturnType<typeof setInterval> | null = null;

  const emitState = (state: SynqPlaybackState) => {
    lastNativeState = state;
    statusListener?.(
      getSnapshotFromState({
        source: activeSource,
        state,
      }),
    );
  };

  const emitRemoteCommand = (event: Extract<PlaybackEvent, { _tag: "RemoteCommand" }>) => {
    if (!remoteCommandListener) {
      return;
    }

    remoteCommandListener(
      getPlaybackRemoteCommandFromNativeEvent({
        event,
        state: lastNativeState,
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
        return;
      }

      if (shouldHandleRemoteCommand(event)) {
        emitRemoteCommand(event);
      }
    });
  };

  const stopPollingState = () => {
    if (statePoll) {
      clearInterval(statePoll);
      statePoll = null;
    }
  };

  const syncState = async () => {
    const state = await playbackRuntime.getState();
    lastNativeState = state;
    emitState(state);

    if (state.status !== "playing" && state.status !== "buffering") {
      stopPollingState();
    }

    return state;
  };

  const startPollingState = () => {
    if (statePoll) {
      return;
    }

    statePoll = setInterval(() => {
      void syncState().catch(() => {
        stopPollingState();
      });
    }, 1000);
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
    startPollingState();
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
    startPollingState();
  };

  return {
    destroy: async () => {
      eventSubscription?.remove();
      eventSubscription = null;
      stopPollingState();
      activeSource = null;
      activeLibraryTrack = null;
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
    pause: async () => {
      stopPollingState();
      emitState(await playbackRuntime.runCommand({ _tag: "Pause" }));
    },
    play: playSong,
    playAd,
    restore: async (state) => {
      const activeSong =
        state.activeQueueIndex === null
          ? null
          : state.queue[state.activeQueueIndex] ?? null;

      if (!activeSong) {
        return;
      }

      activeSource = "library";
      activeLibraryTrack = activeSong;

      if (state.isPlaying) {
        await playSong(activeSong);
        return;
      }

      await configureNativePlayback();
      const track = getSynqNativePlaybackTrack(activeSong);
      const restoredState = await playbackRuntime.runCommand({
        _tag: "LoadQueue",
        queue: {
          activeTrackId: track.id,
          tracks: [track],
        },
      });
      emitState(restoredState);
    },
    resume: async () => {
      emitState(await playbackRuntime.runCommand({ _tag: "Play" }));
      startPollingState();
    },
    resumeLibrary: async () => {
      if (activeLibraryTrack) {
        await playSong(activeLibraryTrack);
        return;
      }

      activeSource = "library";
      emitState(await playbackRuntime.runCommand({ _tag: "Play" }));
      startPollingState();
    },
    seekTo: async (position) => {
      emitState(
        await playbackRuntime.runCommand({ _tag: "SeekTo", positionMs: position }),
      );
    },
    setRemoteCommandListener: (listener) => {
      remoteCommandListener = listener;
      if (listener) {
        ensureEventSubscription();
      }
    },
    setStatusListener: (listener) => {
      statusListener = listener;
      if (listener) {
        ensureEventSubscription();
        void playbackRuntime.getState().then(emitState);
      }
    },
    stop: async () => {
      stopPollingState();
      activeSource = null;
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
  };
};
