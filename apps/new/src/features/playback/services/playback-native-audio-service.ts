import { setAudioModeAsync } from "expo-audio";

export const playbackAdAudio =
  require("../../../assets/audio/ad.mp3") as number;

export const configurePlaybackAudio = async () => {
  await setAudioModeAsync({
    allowsRecording: false,
    interruptionMode: "doNotMix",
    interruptionModeAndroid: "duckOthers",
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    shouldRouteThroughEarpiece: false,
  });
};
