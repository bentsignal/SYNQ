import { PageType } from "@/src/constants/Types";
import { getLibrarySongById } from "@/src/features/library/repository/library-song-repository";
import { getTrackArtwork } from "@/src/features/playback/lib/track-factory";
import {
  getLuminanceFromImage,
  getPlayerGradientOpacity,
} from "@/src/lib/color-utils";
import { getFileName } from "@/src/lib/util";
import { Track } from "react-native-track-player";

const EMPTY_IMAGE = "transparent";
const BASE_GRADIENT_OPACITY = 0.2;

export const getPlayerTrackInfo = (track?: Track) => ({
  artist: track?.artist || "",
  fileName: getFileName(track?.url),
  title: track?.title || "",
});

export const getPlayerSong = (track?: Track) => {
  if (track === undefined) {
    return null;
  }

  return getLibrarySongById(Number(track.id), PageType.PLAYER);
};

export const getPlayerArtworkUri = (track?: Track) => getTrackArtwork(track);

export const getPlayerBackgroundImage = ({
  emptyImage,
  track,
}: {
  emptyImage: string;
  track?: Track;
}) => {
  const artworkUri = getPlayerArtworkUri(track);

  if (artworkUri !== EMPTY_IMAGE) {
    return artworkUri;
  }

  return emptyImage;
};

export const getPlayerGradientOpacityForTrack = async (track?: Track) => {
  if (!track || typeof track.artwork !== "string") {
    return BASE_GRADIENT_OPACITY;
  }

  try {
    const luminance = await getLuminanceFromImage(track.artwork);
    return getPlayerGradientOpacity(luminance);
  } catch (error) {
    console.log(error);
    return BASE_GRADIENT_OPACITY;
  }
};
