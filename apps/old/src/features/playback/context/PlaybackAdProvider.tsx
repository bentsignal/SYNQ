import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type PlaybackAdContextValue = {
  adPlaying: boolean;
  setAdPlaying: Dispatch<SetStateAction<boolean>>;
  adURL: string;
  setAdURL: Dispatch<SetStateAction<string>>;
  shouldPlayAd: boolean;
  setShouldPlayAd: Dispatch<SetStateAction<boolean>>;
};

type PlaybackAdProviderProps = PropsWithChildren<{
  initShouldPlayAd?: boolean;
}>;

const PlaybackAdContext = createContext<PlaybackAdContextValue | null>(null);

export const usePlaybackAdContext = () => {
  const context = useContext(PlaybackAdContext);

  if (!context) {
    throw new Error(
      "usePlaybackAdContext must be used within PlaybackAdProvider",
    );
  }

  return context;
};

export const PlaybackAdProvider = ({
  children,
  initShouldPlayAd = false,
}: PlaybackAdProviderProps) => {
  const [adPlaying, setAdPlaying] = useState(false);
  const [adURL, setAdURL] = useState("");
  const [shouldPlayAd, setShouldPlayAd] = useState(initShouldPlayAd);

  useEffect(() => {
    setShouldPlayAd(initShouldPlayAd);
  }, [initShouldPlayAd]);

  const value = useMemo(
    () => ({
      adPlaying,
      setAdPlaying,
      adURL,
      setAdURL,
      shouldPlayAd,
      setShouldPlayAd,
    }),
    [adPlaying, adURL, shouldPlayAd],
  );

  return (
    <PlaybackAdContext.Provider value={value}>
      {children}
    </PlaybackAdContext.Provider>
  );
};
