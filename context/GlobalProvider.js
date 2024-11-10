import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Colors } from '@/constants/Colors';
import { getLogo } from '@/constants/Logos';
import { NotificationType, SongType } from '@/constants/Types';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);


const GlobalProvider = ({ children, initTheme, initPremium }) => {

  const [homeState, setHomeState] = useState(0);
  const [importState, setImportState] = useState(0);
  const [premium, setPremium] = useState(initPremium ? initPremium : false);
  const [results, setResults] = useState([]);
  const [exportDisabled, setExportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [editSong, setEditSong] = useState({});
  const [loading, setLoading] = useState(false);
  const [ip, setIP] = useState('0.0.0.0');
  const [transferSize, setTransferSize] = useState(0);
  const [transferProgress, setTransferProgress] = useState(0);
  const [serverStarted, setServerStarted] = useState(false);
  const [routesInitialized, setRoutesInitialized] = useState(false);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [selectEnabled, setSelectEnabled] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loadAnimInProgress, setLoadAnimInProgress] = useState(false);
  const [showSongOptions, setShowSongOptions] = useState(false);;
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
  const [shuffle, setShuffle] = useState(false);
  const [numModified, setNumModified] = useState(0);
  const [shouldSaveToLibrary, setShouldSaveToLibrary] = useState(true);

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
        importState, setImportState,
        premium, setPremium,
        results, setResults,
        exportDisabled, setExportDisabled,
        showDelete, setShowDelete,
        showEdit, setShowEdit,
        editSong, setEditSong,
        loading, setLoading,
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
        shuffle, setShuffle,
        numModified, setNumModified,
        shouldSaveToLibrary, setShouldSaveToLibrary,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );

};

export default GlobalProvider;