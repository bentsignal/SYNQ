import { SongType } from "@/src/constants/Types";
import {
  getPlayerArtworkUri,
  getPlayerBackgroundImage,
  getPlayerGradientOpacityForTrack,
  getPlayerSong,
  getPlayerTrackInfo,
} from "@/src/features/playback/lib/player-presentation-service";
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

export const usePlayerScreenState = () => {
  const track = useActiveTrack();
  const [assets, error] = useAssets([require("@/src/assets/images/popup.jpg")]);

  const [emptyImage, setEmptyImage] = useState<string>(EMPTY_IMAGE);
  const [song, setSong] = useState<SongType | null>(null);
  const [trackInfo, setTrackInfo] = useState(() => getPlayerTrackInfo(track));

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
    setTrackInfo(getPlayerTrackInfo(track));
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
      const currentSong = await getPlayerSong(track);

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
      const newGradientOpacity = await getPlayerGradientOpacityForTrack(track);

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

  const artworkUri = getPlayerArtworkUri(track);
  const backgroundImage = useMemo(() => {
    return getPlayerBackgroundImage({ emptyImage, track });
  }, [emptyImage, track]);

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
