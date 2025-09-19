import { ImageRequireSource } from "react-native";

export type CoverType = "song" | "playlist" | "album" | "artist";

export const defaultCoverIcons = {
  song: require("@/src/assets/icons/music.png"),
  playlist: require("@/src/assets/icons/cassette-tape.png"),
  album: require("@/src/assets/icons/cd-drive.png"),
  artist: require("@/src/assets/icons/user.png"),
} as Record<CoverType, ImageRequireSource>;
