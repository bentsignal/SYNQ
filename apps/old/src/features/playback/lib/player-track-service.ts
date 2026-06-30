import { getAppIcon } from "@/src/constants/Logos";
import { playTrackNow } from "@/src/features/playback/lib/player-queue-actions-service";

export { getTrackArtwork, getTrackFromSong } from "./track-factory";

export const playAd = async (theme: string, adURL: string) => {
  const adTrack = {
    id: -2,
    url: adURL,
    title: "Premium Ad",
    artist: "SYNQ",
    artwork: getAppIcon(theme),
  };
  await playTrackNow(adTrack);
};
