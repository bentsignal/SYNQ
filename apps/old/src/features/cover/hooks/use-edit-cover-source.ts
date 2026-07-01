import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { CoverType } from "@/src/constants/Types";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { Animated } from "react-native";

export const transparentEditCoverSource =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC";

type UseEditCoverSourceOptions = {
  id?: number;
  image?: string;
  onLoad: () => void;
  type: CoverType;
};

export const useEditCoverSource = ({
  id,
  image,
  onLoad,
  type,
}: UseEditCoverSourceOptions) => {
  const opacityRef = useRef(new Animated.Value(0)).current;
  const [src, setSrc] = useState(image ? image : transparentEditCoverSource);
  const [loaded, setLoaded] = useState(false);

  const revealImage = useCallback(() => {
    Animated.timing(opacityRef, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [opacityRef]);

  const getImage = useCallback(async () => {
    try {
      if (image) {
        setSrc(image);
        revealImage();
        return;
      }

      if (id === undefined) {
        setSrc(transparentEditCoverSource);
        revealImage();
        return;
      }

      if (type === CoverType.SONG) {
        const path = await getLibrarySongCoverPath(id);
        setSrc(path ? path : transparentEditCoverSource);
      } else {
        setSrc(transparentEditCoverSource);
      }
      revealImage();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("folder")) {
        console.log("error getting cover image for edit cover:", message);
      }
      revealImage();
    }
  }, [id, image, revealImage, type]);

  useLayoutEffect(() => {
    void getImage();
  }, [getImage]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setSrc("");
    setLoaded(true);
    onLoad();
  }, [onLoad]);

  return {
    handleError,
    handleLoad,
    loaded,
    opacityRef,
    src,
  };
};
