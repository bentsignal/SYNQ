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
  const mountedRef = useRef(true);
  const loadVersionRef = useRef(0);
  const [src, setSrc] = useState(image ? image : transparentEditCoverSource);
  const [loaded, setLoaded] = useState(false);

  const revealImage = useCallback(() => {
    Animated.timing(opacityRef, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [opacityRef]);

  const showImage = useCallback(
    (nextSource: string, loadVersion: number) => {
      if (!mountedRef.current || loadVersion !== loadVersionRef.current) {
        return;
      }

      setSrc(nextSource);
      revealImage();
    },
    [revealImage],
  );

  const showFallbackImage = useCallback(
    (loadVersion: number) => {
      showImage(transparentEditCoverSource, loadVersion);
    },
    [showImage],
  );

  const getImage = useCallback(async (loadVersion: number) => {
    try {
      if (image) {
        showImage(image, loadVersion);
        return;
      }

      if (id === undefined) {
        showFallbackImage(loadVersion);
        return;
      }

      if (type === CoverType.SONG) {
        const path = await getLibrarySongCoverPath(id);
        showImage(path ? path : transparentEditCoverSource, loadVersion);
      } else {
        showFallbackImage(loadVersion);
      }
    } catch {
      showFallbackImage(loadVersion);
    }
  }, [id, image, showFallbackImage, showImage, type]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    loadVersionRef.current += 1;
    const loadVersion = loadVersionRef.current;
    void getImage(loadVersion);

    return () => {
      mountedRef.current = false;
    };
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
