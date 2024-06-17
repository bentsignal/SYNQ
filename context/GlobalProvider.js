import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [homeState, setHomeState] = useState(0);
  const [fileResults, setFileResults] = useState([]);
  const [importDisabled, setImportDisabled] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSong, setDeleteSong] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [editSong, setEditSong] = useState({});
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editArtwork, setEditArtwork] = useState('');
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [importing, setImporting] = useState(false);
  return (
    <GlobalContext.Provider
      value={{
        homeState,
        setHomeState,
        fileResults,
        setFileResults,
        importDisabled,
        setImportDisabled,
        showDelete, 
        setShowDelete,
        deleteSong,
        setDeleteSong,
        showEdit,
        setShowEdit,
        editSong,
        
        // edit song modal
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