import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type GlobalProgressContextValue = {
  showGlobalLoading: boolean;
  setShowGlobalLoading: Dispatch<SetStateAction<boolean>>;
  showGlobalProgress: boolean;
  setShowGlobalProgress: Dispatch<SetStateAction<boolean>>;
  globalProgress: number;
  setGlobalProgress: Dispatch<SetStateAction<number>>;
  showImportAd: boolean;
  setShowImportAd: Dispatch<SetStateAction<boolean>>;
};

const GlobalProgressContext =
  createContext<GlobalProgressContextValue | null>(null);

export const useGlobalProgressContext = () => {
  const context = useContext(GlobalProgressContext);

  if (!context) {
    throw new Error(
      "useGlobalProgressContext must be used within GlobalProgressProvider",
    );
  }

  return context;
};

export const GlobalProgressProvider = ({ children }: PropsWithChildren) => {
  const [showGlobalLoading, setShowGlobalLoading] = useState(false);
  const [showGlobalProgress, setShowGlobalProgress] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [showImportAd, setShowImportAd] = useState(false);

  const value = useMemo(
    () => ({
      showGlobalLoading,
      setShowGlobalLoading,
      showGlobalProgress,
      setShowGlobalProgress,
      globalProgress,
      setGlobalProgress,
      showImportAd,
      setShowImportAd,
    }),
    [globalProgress, showGlobalLoading, showGlobalProgress, showImportAd],
  );

  return (
    <GlobalProgressContext.Provider value={value}>
      {children}
    </GlobalProgressContext.Provider>
  );
};
