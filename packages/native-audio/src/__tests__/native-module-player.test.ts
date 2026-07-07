import { toPlaybackEvent } from "../native-module-event-mapper";
import type { SynqNativeAudioPlaybackState } from "../SynqNativeAudio.types";

const state: SynqNativeAudioPlaybackState = {
  activeTrack: {
    durationMs: 30_000,
    id: "track-1",
    title: "Track one",
    uri: "file://track-one.mp3",
  },
  bufferedPositionMs: 10_000,
  durationMs: 30_000,
  playbackRate: 1,
  positionMs: 5_000,
  queue: {
    activeTrackId: "track-1",
    mode: {
      loop: false,
      shuffle: false,
    },
    tracks: [],
  },
  status: "playing",
};

describe("native module playback event mapping", () => {
  it("preserves an explicit null active track id for queue-ended remote commands", () => {
    expect(
      toPlaybackEvent({
        activeTrackId: null,
        command: "next",
        type: "RemoteCommand",
      }),
    ).toEqual({
      _tag: "RemoteCommand",
      activeTrackId: null,
      command: "next",
      positionMs: undefined,
    });
  });

  it("preserves remote command target track acknowledgements", () => {
    expect(
      toPlaybackEvent({
        activeTrackId: "track-2",
        command: "previous",
        type: "RemoteCommand",
      }),
    ).toEqual({
      _tag: "RemoteCommand",
      activeTrackId: "track-2",
      command: "previous",
      positionMs: undefined,
    });
  });

  it("preserves remote seek positions", () => {
    expect(
      toPlaybackEvent({
        command: "seek",
        positionMs: 15_000,
        type: "RemoteCommand",
      }),
    ).toEqual({
      _tag: "RemoteCommand",
      activeTrackId: undefined,
      command: "seek",
      positionMs: 15_000,
    });
  });

  it("maps native playback state changes", () => {
    expect(
      toPlaybackEvent({
        state,
        type: "StateChanged",
      }),
    ).toEqual({
      _tag: "StateChanged",
      state,
    });
  });

  it("drops unknown native remote commands instead of casting them", () => {
    expect(
      toPlaybackEvent({
        command: "unsupported-remote-command",
        type: "RemoteCommand",
      }),
    ).toBeNull();
  });
});
