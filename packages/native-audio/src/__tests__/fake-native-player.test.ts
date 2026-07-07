import { ManagedRuntime } from "effect";

import type { PlaybackEvent, PlaybackQueue } from "../domain";
import { FakeNativePlayerLayer } from "../fake-native-player";
import { addPlaybackEventListener } from "../native-player";
import { makePlaybackCommandRuntime } from "../playback-runtime";
import {
  getNextPlaybackTrackId,
  getPreviousPlaybackTrackId,
} from "../queue";

const queue: PlaybackQueue = {
  activeTrackId: "track-1",
  mode: {
    loop: false,
    shuffle: false,
  },
  tracks: [
    {
      durationMs: 120_000,
      id: "track-1",
      title: "First track",
      uri: "file://first.mp3",
    },
    {
      durationMs: 90_000,
      id: "track-2",
      title: "Second track",
      uri: "file://second.mp3",
    },
  ],
};

describe("FakeNativePlayerLayer", () => {
  it("runs serialized playback command flows", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: "track-1",
        mode: queue.mode,
        tracks: [queue.tracks[0]!],
      },
    });

    await player.runCommand({ _tag: "Play" });
    await player.runCommand({ _tag: "SeekTo", positionMs: 30_000 });
    const pausedState = await player.runCommand({ _tag: "Pause" });

    expect(pausedState.activeTrack?.id).toBe("track-1");
    expect(pausedState.positionMs).toBe(30_000);
    expect(pausedState.status).toBe("paused");

    await runtime.dispose();
  });

  it("clamps seeks to the active track duration", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: "track-1",
        mode: queue.mode,
        tracks: [queue.tracks[0]!],
      },
    });
    await player.runCommand({ _tag: "Play" });

    const clampedEndState = await player.runCommand({
      _tag: "SeekTo",
      positionMs: 999_999,
    });
    expect(clampedEndState.positionMs).toBe(120_000);

    const clampedStartState = await player.runCommand({
      _tag: "SeekTo",
      positionMs: -1,
    });
    expect(clampedStartState.positionMs).toBe(0);

    await runtime.dispose();
  });

  it("goes idle instead of playing without a track when skipping past the end", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        ...queue,
        activeTrackId: "track-2",
      },
    });
    const nextState = await player.runCommand({ _tag: "SkipNext" });

    expect(nextState.activeTrack).toBeNull();
    expect(nextState.queue.activeTrackId).toBeNull();
    expect(nextState.status).toBe("idle");

    await runtime.dispose();
  });

  it("emits state changes to listeners", async () => {
    const events: PlaybackEvent[] = [];
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);
    const subscription = await runtime.runPromise(
      addPlaybackEventListener((event) => {
        events.push(event);
      }),
    );

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: null,
        mode: queue.mode,
        tracks: [],
      },
    });

    subscription.remove();
    await runtime.dispose();
    expect(events).toHaveLength(1);
    expect(events[0]?._tag).toBe("StateChanged");
  });

  it("preserves playback position when loading queue metadata for the same active track", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: "track-1",
        mode: queue.mode,
        tracks: [queue.tracks[0]!],
      },
    });
    await player.runCommand({ _tag: "Play" });
    await player.runCommand({ _tag: "SeekTo", positionMs: 42_000 });

    const syncedState = await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: "track-1",
        mode: {
          loop: true,
          shuffle: false,
        },
        tracks: queue.tracks,
      },
    });

    expect(syncedState.activeTrack?.id).toBe("track-1");
    expect(syncedState.positionMs).toBe(42_000);
    expect(syncedState.queue.tracks).toHaveLength(2);
    expect(syncedState.queue.mode).toEqual({
      loop: true,
      shuffle: false,
    });
    expect(syncedState.status).toBe("playing");

    await runtime.dispose();
  });
});

describe("playback queue helpers", () => {
  it("returns the next track after the active track", () => {
    expect(getNextPlaybackTrackId(queue)).toBe("track-2");
  });

  it("returns null when the active track is the last track", () => {
    expect(
      getNextPlaybackTrackId({
        ...queue,
        activeTrackId: "track-2",
      }),
    ).toBeNull();
  });

  it("loops to the first track when loop mode is enabled", () => {
    expect(
      getNextPlaybackTrackId({
        ...queue,
        activeTrackId: "track-2",
        mode: {
          loop: true,
          shuffle: false,
        },
      }),
    ).toBe("track-1");
  });

  it("stores queue mode changes", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    const state = await player.runCommand({
      _tag: "SetQueueMode",
      mode: {
        loop: true,
        shuffle: true,
      },
    });

    expect(state.queue.mode).toEqual({
      loop: true,
      shuffle: true,
    });

    await runtime.dispose();
  });

  it("restarts the active track when previous is requested after the start", () => {
    expect(getPreviousPlaybackTrackId(queue)).toBe("track-1");
  });

  it("keeps the first track active when previous is requested at the queue start", () => {
    expect(
      getPreviousPlaybackTrackId({
        ...queue,
        activeTrackId: "track-1",
      }),
    ).toBe("track-1");
  });

  it("falls back to the first track when previous is requested without a known active track", () => {
    expect(
      getPreviousPlaybackTrackId({
        ...queue,
        activeTrackId: "missing-track",
      }),
    ).toBe("track-1");
  });
});
