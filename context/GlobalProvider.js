import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [homeState, setHomeState] = useState(0);
  const [wifiResults, setWifiResults] = useState([]);
  const [results, setResults] = useState([]);
  const [importDisabled, setImportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSong, setDeleteSong] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSaveInst, setShowSaveInst] = useState(false);
  const [editSong, setEditSong] = useState({});
  const [editFilename, setEditFilename] = useState('');
  const [editID, setEditID] = useState('');
  const [editData, setEditData] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editArtwork, setEditArtwork] = useState('');
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editLoad, setEditLoad] = useState(false);
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
        
        wifiResults, 
        setWifiResults,
        importDisabled,
        setImportDisabled,
        showDelete, 
        setShowDelete,
        deleteSong,
        setDeleteSong,
        showEdit,
        setShowEdit,
        editSong,
        showWelcome,
        setShowWelcome,
        showSaveInst, 
        setShowSaveInst,
        transferPage,
        setTransferPage,
        
        // edit song 
        editLoad, setEditLoad,
        editFilename, setEditFilename,
        editID, setEditID,
        editData, setEditData,
        editTitle, setEditTitle,
        editArtist, setEditArtist,
        editAlbum, setEditAlbum,
        editArtwork, setEditArtwork,

        setEditSong,
        loading,
        setLoading,
        zipping, 
        setZipping,
        importing,
        setImporting
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider