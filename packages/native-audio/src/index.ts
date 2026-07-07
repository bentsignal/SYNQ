// Reexport the native module. On web, it will be resolved to SynqNativeAudioModule.web.ts
// and on native platforms to SynqNativeAudioModule.ts
export { default } from "./SynqNativeAudioModule";
export * from "./domain";
export * from "./fake-native-player";
export * from "./native-module-player";
export * from "./native-player";
export * from "./playback-runtime";
export * from "./queue";
export * from "./SynqNativeAudio.types";
