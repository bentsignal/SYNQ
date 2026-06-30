import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type AppShellContextValue = {
  showOverlay: boolean;
  setShowOverlay: Dispatch<SetStateAction<boolean>>;
  showInfoModal: boolean;
  setShowInfoModal: Dispatch<SetStateAction<boolean>>;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const useAppShellContext = () => {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShellContext must be used within AppShellProvider");
  }

  return context;
};

export const AppShellProvider = ({ children }: PropsWithChildren) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const value = useMemo(
    () => ({
      showOverlay,
      setShowOverlay,
      showInfoModal,
      setShowInfoModal,
    }),
    [showInfoModal, showOverlay],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
};
