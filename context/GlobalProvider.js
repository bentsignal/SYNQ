import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Colors } from '@/constants/Colors';
import { getLogo } from '@/constants/Logos';
import { NotificationType, SongType } from '@/constants/Types';
import { fetchMoreSongs, getSongById, getNextValidSong } from '@/lib/SongManager';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);


const GlobalProvider = ({ children, initTheme, initPremium }) => {

  const [homeState, setHomeState] = useState(0);
  const [premium, setPremium] = useState(initPremium ? initPremium : false);
  const [wifiResults, setWifiResults] = useState([]);
  const [results, setResults] = useState([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
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
  const [routesInitialized, setRoutesInitialized] = useState(false);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [selectEnabled, setSelectEnabled] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [transferPage, setTransferPage] = useState('<html><body><p>ERROR: Could not load page</p></body></html>');
  const [showOverlay, setShowOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState(initTheme ? initTheme : Colors.main);
  const [logo, setLogo] = useState(require('@/assets/logo/logo-blue.png'));
  const [haptic, setHaptic] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationType, setNotificationType] = useState(NotificationType.GENERAL);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTrace, setNotificationTrace] = useState('');
  const [showGlobalLoading, setShowGlobalLoading] = useState(false);
  const [showGlobalProgress, setShowGlobalProgress] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [songPlaying, setSongPlaying] = useState(null);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [history, setHistory] = useState([]);
  const [queue, setQueue] = useState([]);
  const [nextUp, setNextUp] = useState([]);
  const [rewind, setRewind] = useState(false);
  const [numModified, setNumModified] = useState(0);

  useEffect(() => {
    if (initTheme !== '') {
      setTheme(initTheme);
      setLogo(getLogo(initTheme));
    }
  }, [initTheme]);

  useEffect(() => {
    setPremium(initPremium);
  }, [initPremium]);

  const addNotification = useCallback((type, title, brief, message, trace, onClick ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, title, brief, message, trace, onClick }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        homeState, setHomeState,
        premium, setPremium,
        results, setResults,
        wifiResults, setWifiResults,
        exportDisabled, setExportDisabled,
        showDelete, setShowDelete,
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
        routesInitialized, setRoutesInitialized,
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
        logo, setLogo,
        haptic, setHaptic,
        showInfoModal, setShowInfoModal,
        notifications, setNotifications,
        notificationType, setNotificationType,
        notificationTitle, setNotificationTitle,
        notificationMessage, setNotificationMessage,
        showNotificationModal, setShowNotificationModal,
        notificationTrace, setNotificationTrace,
        addNotification, removeNotification,
        showGlobalLoading, setShowGlobalLoading,
        showGlobalProgress, setShowGlobalProgress,
        globalProgress, setGlobalProgress,
        songPlaying, setSongPlaying,
        paused, setPaused,
        duration, setDuration,
        currentTime, setCurrentTime,
        sound, setSound,
        shuffle, setShuffle,
        history, setHistory,
        queue, setQueue,
        nextUp, setNextUp,
        rewind, setRewind,
        numModified, setNumModified,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );

};

export default GlobalProvider;