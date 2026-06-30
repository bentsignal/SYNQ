import React, {
  createContext,
  useContext,
  useState,
} from "react";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [editSong, setEditSong] = useState({});
  const [numModified, setNumModified] = useState(0);
  const [editPlaylist, setEditPlaylist] = useState({});
  const [editArtist, setEditArtist] = useState({});
  const [editAlbum, setEditAlbum] = useState({});

  return (
    <GlobalContext.Provider
      value={{
        editSong,
        setEditSong,
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
