import {
  getMiniPlayerBackgroundImage,
  getMiniPlayerCoverState,
  getMiniPlayerTrackInfo,
} from "@/src/features/playback/lib/mini-player-artwork-service";
import { useAssets } from "expo-asset";
import { useEffect, useMemo, useState } from "react";
import { useActiveTrack } from "react-native-track-player";

const EMPTY_IMAGE = "transparent";

export const useMiniPlayerArtwork = () => {
  const track = useActiveTrack();
  const trackId = track?.id;
  const [assets, error] = useAssets([require("@/src/assets/images/popup.jpg")]);

  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);
  const [emptyImage, setEmptyImage] = useState<string>(EMPTY_IMAGE);

  useEffect(() => {
    if (error || !assets?.[0]) {
      return;
    }

    setEmptyImage(assets[0].uri);
  }, [assets, error]);

  useEffect(() => {
    let cancelled = false;

    const loadCover = async () => {
      const coverState = await getMiniPlayerCoverState(trackId);
      if (cancelled) {
        return;
      }

      setCoverImage(coverState.coverImage);
      setEmptyCover(coverState.emptyCover);
    };

    void loadCover();

    return () => {
      cancelled = true;
    };
  }, [trackId]);

  const backgroundImage = useMemo(() => {
    return getMiniPlayerBackgroundImage({ emptyImage, track });
  }, [emptyImage, track]);
  const trackInfo = useMemo(() => getMiniPlayerTrackInfo(track), [track]);

  return {
    backgroundImage,
    coverImage,
    emptyCover,
    track,
    trackInfo,
  };
};
