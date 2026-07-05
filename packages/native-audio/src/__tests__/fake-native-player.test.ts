import { ManagedRuntime } from "effect";

import type { PlaybackEvent } from "../domain";
import { FakeNativePlayerLayer } from "../fake-native-player";
import { addPlaybackEventListener } from "../native-player";
import { makePlaybackCommandRuntime } from "../playback-runtime";

describe("FakeNativePlayerLayer", () => {
  it("runs serialized playback command flows", async () => {
    const runtime = ManagedRuntime.make(FakeNativePlayerLayer());
    const player = makePlaybackCommandRuntime(runtime);

    await player.runCommand({
      _tag: "LoadQueue",
      queue: {
        activeTrackId: "track-1",
        tracks: [
          {
            durationMs: 120_000,
            id: "track-1",
            title: "First track",
            uri: "file://first.mp3",
          },
        ],
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
        tracks: [],
      },
    });

    subscription.remove();
    await runtime.dispose();
    expect(events).toHaveLength(1);
    expect(events[0]?._tag).toBe("StateChanged");
  });
});
