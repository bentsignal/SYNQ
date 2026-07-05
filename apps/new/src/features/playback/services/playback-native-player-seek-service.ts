import type { AudioPlayer } from "expo-audio";

export const seekPlaybackNativeLibraryPlayer = async ({
  libraryPlayer,
  position,
}: {
  libraryPlayer: AudioPlayer | null;
  position: number;
}) => {
  if (libraryPlayer) {
    await libraryPlayer.seekTo(position / 1000);
  }
};
