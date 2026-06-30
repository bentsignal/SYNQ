import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ImportFlowContextValue = {
  importState: number;
  setImportState: Dispatch<SetStateAction<number>>;
  shouldSaveToLibrary: boolean;
  setShouldSaveToLibrary: Dispatch<SetStateAction<boolean>>;
  importFinishRequest: number;
  requestImportFinish: () => void;
};

const ImportFlowContext = createContext<ImportFlowContextValue | null>(null);

export const useImportFlowContext = () => {
  const context = useContext(ImportFlowContext);

  if (!context) {
    throw new Error(
      "useImportFlowContext must be used within ImportFlowProvider",
    );
  }

  return context;
};

export const ImportFlowProvider = ({ children }: PropsWithChildren) => {
  const [importState, setImportState] = useState(0);
  const [shouldSaveToLibrary, setShouldSaveToLibrary] = useState(true);
  const [importFinishRequest, setImportFinishRequest] = useState(0);

  const requestImportFinish = useCallback(() => {
    setImportFinishRequest((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      importState,
      setImportState,
      shouldSaveToLibrary,
      setShouldSaveToLibrary,
      importFinishRequest,
      requestImportFinish,
    }),
    [importState, shouldSaveToLibrary, importFinishRequest, requestImportFinish],
  );

  return (
    <ImportFlowContext.Provider value={value}>
      {children}
    </ImportFlowContext.Provider>
  );
};
