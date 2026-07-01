import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { getTrackArtwork } from "@/src/features/playback/lib/track-factory";
import { getFileName } from "@/src/lib/util";
import { type Track } from "react-native-track-player";

const EMPTY_IMAGE = "transparent";
const EMPTY_COVER_STATE = {
  coverImage: "",
  emptyCover: true,
};

export const getMiniPlayerCoverState = async (trackId?: number | string) => {
  if (trackId === undefined) {
    return EMPTY_COVER_STATE;
  }

  try {
    const cover = await getLibrarySongCoverPath(Number(trackId));

    return {
      coverImage: cover ?? "",
      emptyCover: !cover,
    };
  } catch {
    return EMPTY_COVER_STATE;
  }
};

export const getMiniPlayerBackgroundImage = ({
  emptyImage,
  track,
}: {
  emptyImage: string;
  track?: Track;
}) => {
  if (!track) {
    return emptyImage;
  }

  const artwork = getTrackArtwork(track);
  if (artwork !== EMPTY_IMAGE) {
    return artwork;
  }

  return emptyImage;
};

export const getMiniPlayerTrackInfo = (track?: Track) => {
  return {
    artist: track?.artist,
    fileName: getFileName(track?.url),
    title: track?.title,
  };
};
