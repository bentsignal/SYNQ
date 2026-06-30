import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SongType } from "@/src/constants/Types";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children, initShouldPlayAd }) => {
  const [homeState, setHomeState] = useState(0);
  const [importState, setImportState] = useState(0);
  const [results, setResults] = useState([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editSong, setEditSong] = useState({});
  const [loading, setLoading] = useState(false);
  const [ip, setIP] = useState("0.0.0.0");
  const [transferSize, setTransferSize] = useState(0);
  const [transferProgress, setTransferProgress] = useState(0);
  const [serverStarted, setServerStarted] = useState(false);
  const [routesInitialized, setRoutesInitialized] = useState(false);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [selectEnabled, setSelectEnabled] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
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
  const importSongSheet = useRef(null);
  const libraryPlaylistSheet = useRef(null);

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
        showDelete,
        setShowDelete,
        showEdit,
        setShowEdit,
        editSong,
        setEditSong,
        loading,
        setLoading,
        selectedId,
        setSelectedId,
        transferSize,
        setTransferSize,
        serverStarted,
        setServerStarted,
        routesInitialized,
        setRoutesInitialized,
        ip,
        setIP,
        wifiDisabled,
        setWifiDisabled,
        selectEnabled,
        setSelectEnabled,
        selectedSongs,
        setSelectedSongs,
        transferProgress,
        setTransferProgress,
        loadAnimInProgress,
        setLoadAnimInProgress,
        showSongOptions,
        setShowSongOptions,
        showOverlay,
        setShowOverlay,
        errorMessage,
        setErrorMessage,
        showInfoModal,
        setShowInfoModal,
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
        importSongSheet,
        libraryPlaylistSheet,
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
