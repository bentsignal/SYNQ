import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children, initShouldPlayAd }) => {
  const [homeState, setHomeState] = useState(0);
  const [importState, setImportState] = useState(0);
  const [results, setResults] = useState([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [editSong, setEditSong] = useState({});
  const [loading, setLoading] = useState(false);
  const [ip, setIP] = useState("0.0.0.0");
  const [transferSize, setTransferSize] = useState(0);
  const [transferProgress, setTransferProgress] = useState(0);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [numModified, setNumModified] = useState(0);
  const [shouldSaveToLibrary, setShouldSaveToLibrary] = useState(true);
  const [importFinishRequest, setImportFinishRequest] = useState(0);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adURL, setAdURL] = useState("");
  const [shouldPlayAd, setShouldPlayAd] = useState(
    initShouldPlayAd ? true : false,
  );
  const [editPlaylist, setEditPlaylist] = useState({});
  const [editArtist, setEditArtist] = useState({});
  const [editAlbum, setEditAlbum] = useState({});

  useEffect(() => {
    setShouldPlayAd(initShouldPlayAd ? true : false);
  }, [initShouldPlayAd]);

  const requestImportFinish = useCallback(() => {
    setImportFinishRequest((value) => value + 1);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        homeState,
        setHomeState,
        importState,
        setImportState,
        results,
        setResults,
        exportDisabled,
        setExportDisabled,
        editSong,
        setEditSong,
        loading,
        setLoading,
        selectedId,
        setSelectedId,
        transferSize,
        setTransferSize,
        ip,
        setIP,
        wifiDisabled,
        setWifiDisabled,
        transferProgress,
        setTransferProgress,
        loadAnimInProgress,
        setLoadAnimInProgress,
        numModified,
        setNumModified,
        shouldSaveToLibrary,
        setShouldSaveToLibrary,
        importFinishRequest,
        requestImportFinish,
        adPlaying,
        setAdPlaying,
        adURL,
        setAdURL,
        shouldPlayAd,
        setShouldPlayAd,
        editPlaylist,
        setEditPlaylist,
        editArtist,
        setEditArtist,
        editAlbum,
        setEditAlbum,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
