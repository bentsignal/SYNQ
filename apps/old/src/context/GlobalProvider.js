import React, {
  createContext,
  useContext,
  useState,
} from "react";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [homeState, setHomeState] = useState(0);
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
  const [editPlaylist, setEditPlaylist] = useState({});
  const [editArtist, setEditArtist] = useState({});
  const [editAlbum, setEditAlbum] = useState({});

  return (
    <GlobalContext.Provider
      value={{
        homeState,
        setHomeState,
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
