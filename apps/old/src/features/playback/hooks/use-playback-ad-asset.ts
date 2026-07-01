import { useEffect } from "react";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { useAssets } from "expo-asset";

export const usePlaybackAdAsset = () => {
  const { setAdURL } = usePlaybackAdContext();

  const [assets, error] = useAssets([require("@/src/assets/audio/ad.mp3")]);

  useEffect(() => {
    if (error) {
      return;
    }
    if (assets) {
      setAdURL(assets[0].uri);
    }
  }, [assets, error, setAdURL]);
};
