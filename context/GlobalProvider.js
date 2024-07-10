import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {

  const [homeState, setHomeState] = useState(0);
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
  const [editLoad, setEditLoad] = useState(false);
  const [ip, setIP] = useState('0.0.0.0')
  const [transferSize, setTransferSize] = useState(0);
  const [serverStarted, setServerStarted] = useState(false);
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [transferPage, setTransferPage] = useState('<html><body><p>ERROR: Could not load page</p></body></html>');

  return (
    <GlobalContext.Provider
      value={{

        // home page state, between values 
        homeState,
        setHomeState,

        // song data during import phase
        results,
        setResults,
        
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
        wifiDisabled, setWifiDisabled
      }}
    >
      {children}
    </GlobalContext.Provider>
  );

};

export default GlobalProvider