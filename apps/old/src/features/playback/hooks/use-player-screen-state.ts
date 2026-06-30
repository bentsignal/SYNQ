import { PageType, SongType } from "@/src/constants/Types";
import {
  getLuminanceFromImage,
  getPlayerGradientOpacity,
} from "@/src/lib/color-utils";
import { getLibrarySongById } from "@/src/features/library/repository/library-song-repository";
import { getTrackArtwork } from "@/src/features/playback/lib/track-factory";
import { getFileName } from "@/src/lib/util";
import { useAssets } from "expo-asset";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useActiveTrack } from "react-native-track-player";

const EMPTY_IMAGE = "transparent";
const BASE_GRADIENT_OPACITY = 0.2;

const getTrackInfo = (track: ReturnType<typeof useActiveTrack>) => ({
  artist: track?.artist || "",
  fileName: getFileName(track?.url),
  title: track?.title || "",
});

export const usePlayerScreenState = () => {
  const track = useActiveTrack();
  const [assets, error] = useAssets([require("@/src/assets/images/popup.jpg")]);

  const [emptyImage, setEmptyImage] = useState<string>(EMPTY_IMAGE);
  const [song, setSong] = useState<SongType | null>(null);
  const [trackInfo, setTrackInfo] = useState(() => getTrackInfo(track));

  const containerOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0.4);
  const infoOpacity = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));
  const infoStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    flex: 1,
  }));

  useEffect(() => {
    if (error || !assets?.[0]) {
      return;
    }

    setEmptyImage(assets[0].uri);
  }, [assets, error]);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.quad),
    });
  }, [containerOpacity]);

  const updateTrackInfo = useCallback(() => {
    setTrackInfo(getTrackInfo(track));
    infoOpacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.inOut(Easing.quad),
    });
  }, [infoOpacity, track]);

  useEffect(() => {
    infoOpacity.value = withTiming(
      0,
      { duration: 250, easing: Easing.inOut(Easing.quad) },
      () => {
        runOnJS(updateTrackInfo)();
      },
    );
  }, [infoOpacity, track, updateTrackInfo]);

  useEffect(() => {
    let cancelled = false;

    const hydrateSong = async () => {
      if (track === undefined) {
        setSong(null);
        return;
      }

      const currentSong = await getLibrarySongById(
        Number(track.id),
        PageType.PLAYER,
      );

      if (!cancelled) {
        setSong(currentSong);
      }
    };

    void hydrateSong();

    return () => {
      cancelled = true;
    };
  }, [track]);

  useEffect(() => {
    let cancelled = false;

    const setGradientOpacity = async () => {
      let newGradientOpacity = BASE_GRADIENT_OPACITY;

      if (track && typeof track.artwork === "string") {
        try {
          const luminance = await getLuminanceFromImage(track.artwork);
          newGradientOpacity = getPlayerGradientOpacity(luminance);
        } catch (error) {
          console.log(error);
        }
      }

      if (!cancelled) {
        gradientOpacity.value = withTiming(newGradientOpacity, {
          duration: 500,
          easing: Easing.inOut(Easing.quad),
        });
      }
    };

    void setGradientOpacity();

    return () => {
      cancelled = true;
    };
  }, [gradientOpacity, track]);

  const artworkUri = getTrackArtwork(track);
  const backgroundImage = useMemo(() => {
    if (artworkUri !== EMPTY_IMAGE) {
      return artworkUri;
    }

    return emptyImage;
  }, [artworkUri, emptyImage]);

  return {
    artworkUri,
    backgroundImage,
    containerStyle,
    gradientStyle,
    infoStyle,
    song,
    trackInfo,
  };
};
