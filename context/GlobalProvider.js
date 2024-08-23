import React, { createContext, useContext, useState, useEffect } from 'react'
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);


const GlobalProvider = ({ children, initTheme }) => {

  useEffect(() => {
    if (initTheme !== '') {
      setTheme(initTheme);
    }
  }, [initTheme]);

  const [homeState, setHomeState] = useState(0);
  const [premium, setPremium] = useState(false);
  const [wifiResults, setWifiResults] = useState([]);
  const [results, setResults] = useState([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSong, setDeleteSong] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSaveInst, setShowSaveInst] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [editSong, setEditSong] = useState({});
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [ip, setIP] = useState('0.0.0.0');
  const [transferSize, setTransferSize] = useState(0);
  const [transferProgress, setTransferProgress] = useState(0);
  const [serverStarted, setServerStarted] = useState(false);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [selectEnabled, setSelectEnabled] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [transferPage, setTransferPage] = useState('<html><body><p>ERROR: Could not load page</p></body></html>');
  const [showOverlay, setShowOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState(initTheme ? initTheme : Colors.main);

  return (
    <GlobalContext.Provider
      value={{
        homeState, setHomeState,
        premium, setPremium,
        results, setResults,
        wifiResults, setWifiResults,
        exportDisabled, setExportDisabled,
        showDelete, setShowDelete,
        deleteSong, setDeleteSong,
        showEdit, setShowEdit,
        editSong, setEditSong,
        showWelcome, setShowWelcome,
        showSaveInst, setShowSaveInst,
        transferPage, setTransferPage,
        loading, setLoading,
        zipping, setZipping,
        importing, setImporting,
        selectedId, setSelectedId,
        transferSize, setTransferSize,
        serverStarted, setServerStarted,
        ip, setIP,
        wifiDisabled, setWifiDisabled,
        selectEnabled, setSelectEnabled,
        selectedSongs, setSelectedSongs,
        transferProgress, setTransferProgress,
        loadAnimInProgress, setLoadAnimInProgress,
        showSongOptions, setShowSongOptions,
        showOverlay, setShowOverlay,
        errorMessage, setErrorMessage,
        theme, setTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );

};

export default GlobalProvider;