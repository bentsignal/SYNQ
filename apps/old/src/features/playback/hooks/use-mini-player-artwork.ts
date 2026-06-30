import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { getTrackArtwork } from "@/src/features/playback/lib/track-factory";
import { useAssets } from "expo-asset";
import { useEffect, useMemo, useState } from "react";
import { useActiveTrack } from "react-native-track-player";

const EMPTY_IMAGE = "transparent";

export const useMiniPlayerArtwork = () => {
  const track = useActiveTrack();
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
      try {
        if (track?.id === undefined) {
          if (!cancelled) {
            setCoverImage("");
            setEmptyCover(true);
          }
          return;
        }

        const cover = await getLibrarySongCoverPath(Number(track.id));
        if (cancelled) {
          return;
        }

        setCoverImage(cover ?? "");
        setEmptyCover(!cover);
      } catch (error) {
        console.log("error loading song cover:", error);
      }
    };

    void loadCover();

    return () => {
      cancelled = true;
    };
  }, [track?.id]);

  const backgroundImage = useMemo(() => {
    if (!track) {
      return emptyImage;
    }

    const artwork = getTrackArtwork(track);
    if (artwork !== EMPTY_IMAGE) {
      return artwork;
    }

    return emptyImage;
  }, [emptyImage, track]);

  return {
    backgroundImage,
    coverImage,
    emptyCover,
    track,
  };
};
