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
import {
  shouldEmitState,
  shouldHandleInterruption,
  shouldHandleRemoteCommand,
} from "./playback-native-event-classifier-service";
import { getPlaybackRemoteCommandFromNativeEvent } from "./playback-native-remote-command-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";
import {
  getTrackPlayerActiveLibraryTrack,
  getTrackPlayerRestoreTarget,
} from "./playback-track-player-restore-service";

export type TrackPlayerAdapter = {
  destroy: () => Promise<void>;
  pause: () => Promise<void>;
  play: (
    song: PlaybackQueueItem,
    options?: {
      activeTrackId?: number | null;
      mode?: PlaybackState["mode"];
      queue?: PlaybackQueueItem[];
    },
  ) => Promise<void>;
  playAd: () => Promise<void>;
  restore: (state: PlaybackState) => Promise<void>;
  resume: () => Promise<void>;
  resumeLibrary: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setPlaybackMode: (mode: PlaybackState["mode"]) => Promise<void>;
  syncLibraryQueue: (state: PlaybackState) => Promise<void>;
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
  setPlaybackMode: () => Promise.resolve(),
  syncLibraryQueue: () => Promise.resolve(),
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
    activeTrackId:
      source === "library" && state.activeTrack
        ? Number(state.activeTrack.id)
        : null,
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

export const createExpoAudioTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let activeSource: "ad" | "library" | null = null;
  let activeLibraryTrack: PlaybackQueueItem | null = null;
  let activeLibraryQueue: PlaybackQueueItem[] = [];
  let lastNativeState: SynqPlaybackState | null = null;
  let currentPlaybackMode: PlaybackState["mode"] = {
    loop: false,
    shuffle: false,
  };
  let remoteCommandListener: ((command: PlaybackRemoteCommand) => void) | null =
    null;
  let statusListener: ((status: TrackPlayerStatusSnapshot) => void) | null =
    null;
  let eventSubscription: { remove: () => void } | null = null;
  let statePoll: ReturnType<typeof setInterval> | null = null;

  const emitState = (state: SynqPlaybackState) => {
    lastNativeState = state;

    if (activeSource === "library" && state.activeTrack) {
      activeLibraryTrack = getTrackPlayerActiveLibraryTrack({
        activeTrackId: state.activeTrack.id,
        currentTrack: activeLibraryTrack,
        queue: activeLibraryQueue,
      });
    }

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

  const handleInterruption = async (
    event: Extract<
      PlaybackEvent,
      { _tag: "InterruptionBegan" | "InterruptionEnded" }
    >,
  ) => {
    if (event._tag === "InterruptionBegan") {
      stopPollingState();
      if (lastNativeState) {
        emitState({
          ...lastNativeState,
          status: lastNativeState.activeTrack ? "paused" : "idle",
        });
      }
      return;
    }

    if (event.shouldResume) {
      emitState(await playbackRuntime.runCommand({ _tag: "Play" }));
      startPollingState();
      return;
    }

    await syncState();
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
        return;
      }

      if (shouldHandleInterruption(event)) {
        void handleInterruption(event).catch(() => {
          stopPollingState();
        });
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

  const playSong = async (
    song: PlaybackQueueItem,
    options: {
      activeTrackId?: number | null;
      mode?: PlaybackState["mode"];
      queue?: PlaybackQueueItem[];
    } = {},
  ) => {
    await configureNativePlayback();
    activeSource = "library";
    activeLibraryTrack = song;
    activeLibraryQueue = options.queue?.length ? options.queue : [song];

    const track = getSynqNativePlaybackTrack(song);
    const queueTracks = activeLibraryQueue.map(getSynqNativePlaybackTrack);
    const mode = options.mode ?? currentPlaybackMode;
    currentPlaybackMode = mode;
    const state = await playbackRuntime.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: String(options.activeTrackId ?? song.id),
        mode,
        tracks: queueTracks,
      },
    });
    emitState(state);
    emitState(await playbackRuntime.runCommand({ _tag: "Play", trackId: track.id }));
    startPollingState();
  };

  const syncLibraryQueue = async (state: PlaybackState) => {
    if (state.source?.type !== "library" || state.activeTrackId === null) {
      return;
    }

    const activeTrack = state.queue.find((song) => song.id === state.activeTrackId);
    if (!activeTrack) {
      return;
    }

    await configureNativePlayback();
    activeSource = "library";
    activeLibraryTrack = activeTrack;
    activeLibraryQueue = state.queue;
    currentPlaybackMode = state.mode;

    emitState(
      await playbackRuntime.runCommand({
        _tag: "LoadQueue",
        queue: {
          activeTrackId: String(state.activeTrackId),
          mode: state.mode,
          tracks: state.queue.map(getSynqNativePlaybackTrack),
        },
      }),
    );

    if (state.isPlaying) {
      startPollingState();
    }
  };

  const playAd = async () => {
    await configureNativePlayback();
    activeSource = "ad";

    const track = await getAdPlaybackTrack();
    const state = await playbackRuntime.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: track.id,
        mode: {
          loop: false,
          shuffle: false,
        },
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
      activeLibraryQueue = [];
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
    pause: async () => {
      stopPollingState();
      emitState(await playbackRuntime.runCommand({ _tag: "Pause" }));
    },
    play: playSong,
    playAd,
    restore: async (state) => {
      const restoreTarget = getTrackPlayerRestoreTarget(state);

      if (!restoreTarget) {
        return;
      }

      activeSource = "library";
      activeLibraryTrack = restoreTarget.activeTrack;
      activeLibraryQueue = restoreTarget.queue;
      currentPlaybackMode = restoreTarget.mode;

      if (state.isPlaying) {
        await playSong(restoreTarget.activeTrack, {
          activeTrackId: restoreTarget.activeTrackId,
          mode: restoreTarget.mode,
          queue: restoreTarget.queue,
        });
        return;
      }

      await configureNativePlayback();
      const restoredState = await playbackRuntime.runCommand({
        _tag: "LoadQueue",
        queue: {
          activeTrackId: String(restoreTarget.activeTrackId),
          mode: restoreTarget.mode,
          tracks: restoreTarget.queue.map(getSynqNativePlaybackTrack),
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
    setPlaybackMode: async (mode) => {
      currentPlaybackMode = mode;
      emitState(
        await playbackRuntime.runCommand({
          _tag: "SetQueueMode",
          mode,
        }),
      );
    },
    syncLibraryQueue,
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
      activeLibraryTrack = null;
      activeLibraryQueue = [];
      emitState(await playbackRuntime.runCommand({ _tag: "Stop" }));
    },
  };
};
