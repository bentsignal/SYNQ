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
import type { SongType } from "@/src/constants/Types";

type ImportFlowContextValue = {
  homeState: number;
  setHomeState: Dispatch<SetStateAction<number>>;
  results: SongType[];
  setResults: Dispatch<SetStateAction<SongType[]>>;
  exportDisabled: boolean;
  setExportDisabled: Dispatch<SetStateAction<boolean>>;
  selectedId: string | number;
  setSelectedId: Dispatch<SetStateAction<string | number>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  ip: string;
  setIP: Dispatch<SetStateAction<string>>;
  transferSize: number;
  setTransferSize: Dispatch<SetStateAction<number>>;
  transferProgress: number;
  setTransferProgress: Dispatch<SetStateAction<number>>;
  wifiDisabled: boolean;
  setWifiDisabled: Dispatch<SetStateAction<boolean>>;
  loadAnimInProgress: boolean;
  setLoadAnimInProgress: Dispatch<SetStateAction<boolean>>;
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
  const [homeState, setHomeState] = useState(0);
  const [results, setResults] = useState<SongType[]>([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [loading, setLoading] = useState(false);
  const [ip, setIP] = useState("0.0.0.0");
  const [transferSize, setTransferSize] = useState(0);
  const [transferProgress, setTransferProgress] = useState(0);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [importState, setImportState] = useState(0);
  const [shouldSaveToLibrary, setShouldSaveToLibrary] = useState(true);
  const [importFinishRequest, setImportFinishRequest] = useState(0);

  const requestImportFinish = useCallback(() => {
    setImportFinishRequest((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      homeState,
      setHomeState,
      results,
      setResults,
      exportDisabled,
      setExportDisabled,
      selectedId,
      setSelectedId,
      loading,
      setLoading,
      ip,
      setIP,
      transferSize,
      setTransferSize,
      transferProgress,
      setTransferProgress,
      wifiDisabled,
      setWifiDisabled,
      loadAnimInProgress,
      setLoadAnimInProgress,
      importState,
      setImportState,
      shouldSaveToLibrary,
      setShouldSaveToLibrary,
      importFinishRequest,
      requestImportFinish,
    }),
    [
      homeState,
      results,
      exportDisabled,
      selectedId,
      loading,
      ip,
      transferSize,
      transferProgress,
      wifiDisabled,
      loadAnimInProgress,
      importState,
      shouldSaveToLibrary,
      importFinishRequest,
      requestImportFinish,
    ],
  );

  return (
    <ImportFlowContext.Provider value={value}>
      {children}
    </ImportFlowContext.Provider>
  );
};
